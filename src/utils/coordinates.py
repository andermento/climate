"""
Parser de Coordenadas Geograficas

Converte coordenadas no formato "57.05N" ou "10.33W" para valores numericos.

Convencao:
- Norte (N) e Leste (E) = valores positivos
- Sul (S) e Oeste (W) = valores negativos

Exemplos:
    >>> parse_coordinate("57.05N")
    57.05
    >>> parse_coordinate("10.33W")
    -10.33
    >>> parse_coordinate("23.45S")
    -23.45
"""

import re
from typing import Optional, Tuple
import pandas as pd


def parse_coordinate(coord_str: str) -> Optional[float]:
    """
    Converte uma string de coordenada para valor numerico.

    Args:
        coord_str: String como "57.05N", "10.33E", "23.45S", "45.67W"

    Returns:
        Valor float (positivo para N/E, negativo para S/W)
        None se nao conseguir fazer o parse
    """
    # Se for nulo ou vazio, retorna None
    if pd.isna(coord_str) or not coord_str:
        return None

    # Converte para string e remove espacos
    coord_str = str(coord_str).strip().upper()

    # Regex para extrair numero e direcao
    # Explicacao do regex:
    # ^          = inicio da string
    # ([\d.]+)   = captura um ou mais digitos ou pontos (o numero)
    # ([NSEW])   = captura exatamente uma letra de direcao
    # $          = fim da string
    pattern = r'^([\d.]+)([NSEW])$'
    match = re.match(pattern, coord_str)

    if not match:
        return None

    # Extrai o valor numerico
    value = float(match.group(1))

    # Extrai a direcao
    direction = match.group(2)

    # Sul e Oeste sao negativos (convencao geografica)
    if direction in ('S', 'W'):
        value = -value

    return value


def parse_coordinates(lat_str: str, lon_str: str) -> Tuple[Optional[float], Optional[float]]:
    """
    Converte latitude e longitude de uma vez.

    Args:
        lat_str: String de latitude (ex: "57.05N")
        lon_str: String de longitude (ex: "10.33E")

    Returns:
        Tupla (latitude, longitude) como floats
    """
    return parse_coordinate(lat_str), parse_coordinate(lon_str)


def get_hemisphere(lat_str: str, lon_str: str) -> Tuple[Optional[str], Optional[str]]:
    """
    Extrai os hemisferios de coordenadas.

    Returns:
        Tupla (hemisferio_NS, hemisferio_EW)
        Exemplo: ("N", "E") para coordenadas no nordeste
    """
    ns = None
    ew = None

    if lat_str and not pd.isna(lat_str):
        last_char = str(lat_str).strip().upper()[-1]
        if last_char in ('N', 'S'):
            ns = last_char

    if lon_str and not pd.isna(lon_str):
        last_char = str(lon_str).strip().upper()[-1]
        if last_char in ('E', 'W'):
            ew = last_char

    return ns, ew