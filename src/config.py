import os
from pathlib import Path
from dotenv import load_dotenv

# Carrega variaveis do arquivo .env
load_dotenv()


# =============================================================================
# PATHS (Caminhos de arquivos)
# =============================================================================

# Diretorio raiz do projeto
PROJECT_ROOT = Path(__file__).parent.parent

# Diretorios de dados
DATA_DIR = PROJECT_ROOT / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
SAMPLE_DATA_DIR = DATA_DIR / "sample"

# Diretorio de SQL
SQL_DIR = PROJECT_ROOT / "sql"


# =============================================================================
# DATABASE (Configuracoes do banco de dados)
# =============================================================================

# PostgreSQL
POSTGRES_USER = os.getenv("POSTGRES_USER", "climate")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "climate_password")
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB", "climate_db")

# String de conexao
POSTGRES_CONNECTION_STRING = (
    f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}"
    f"@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
)


# =============================================================================
# DATA FILES (Arquivos de dados)
# =============================================================================

# Mapeamento dos arquivos CSV
CSV_FILES = {
    "global": {
        "filename": "GlobalTemperatures.csv",
        "description": "Temperaturas globais agregadas",
        "rows_approx": 3_192,
    },
    "country": {
        "filename": "GlobalLandTemperaturesByCountry.csv",
        "description": "Temperaturas por pais",
        "rows_approx": 577_462,
    },
    "state": {
        "filename": "GlobalLandTemperaturesByState.csv",
        "description": "Temperaturas por estado/provincia",
        "rows_approx": 645_675,
    },
    "major_city": {
        "filename": "GlobalLandTemperaturesByMajorCity.csv",
        "description": "Temperaturas das 100 principais cidades",
        "rows_approx": 239_177,
    },
    "city": {
        "filename": "GlobalLandTemperaturesByCity.csv",
        "description": "Temperaturas de todas as cidades",
        "rows_approx": 8_599_212,
    },
}


# =============================================================================
# PROCESSING (Configuracoes de processamento)
# =============================================================================

# Tamanho do chunk para arquivos grandes
CHUNK_SIZE = 500_000

# Tamanho do batch para insercao no banco
BATCH_SIZE = 50_000


# =============================================================================
# QUALITY (Limites de qualidade de dados)
# =============================================================================

# Faixa valida de temperatura (C)
TEMP_MIN = -60.0  # Temperatura minima aceitavel
TEMP_MAX = 50.0   # Temperatura maxima aceitavel

# Porcentagem maxima de valores ausentes aceitavel
MAX_MISSING_PCT = 50.0