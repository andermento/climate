import pandas as pd
from typing import Dict, List
import logging

from src.utils.coordinates import parse_coordinate

logger = logging.getLogger(__name__)


def create_date_dimension(all_dates: pd.Series) -> pd.DataFrame:
    """
    Cria a tabela de dimensao de datas.

    Por que uma dimensao de data?
    - Pre-calcula atributos uteis (decada, seculo, etc.)
    - Evita calculos repetidos em queries
    - Permite filtros faceis por periodo

    Args:
        all_dates: Series com todas as datas de todos os arquivos

    Returns:
        DataFrame representando dim_date
    """
    logger.info("Criando dimensao de data...")

    # Remove duplicatas e valores nulos
    unique_dates = all_dates.dropna().drop_duplicates()
    unique_dates = pd.to_datetime(unique_dates)
    unique_dates = sorted(unique_dates)

    # Cria DataFrame
    dim_date = pd.DataFrame({'full_date': unique_dates})

    # Extrai componentes da data
    dim_date['year'] = dim_date['full_date'].dt.year
    dim_date['month'] = dim_date['full_date'].dt.month
    dim_date['month_name'] = dim_date['full_date'].dt.month_name()
    dim_date['quarter'] = dim_date['full_date'].dt.quarter

    # Calcula decada (arredonda para baixo para dezena)
    # Exemplo: 1743 -> 1740, 2013 -> 2010
    dim_date['decade'] = (dim_date['year'] // 10) * 10

    # Calcula seculo
    # Exemplo: 1743 -> 18, 2013 -> 21
    dim_date['century'] = (dim_date['year'] // 100) + 1

    # Flag para era moderna (pos-1900, dados mais confiaveis)
    dim_date['is_modern_era'] = dim_date['year'] >= 1900

    # Adiciona ID (chave primaria)
    dim_date['date_id'] = range(1, len(dim_date) + 1)

    # Reordena colunas
    dim_date = dim_date[[
        'date_id', 'full_date', 'year', 'month', 'month_name',
        'quarter', 'decade', 'century', 'is_modern_era'
    ]]

    logger.info(f"Dimensao de data criada: {len(dim_date)} datas unicas")
    return dim_date


def create_location_dimension(dfs: Dict[str, pd.DataFrame]) -> pd.DataFrame:
    """
    Cria a tabela de dimensao de localizacao.

    Unifica todas as localizacoes de todos os niveis:
    - Global (1 registro)
    - Pais (243 paises)
    - Estado (241 estados)
    - Cidade (3.490+ cidades)

    Args:
        dfs: Dicionario {fonte: DataFrame limpo}

    Returns:
        DataFrame representando dim_location
    """
    logger.info("Criando dimensao de localizacao...")

    locations = []

    # 1. Nivel Global (apenas 1 registro)
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

    # 2. Nivel Pais
    if 'country' in dfs:
        countries = dfs['country'][['country']].drop_duplicates()
        for _, row in countries.iterrows():
            locations.append({
                'granularity': 'country',
                'city': None,
                'state': None,
                'country': row['country'],
                'latitude': None,
                'longitude': None,
                'latitude_raw': None,
                'longitude_raw': None,
                'hemisphere_ns': None,
                'hemisphere_ew': None,
            })
        logger.info(f"Adicionados {len(countries)} paises")

    # 3. Nivel Estado
    if 'state' in dfs:
        states = dfs['state'][['state', 'country']].drop_duplicates()
        for _, row in states.iterrows():
            locations.append({
                'granularity': 'state',
                'city': None,
                'state': row['state'],
                'country': row['country'],
                'latitude': None,
                'longitude': None,
                'latitude_raw': None,
                'longitude_raw': None,
                'hemisphere_ns': None,
                'hemisphere_ew': None,
            })
        logger.info(f"Adicionados {len(states)} estados")

    # 4. Nivel Cidade (major_city e city)
    for source in ['major_city', 'city']:
        if source in dfs:
            df = dfs[source]
            # Seleciona colunas relevantes
            cols = ['city', 'country']
            if 'latitude' in df.columns:
                cols.extend(['latitude', 'longitude'])

            cities = df[cols].drop_duplicates()

            for _, row in cities.iterrows():
                lat_raw = row.get('latitude')
                lon_raw = row.get('longitude')

                lat_parsed = parse_coordinate(lat_raw) if pd.notna(lat_raw) else None
                lon_parsed = parse_coordinate(lon_raw) if pd.notna(lon_raw) else None

                # Extrai hemisferios
                hemisphere_ns = None
                hemisphere_ew = None
                if pd.notna(lat_raw):
                    hemisphere_ns = str(lat_raw)[-1].upper()
                if pd.notna(lon_raw):
                    hemisphere_ew = str(lon_raw)[-1].upper()

                locations.append({
                    'granularity': 'city',
                    'city': row['city'],
                    'state': None,
                    'country': row['country'],
                    'latitude': lat_parsed,
                    'longitude': lon_parsed,
                    'latitude_raw': lat_raw,
                    'longitude_raw': lon_raw,
                    'hemisphere_ns': hemisphere_ns,
                    'hemisphere_ew': hemisphere_ew,
                })

            logger.info(f"Adicionadas {len(cities)} cidades de {source}")

    # Cria DataFrame e remove duplicatas
    dim_location = pd.DataFrame(locations)
    dim_location = dim_location.drop_duplicates(
        subset=['granularity', 'city', 'state', 'country']
    )

    # Adiciona ID
    dim_location['location_id'] = range(1, len(dim_location) + 1)

    # Reordena colunas
    dim_location = dim_location[[
        'location_id', 'granularity', 'city', 'state', 'country',
        'latitude', 'longitude', 'latitude_raw', 'longitude_raw',
        'hemisphere_ns', 'hemisphere_ew'
    ]]

    logger.info(f"Dimensao de localizacao criada: {len(dim_location)} locais unicos")
    return dim_location