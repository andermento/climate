#!/usr/bin/env python3
"""
Script para migrar dados do PostgreSQL local para Supabase.

Este script:
1. Le os dados dos CSVs originais
2. Processa e transforma os dados
3. Carrega no Supabase

Uso:
    python scripts/migrate-to-supabase.py

Requisitos:
    pip install pandas supabase python-dotenv tqdm
"""

import os
import sys
from pathlib import Path
from datetime import datetime
import pandas as pd
from dotenv import load_dotenv
from tqdm import tqdm

# Carregar variaveis de ambiente
load_dotenv()

# Configuracoes Supabase
SUPABASE_URL = os.getenv('SUPABASE_URL') or os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

# Caminho para os dados
DATA_DIR = Path(__file__).parent.parent.parent / 'data' / 'raw'

# Arquivos CSV
CSV_FILES = {
    'global': 'GlobalTemperatures.csv',
    'country': 'GlobalLandTemperaturesByCountry.csv',
    'state': 'GlobalLandTemperaturesByState.csv',
    'major_city': 'GlobalLandTemperaturesByMajorCity.csv',
    'city': 'GlobalLandTemperaturesByCity.csv',
}

def parse_coordinate(coord_str):
    """Converte coordenada string (ex: '57.05N') para float."""
    if pd.isna(coord_str) or not coord_str:
        return None

    coord_str = str(coord_str).strip()
    if not coord_str:
        return None

    direction = coord_str[-1].upper()
    value = float(coord_str[:-1])

    if direction in ('S', 'W'):
        value = -value

    return value

def get_hemisphere(coord, coord_type):
    """Determina o hemisferio baseado na coordenada."""
    if coord is None:
        return None

    if coord_type == 'lat':
        return 'N' if coord >= 0 else 'S'
    else:  # lon
        return 'E' if coord >= 0 else 'W'

def create_date_dimension(df):
    """Cria a dimensao de data a partir dos dados."""
    dates = df['dt'].dropna().unique()
    dates = pd.to_datetime(dates)

    date_dim = pd.DataFrame({
        'full_date': dates,
        'year': [d.year for d in dates],
        'month': [d.month for d in dates],
        'month_name': [d.strftime('%B') for d in dates],
        'quarter': [(d.month - 1) // 3 + 1 for d in dates],
        'decade': [(d.year // 10) * 10 for d in dates],
        'century': [(d.year // 100) + 1 for d in dates],
        'is_modern_era': [d.year >= 1850 for d in dates],
    })

    date_dim = date_dim.drop_duplicates(subset=['full_date'])
    date_dim = date_dim.sort_values('full_date')
    date_dim['date_id'] = range(1, len(date_dim) + 1)

    return date_dim

def create_location_dimension(dfs):
    """Cria a dimensao de localizacao a partir dos dados."""
    locations = []

    # Global
    locations.append({
        'granularity': 'global',
        'city': None,
        'state': None,
        'country': None,
        'latitude': None,
        'longitude': None,
        'latitude_raw': None,
        'longitude_raw': None,
        'hemisphere_ns': None,
        'hemisphere_ew': None,
    })

    # Paises
    if 'country' in dfs:
        df = dfs['country']
        for _, row in df[['Country']].drop_duplicates().iterrows():
            locations.append({
                'granularity': 'country',
                'city': None,
                'state': None,
                'country': row['Country'],
                'latitude': None,
                'longitude': None,
                'latitude_raw': None,
                'longitude_raw': None,
                'hemisphere_ns': None,
                'hemisphere_ew': None,
            })

    # Estados
    if 'state' in dfs:
        df = dfs['state']
        for _, row in df[['State', 'Country']].drop_duplicates().iterrows():
            locations.append({
                'granularity': 'state',
                'city': None,
                'state': row['State'],
                'country': row['Country'],
                'latitude': None,
                'longitude': None,
                'latitude_raw': None,
                'longitude_raw': None,
                'hemisphere_ns': None,
                'hemisphere_ew': None,
            })

    # Cidades principais
    if 'major_city' in dfs:
        df = dfs['major_city']
        cols = ['City', 'Country', 'Latitude', 'Longitude']
        for _, row in df[cols].drop_duplicates().iterrows():
            lat = parse_coordinate(row['Latitude'])
            lon = parse_coordinate(row['Longitude'])
            locations.append({
                'granularity': 'major_city',
                'city': row['City'],
                'state': None,
                'country': row['Country'],
                'latitude': lat,
                'longitude': lon,
                'latitude_raw': row['Latitude'],
                'longitude_raw': row['Longitude'],
                'hemisphere_ns': get_hemisphere(lat, 'lat'),
                'hemisphere_ew': get_hemisphere(lon, 'lon'),
            })

    # Todas as cidades (amostra para evitar exceder limites)
    if 'city' in dfs:
        df = dfs['city']
        # Pegar amostra de 1000 cidades
        cols = ['City', 'Country', 'Latitude', 'Longitude']
        sample = df[cols].drop_duplicates().sample(n=min(1000, len(df)), random_state=42)
        for _, row in sample.iterrows():
            lat = parse_coordinate(row['Latitude'])
            lon = parse_coordinate(row['Longitude'])
            locations.append({
                'granularity': 'city',
                'city': row['City'],
                'state': None,
                'country': row['Country'],
                'latitude': lat,
                'longitude': lon,
                'latitude_raw': row['Latitude'],
                'longitude_raw': row['Longitude'],
                'hemisphere_ns': get_hemisphere(lat, 'lat'),
                'hemisphere_ew': get_hemisphere(lon, 'lon'),
            })

    location_dim = pd.DataFrame(locations)
    location_dim = location_dim.drop_duplicates(subset=['granularity', 'city', 'state', 'country'])
    location_dim['location_id'] = range(1, len(location_dim) + 1)

    return location_dim

def load_csv_files():
    """Carrega os arquivos CSV."""
    dfs = {}

    for key, filename in CSV_FILES.items():
        filepath = DATA_DIR / filename
        if filepath.exists():
            print(f"Loading {filename}...")
            dfs[key] = pd.read_csv(filepath)
            print(f"  Loaded {len(dfs[key])} rows")
        else:
            print(f"  Warning: {filename} not found")

    return dfs

def upload_to_supabase(supabase, table_name, data, batch_size=500):
    """Faz upload dos dados para o Supabase em batches."""
    total = len(data)

    for i in tqdm(range(0, total, batch_size), desc=f"Uploading {table_name}"):
        batch = data[i:i + batch_size]
        try:
            supabase.table(table_name).insert(batch).execute()
        except Exception as e:
            print(f"Error uploading batch {i // batch_size}: {e}")

def main():
    """Funcao principal."""
    print("=" * 60)
    print("Climate Data Migration to Supabase")
    print("=" * 60)

    # Verificar credenciais
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("\nError: Supabase credentials not found!")
        print("Please set the following environment variables:")
        print("  - SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL")
        print("  - SUPABASE_SERVICE_ROLE_KEY")
        print("\nYou can add them to a .env file in the climate-web directory.")
        sys.exit(1)

    print(f"\nSupabase URL: {SUPABASE_URL[:30]}...")
    print(f"Data directory: {DATA_DIR}")

    # Verificar se diretorio de dados existe
    if not DATA_DIR.exists():
        print(f"\nError: Data directory not found: {DATA_DIR}")
        sys.exit(1)

    # Importar supabase
    try:
        from supabase import create_client
    except ImportError:
        print("\nError: supabase package not installed")
        print("Run: pip install supabase")
        sys.exit(1)

    # Criar cliente Supabase
    print("\nConnecting to Supabase...")
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Carregar CSVs
    print("\n" + "-" * 40)
    print("Loading CSV files...")
    dfs = load_csv_files()

    if not dfs:
        print("No data files found!")
        sys.exit(1)

    # Criar dimensoes
    print("\n" + "-" * 40)
    print("Creating dimensions...")

    # Combinar todos os dataframes para criar dimensao de data
    all_dfs = pd.concat([df for df in dfs.values() if 'dt' in df.columns])
    date_dim = create_date_dimension(all_dfs)
    print(f"  Date dimension: {len(date_dim)} records")

    location_dim = create_location_dimension(dfs)
    print(f"  Location dimension: {len(location_dim)} records")

    # Upload para Supabase
    print("\n" + "-" * 40)
    print("Uploading to Supabase...")

    # Upload dimensao de data
    date_records = date_dim.to_dict('records')
    upload_to_supabase(supabase, 'dim_date', date_records)

    # Upload dimensao de localizacao
    location_records = location_dim.to_dict('records')
    upload_to_supabase(supabase, 'dim_location', location_records)

    # Criar mapeamentos para FKs
    date_map = dict(zip(date_dim['full_date'].astype(str), date_dim['date_id']))
    location_map = {}
    for _, row in location_dim.iterrows():
        key = (row['granularity'], row['city'], row['state'], row['country'])
        location_map[key] = row['location_id']

    # Processar e fazer upload dos fatos
    print("\n" + "-" * 40)
    print("Processing and uploading fact table...")

    fact_records = []

    # Global temperatures
    if 'global' in dfs:
        df = dfs['global']
        global_loc_id = location_map[('global', None, None, None)]
        for _, row in df.iterrows():
            date_str = str(row['dt'])[:10]
            if date_str in date_map:
                fact_records.append({
                    'date_id': date_map[date_str],
                    'location_id': global_loc_id,
                    'avg_temperature': row.get('LandAverageTemperature'),
                    'avg_temperature_uncertainty': row.get('LandAverageTemperatureUncertainty'),
                    'land_max_temperature': row.get('LandMaxTemperature'),
                    'land_min_temperature': row.get('LandMinTemperature'),
                    'source_file': 'GlobalTemperatures.csv',
                })

    # Country temperatures (sample)
    if 'country' in dfs:
        df = dfs['country'].sample(n=min(10000, len(dfs['country'])), random_state=42)
        for _, row in df.iterrows():
            date_str = str(row['dt'])[:10]
            loc_key = ('country', None, None, row['Country'])
            if date_str in date_map and loc_key in location_map:
                fact_records.append({
                    'date_id': date_map[date_str],
                    'location_id': location_map[loc_key],
                    'avg_temperature': row.get('AverageTemperature'),
                    'avg_temperature_uncertainty': row.get('AverageTemperatureUncertainty'),
                    'source_file': 'GlobalLandTemperaturesByCountry.csv',
                })

    print(f"  Total fact records: {len(fact_records)}")

    # Upload facts em batches
    upload_to_supabase(supabase, 'fact_temperature', fact_records)

    print("\n" + "=" * 60)
    print("Migration completed!")
    print("=" * 60)

if __name__ == '__main__':
    main()
