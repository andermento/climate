import pandas as pd
import numpy as np
from typing import Optional, Literal
import logging

from src.utils.coordinates import parse_coordinate, get_hemisphere

logger = logging.getLogger(__name__)


def standardize_column_names(df: pd.DataFrame) -> pd.DataFrame:
    """
    Padroniza nomes das colunas.

    Convencao:
    - Tudo em minusculas
    - Espacos viram underscores
    - Remove caracteres especiais

    Exemplo:
        "AverageTemperature" -> "averagetemperature"
        "Land Max Temperature" -> "land_max_temperature"
    """
    df = df.copy()
    df.columns = [
        col.lower().replace(' ', '_').replace('-', '_')
        for col in df.columns
    ]
    return df


def clean_text_columns(df: pd.DataFrame, columns: list) -> pd.DataFrame:
    """
    Limpa colunas de texto.

    - Remove espacos extras no inicio e fim
    - Mantem caracteres especiais (a, e, c, etc.) - sao validos em nomes
    """
    df = df.copy()

    for col in columns:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip()
            # Substitui 'nan' string por NaN real
            df[col] = df[col].replace('nan', np.nan)

    return df


def parse_coordinates_columns(df: pd.DataFrame) -> pd.DataFrame:
    """
    Converte colunas de latitude/longitude para valores numericos.

    Adiciona novas colunas:
    - latitude_parsed: valor numerico
    - longitude_parsed: valor numerico
    - hemisphere_ns: 'N' ou 'S'
    - hemisphere_ew: 'E' ou 'W'
    """
    df = df.copy()

    if 'latitude' in df.columns and 'longitude' in df.columns:
        # Parse para valores numericos
        df['latitude_parsed'] = df['latitude'].apply(parse_coordinate)
        df['longitude_parsed'] = df['longitude'].apply(parse_coordinate)

        # Extrai hemisferios
        hemispheres = df.apply(
            lambda row: get_hemisphere(row['latitude'], row['longitude']),
            axis=1
        )
        df['hemisphere_ns'] = hemispheres.apply(lambda x: x[0])
        df['hemisphere_ew'] = hemispheres.apply(lambda x: x[1])

        logger.info("Coordenadas parseadas com sucesso")

    return df


def add_metadata_columns(
    df: pd.DataFrame,
    source: str
) -> pd.DataFrame:
    """
    Adiciona colunas de metadados.

    Metadados sao informacoes SOBRE os dados:
    - De qual arquivo veio
    - Qual a granularidade (nivel de detalhe)
    """
    df = df.copy()

    # Mapeia source para granularidade
    granularity_map = {
        "global": "global",
        "country": "country",
        "state": "state",
        "major_city": "city",  # Major cities sao cidades tambem
        "city": "city",
    }

    df['source_file'] = source
    df['granularity'] = granularity_map.get(source, source)

    return df


def clean_temperature_data(
    df: pd.DataFrame,
    source: str
) -> pd.DataFrame:
    """
    Pipeline completa de limpeza para dados de temperatura.

    Aplica todas as transformacoes de limpeza em sequencia.

    Args:
        df: DataFrame com dados brutos
        source: Nome da fonte ("global", "country", etc.)

    Returns:
        DataFrame limpo e padronizado
    """
    logger.info(f"Iniciando limpeza de {source}...")

    # 1. Padroniza nomes das colunas
    df = standardize_column_names(df)

    # 2. Garante que 'dt' e datetime
    if 'dt' in df.columns:
        df['dt'] = pd.to_datetime(df['dt'], errors='coerce')

    # 3. Limpa colunas de texto
    text_cols = ['country', 'state', 'city']
    df = clean_text_columns(df, text_cols)

    # 4. Parseia coordenadas (se existirem)
    df = parse_coordinates_columns(df)

    # 5. Adiciona metadados
    df = add_metadata_columns(df, source)

    # Log do resultado
    logger.info(f"Limpeza concluida: {len(df)} registros")
    logger.info(f"Colunas: {list(df.columns)}")

    return df


def handle_missing_values(
    df: pd.DataFrame,
    strategy: Literal['keep', 'drop', 'flag'] = 'keep'
) -> pd.DataFrame:
    """
    Trata valores ausentes (missing values).

    Estrategias:
    - 'keep': Mantem os NaN (recomendado para este projeto)
    - 'drop': Remove linhas com temperatura ausente
    - 'flag': Adiciona coluna indicando se e missing

    Por que 'keep' e recomendado?
    Valores ausentes carregam informacao! Eles indicam:
    - Periodos sem medicoes
    - Falhas em equipamentos
    - Regioes com dados esparsos
    """
    df = df.copy()

    # Identifica coluna de temperatura principal
    temp_col = None
    for col in ['averagetemperature', 'landaveragetemperature']:
        if col in df.columns:
            temp_col = col
            break

    if temp_col is None:
        logger.warning("Coluna de temperatura nao encontrada")
        return df

    # Conta valores ausentes
    missing_count = df[temp_col].isna().sum()
    missing_pct = (missing_count / len(df)) * 100
    logger.info(f"Valores ausentes em {temp_col}: {missing_count} ({missing_pct:.2f}%)")

    if strategy == 'keep':
        pass  # Nao faz nada

    elif strategy == 'drop':
        before = len(df)
        df = df.dropna(subset=[temp_col])
        logger.info(f"Removidas {before - len(df)} linhas com temperatura ausente")

    elif strategy == 'flag':
        df['is_temp_missing'] = df[temp_col].isna()

    return df