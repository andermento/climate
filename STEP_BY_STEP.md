# Climate ETL Pipeline - Passo a Passo Didatico

Este guia foi criado para voce executar o projeto etapa por etapa, de forma clara e organizada. Cada passo explica **o que fazer**, **por que fazer** e **como verificar** se funcionou.

---

## Resumo do Projeto

Criar um pipeline ETL completo para analise de tendencias climaticas globais, processando **10+ milhoes de registros** de temperaturas (1743-2015) com stack open-source.

### Dados Disponiveis

| Arquivo | Registros | Periodo | Cobertura |
|---------|-----------|---------|-----------|
| GlobalTemperatures.csv | 3.192 | 1750-2015 | Global agregado |
| GlobalLandTemperaturesByCountry.csv | 577.462 | 1743-2013 | 243 paises |
| GlobalLandTemperaturesByState.csv | 645.675 | 1855-2013 | 241 estados |
| GlobalLandTemperaturesByMajorCity.csv | 239.177 | 1849-2013 | 100 cidades principais |
| GlobalLandTemperaturesByCity.csv | 8.599.212 | 1743-2013 | 3.490 cidades |

**Total: 572 MB, 10+ milhoes de linhas**

### Stack Tecnologico

| Componente | Tecnologia | Justificativa |
|------------|------------|---------------|
| Linguagem | Python 3.11 | Padrao da industria para data engineering |
| Containerizacao | Docker + Compose | Ambiente reproduzivel |
| Orquestracao | Apache Airflow | Agendamento, monitoramento, retentativas |
| Data Warehouse | PostgreSQL | Robusto, gratuito, amplamente usado |
| Processamento | Pandas + PyArrow | Eficiente para dados tabulares |
| Visualizacao | Streamlit | Dashboard web interativo |
| Testes | Pytest + Coverage | Testes completos (unitarios + integracao) |

---

## Arquitetura do Pipeline

```
+---------------------------------------------------------------------+
|                         APACHE AIRFLOW                               |
|  +---------+   +-----------+   +----------+   +-----------------+   |
|  | Extract | > | Transform | > |   Load   | > | Quality Checks  |   |
|  +---------+   +-----------+   +----------+   +-----------------+   |
+---------------------------------------------------------------------+
       |               |                |
       v               v                v
+----------+   +--------------+   +--------------+
| CSVs Raw |   | Parquet/     |   | PostgreSQL   |
| (572 MB) |   | Intermediario|   | Star Schema  |
+----------+   +--------------+   +--------------+
```

---

## Estrutura Final do Projeto

```
climate-etl-pipeline/
|-- README.md                    # Documentacao principal
|-- .gitignore
|-- .env.example
|-- requirements.txt
|
|-- docker/
|   |-- docker-compose.yml       # Orquestracao dos containers
|   |-- Dockerfile.airflow       # Imagem customizada Airflow
|   +-- init-db.sql              # Script inicializacao PostgreSQL
|
|-- data/
|   |-- raw/                     # CSVs originais (5 arquivos)
|   |-- processed/               # Dados intermediarios (parquet)
|   +-- sample/                  # Amostras para testes
|
|-- src/
|   |-- __init__.py
|   |-- config.py
|   |-- extract/
|   |   |-- __init__.py
|   |   +-- csv_extractor.py     # Leitura dos CSVs
|   |-- transform/
|   |   |-- __init__.py
|   |   |-- cleaners.py          # Limpeza de dados
|   |   |-- validators.py        # Validacao de qualidade
|   |   +-- transformers.py      # Transformacoes (dimensoes/fatos)
|   |-- load/
|   |   |-- __init__.py
|   |   +-- database_loader.py   # Carregamento no PostgreSQL
|   +-- utils/
|       |-- __init__.py
|       |-- coordinates.py       # Parser de lat/long
|       +-- database.py          # Conexao com banco
|
|-- dags/
|   +-- climate_etl_dag.py       # DAG do Airflow
|
|-- sql/
|   |-- ddl/
|   |   |-- 01_create_dimensions.sql
|   |   |-- 02_create_facts.sql
|   |   +-- 03_create_views.sql
|   +-- analytics/
|       |-- warming_trends.sql
|       |-- seasonal_patterns.sql
|       +-- geographic_comparisons.sql
|
|-- tests/
|   |-- __init__.py
|   |-- conftest.py
|   |-- unit/
|   |   |-- test_coordinates.py
|   |   |-- test_extractor.py
|   |   +-- test_cleaners.py
|   +-- integration/
|       +-- test_pipeline.py
|
|-- streamlit_app/
|   |-- __init__.py
|   |-- app.py                   # Aplicacao principal Streamlit
|   |-- pages/
|   |   |-- 01_global_trends.py
|   |   |-- 02_country_analysis.py
|   |   |-- 03_city_explorer.py
|   |   +-- 04_seasonal_patterns.py
|   |-- components/
|   |   |-- charts.py
|   |   +-- filters.py
|   +-- utils/
|       +-- database.py
|
+-- docs/
    |-- architecture.md
    |-- architecture_diagram.png
    +-- data_dictionary.md
```

---

# ETAPA 1: Preparacao do Ambiente

## 1.1 Criar a estrutura de pastas

**O que vamos fazer:** Criar todas as pastas do projeto de uma vez.

**Por que:** Uma boa organizacao de pastas facilita encontrar arquivos e e uma pratica profissional.

```bash
# Navegue ate a pasta do projeto
cd "/Users/andersonxn/Data Engineer/climate"

# Crie todas as pastas necessarias
mkdir -p src/{extract,transform,load,utils,models}
mkdir -p dags
mkdir -p docker
mkdir -p sql/{ddl,analytics}
mkdir -p tests/{unit,integration,fixtures/sample_data}
mkdir -p data/{raw,processed,sample}
mkdir -p docs
mkdir -p notebooks
mkdir -p streamlit_app/{pages,components,utils}
```

**Como verificar:** Execute `ls -la` e veja se todas as pastas foram criadas.

---

## 1.2 Criar arquivos __init__.py

**O que vamos fazer:** Criar arquivos vazios que transformam pastas em "pacotes Python".

**Por que:** Python precisa desses arquivos para importar codigo de uma pasta para outra.

```bash
# Criar todos os __init__.py
touch src/__init__.py
touch src/extract/__init__.py
touch src/transform/__init__.py
touch src/load/__init__.py
touch src/utils/__init__.py
touch src/models/__init__.py
touch dags/__init__.py
touch tests/__init__.py
touch tests/unit/__init__.py
touch tests/integration/__init__.py
touch streamlit_app/__init__.py
touch streamlit_app/pages/__init__.py
touch streamlit_app/components/__init__.py
touch streamlit_app/utils/__init__.py
```

**Como verificar:** Execute `find . -name "__init__.py"` e veja a lista de arquivos criados.

---

## 1.3 Mover os CSVs para data/raw

**O que vamos fazer:** Organizar os arquivos de dados na pasta correta.

```bash
# Mova os CSVs (ajuste se necessario)
mv GlobalTemperatures.csv data/raw/
mv GlobalLandTemperaturesByCountry.csv data/raw/
mv GlobalLandTemperaturesByState.csv data/raw/
mv GlobalLandTemperaturesByMajorCity.csv data/raw/
mv GlobalLandTemperaturesByCity.csv data/raw/
```

**Como verificar:** `ls data/raw/` deve mostrar os 5 arquivos CSV.

---

## 1.4 Criar o requirements.txt

**O que vamos fazer:** Listar todas as bibliotecas Python que o projeto precisa.

**Por que:** Permite instalar todas as dependencias com um unico comando.

Crie o arquivo `requirements.txt` na raiz do projeto com o seguinte conteudo:

```
# Processamento de dados
pandas>=2.0.0
numpy>=1.24.0
pyarrow>=14.0.0

# Banco de dados
sqlalchemy>=2.0.0
psycopg2-binary>=2.9.0
duckdb>=0.9.0

# Validacao de dados
pydantic>=2.0.0

# Testes
pytest>=7.0.0
pytest-cov>=4.0.0

# Utilitarios
python-dotenv>=1.0.0

# Dashboard
streamlit>=1.30.0
plotly>=5.18.0

# Airflow (instalado separadamente no Docker)
# apache-airflow>=2.8.0
```

**Como verificar:** O arquivo deve existir na raiz do projeto.

---

## 1.5 Criar ambiente virtual e instalar dependencias

**O que vamos fazer:** Criar um ambiente isolado para o projeto.

**Por que:** Evita conflitos entre versoes de bibliotecas de diferentes projetos.

```bash
# Criar ambiente virtual
python -m venv venv

# Ativar ambiente (macOS/Linux)
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

**Como verificar:** Execute `pip list` e veja as bibliotecas instaladas.

---

## 1.6 Criar .gitignore

**O que vamos fazer:** Definir quais arquivos o Git deve ignorar.

**Por que:** Evita subir dados grandes, senhas ou arquivos temporarios para o GitHub.

Crie o arquivo `.gitignore` na raiz do projeto:

```
# Ambiente Python
venv/
.venv/
__pycache__/
*.pyc
*.pyo
.pytest_cache/

# Dados (muito grandes para Git)
data/raw/*.csv
data/processed/
*.parquet

# Ambiente
.env
.env.local

# IDE
.vscode/
.idea/
*.swp

# Docker
postgres_data/

# Logs
*.log
logs/
airflow_logs/

# OS
.DS_Store
Thumbs.db

# Jupyter
.ipynb_checkpoints/
```

**Como verificar:** O arquivo deve existir na raiz do projeto.

---

## 1.7 Criar .env.example

**O que vamos fazer:** Criar um template de variaveis de ambiente.

**Por que:** Documenta quais configuracoes sao necessarias sem expor senhas reais.

Crie o arquivo `.env.example`:

```bash
# Banco de Dados PostgreSQL
POSTGRES_USER=climate
POSTGRES_PASSWORD=sua_senha_aqui
POSTGRES_DB=climate_db
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Airflow
FERNET_KEY=sua_chave_fernet_aqui
SECRET_KEY=sua_chave_secreta_aqui
AIRFLOW_UID=50000

# Streamlit
STREAMLIT_SERVER_PORT=8501
```

**Proximo passo:** Copie para `.env` e preencha com valores reais:
```bash
cp .env.example .env
# Edite .env com suas configuracoes
```

---

# ETAPA 2: Implementar Utilitarios

## 2.1 Criar o parser de coordenadas

**O que vamos fazer:** Criar funcao que converte "57.05N" para 57.05.

**Por que:** Os dados de latitude/longitude estao em formato texto e precisamos de numeros para analises.

Crie o arquivo `src/utils/coordinates.py`:

```python
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
```

**Como verificar:**
```python
# No terminal Python (ative o venv primeiro)
# python
>>> from src.utils.coordinates import parse_coordinate
>>> print(parse_coordinate("57.05N"))  # Deve imprimir: 57.05
>>> print(parse_coordinate("10.33W"))  # Deve imprimir: -10.33
```

---

## 2.2 Criar o modulo de configuracao

**O que vamos fazer:** Centralizar todas as configuracoes do projeto.

**Por que:** Facilita alterar configuracoes sem modificar o codigo principal.

Crie o arquivo `src/config.py`:

```python
"""
Configuracoes Centralizadas do Projeto

Todas as configuracoes ficam aqui para facil manutencao.
Usa variaveis de ambiente quando disponiveis.
"""

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
```

**Como verificar:**
```python
# python
>>> from src.config import RAW_DATA_DIR, CSV_FILES
>>> print(f"Diretorio de dados: {RAW_DATA_DIR}")
>>> print(f"Arquivos configurados: {list(CSV_FILES.keys())}")
```

---

# ETAPA 3: Implementar Extracao (Extract)

## 3.1 Criar o extrator de CSV

**O que vamos fazer:** Criar classe que le os arquivos CSV de forma inteligente.

**Por que:** O arquivo de cidades tem 8.6 milhoes de linhas e precisa de tratamento especial.

Crie o arquivo `src/extract/csv_extractor.py`:

```python
"""
Modulo de Extracao de Dados CSV

Este modulo e responsavel por ler os arquivos CSV brutos.

Para um Junior:
- "Extracao" e a primeira etapa do ETL
- Significa pegar os dados da fonte original
- Aqui usamos pandas para ler CSVs
"""

import pandas as pd
from pathlib import Path
from typing import Dict, Optional, Iterator, Union
import logging

from src.config import RAW_DATA_DIR, CSV_FILES, CHUNK_SIZE

# Configurar logging (registro de mensagens)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CSVExtractor:
    """
    Classe para extrair dados de arquivos CSV.

    Por que usar uma classe?
    - Agrupa funcionalidades relacionadas
    - Facilita reutilizacao e testes
    - Permite manter estado (como o diretorio de dados)

    Uso:
        extractor = CSVExtractor()
        df = extractor.extract("global")  # Extrai dados globais
    """

    def __init__(self, data_dir: Optional[str] = None):
        """
        Inicializa o extrator.

        Args:
            data_dir: Caminho para o diretorio com os CSVs.
                     Se nao informado, usa o padrao da config.
        """
        self.data_dir = Path(data_dir) if data_dir else RAW_DATA_DIR
        self.file_configs = CSV_FILES

        logger.info(f"Extrator inicializado. Diretorio: {self.data_dir}")

    def _get_filepath(self, source: str) -> Path:
        """
        Obtem o caminho completo do arquivo.

        Args:
            source: Nome da fonte ("global", "country", etc.)

        Returns:
            Path do arquivo

        Raises:
            ValueError: Se a fonte nao existe
            FileNotFoundError: Se o arquivo nao existe
        """
        if source not in self.file_configs:
            valid_sources = list(self.file_configs.keys())
            raise ValueError(
                f"Fonte '{source}' nao reconhecida. "
                f"Opcoes validas: {valid_sources}"
            )

        filepath = self.data_dir / self.file_configs[source]["filename"]

        if not filepath.exists():
            raise FileNotFoundError(f"Arquivo nao encontrado: {filepath}")

        return filepath

    def extract(
        self,
        source: str,
        chunksize: Optional[int] = None
    ) -> Union[pd.DataFrame, Iterator[pd.DataFrame]]:
        """
        Extrai dados de um arquivo CSV.

        Args:
            source: Nome da fonte ("global", "country", "state",
                   "major_city", "city")
            chunksize: Se informado, retorna um iterator que le
                      o arquivo em pedacos desse tamanho.
                      Util para arquivos grandes!

        Returns:
            DataFrame com os dados, ou Iterator se chunksize informado

        Exemplo:
            # Ler arquivo pequeno de uma vez
            df = extractor.extract("global")

            # Ler arquivo grande em chunks
            for chunk in extractor.extract("city", chunksize=500000):
                process(chunk)
        """
        filepath = self._get_filepath(source)

        logger.info(f"Extraindo dados de: {filepath.name}")

        # Configuracoes de leitura
        read_params = {
            "filepath_or_buffer": filepath,
            "na_values": [""],      # Celulas vazias = NaN
            "parse_dates": ["dt"],  # Converte coluna 'dt' para datetime
            "low_memory": False,    # Evita warnings de tipos mistos
        }

        # Adiciona chunksize se informado
        if chunksize:
            read_params["chunksize"] = chunksize
            logger.info(f"Lendo em chunks de {chunksize} linhas")

        df = pd.read_csv(**read_params)

        if not chunksize:
            logger.info(f"Extraidos {len(df)} registros de {source}")

        return df

    def extract_all_small(self) -> Dict[str, pd.DataFrame]:
        """
        Extrai todos os arquivos pequenos (tudo exceto 'city').

        Returns:
            Dicionario {nome_fonte: DataFrame}
        """
        results = {}
        small_sources = ["global", "country", "state", "major_city"]

        for source in small_sources:
            results[source] = self.extract(source)

        return results

    def get_file_info(self, source: str) -> Dict:
        """
        Retorna informacoes sobre um arquivo.

        Util para saber o tamanho antes de processar.
        """
        filepath = self._get_filepath(source)
        config = self.file_configs[source]

        # Conta linhas sem carregar tudo na memoria
        with open(filepath, 'r') as f:
            line_count = sum(1 for _ in f) - 1  # -1 pelo header

        return {
            "source": source,
            "filename": config["filename"],
            "description": config["description"],
            "filepath": str(filepath),
            "actual_rows": line_count,
            "file_size_mb": filepath.stat().st_size / (1024 * 1024),
        }

    def preview(self, source: str, rows: int = 5) -> pd.DataFrame:
        """
        Retorna uma previa dos dados (primeiras linhas).

        Util para verificar a estrutura sem carregar tudo.
        """
        filepath = self._get_filepath(source)
        return pd.read_csv(filepath, nrows=rows)
```

**Como verificar:**
```python
# python
>>> from src.extract.csv_extractor import CSVExtractor
>>> extractor = CSVExtractor()
>>> info = extractor.get_file_info("global")
>>> print(info)
>>> df_global = extractor.extract("global")
>>> print(f"Shape: {df_global.shape}")
>>> print(df_global.head())
```

---

# ETAPA 4: Implementar Transformacao (Transform)

## 4.1 Criar o modulo de limpeza

**O que vamos fazer:** Criar funcoes para limpar e padronizar os dados.

**Por que:** Dados brutos geralmente tem problemas: nomes inconsistentes, valores ausentes, formatos diferentes.

Crie o arquivo `src/transform/cleaners.py`:

```python
"""
Modulo de Limpeza de Dados

Limpeza (ou "cleaning") e o processo de corrigir problemas nos dados:
- Valores ausentes (missing values)
- Formatos inconsistentes
- Caracteres especiais
- Erros de digitacao

Principio importante: NUNCA modifique os dados originais!
Sempre trabalhe em copias.
"""

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
```

**Como verificar:**
```python
# python
>>> from src.extract.csv_extractor import CSVExtractor
>>> from src.transform.cleaners import clean_temperature_data
>>> extractor = CSVExtractor()
>>> df_raw = extractor.extract("global")
>>> df_clean = clean_temperature_data(df_raw, "global")
>>> print("Antes da limpeza:", df_raw.columns.tolist())
>>> print("Depois da limpeza:", df_clean.columns.tolist())
```

---

## 4.2 Criar o modulo de transformacao (dimensoes e fatos)

**O que vamos fazer:** Criar funcoes que transformam dados limpos em tabelas do Star Schema.

**Por que:** O Star Schema e o formato ideal para analises e relatorios.

Crie o arquivo `src/transform/transformers.py`:

```python
"""
Modulo de Transformacao de Dados

Transforma dados limpos em tabelas dimensionais (Star Schema).

Star Schema explicado para Junior:
- Imagine uma estrela de 5 pontas
- No CENTRO esta a tabela FATO (medicoes de temperatura)
- Nas PONTAS estao as tabelas DIMENSAO (data, localizacao)
- Fatos contem NUMEROS (temperatura, incerteza)
- Dimensoes contem DESCRICOES (nome do pais, mes, decada)
"""

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
```

**Como verificar:**
```python
# python
>>> from src.transform.transformers import create_date_dimension
>>> import pandas as pd
>>> dates = pd.Series(['2010-01-01', '2010-02-01', '2011-01-01', '1900-06-01'])
>>> dim_date = create_date_dimension(dates)
>>> print(dim_date)
```

---

# ETAPA 5: Implementar Carregamento (Load)

Crie o arquivo `src/load/database_loader.py`:

```python
"""
Modulo de Carregamento de Dados

O "Load" e a ultima etapa do ETL.
Carrega os dados transformados no banco de dados destino.
"""

import pandas as pd
from sqlalchemy import create_engine, text
from typing import Literal, Optional
import logging

from src.config import POSTGRES_CONNECTION_STRING, BATCH_SIZE

logger = logging.getLogger(__name__)


class DatabaseLoader:
    """
    Carrega dados no banco de dados.

    Suporta PostgreSQL (e pode ser estendido para outros bancos).
    """

    def __init__(
        self,
        connection_string: Optional[str] = None,
        schema: str = 'climate'
    ):
        """
        Inicializa conexao com o banco.

        Args:
            connection_string: String de conexao. Se nao informada,
                             usa a configuracao padrao.
            schema: Schema do banco onde criar as tabelas.
        """
        self.connection_string = connection_string or POSTGRES_CONNECTION_STRING
        self.schema = schema
        self.engine = create_engine(self.connection_string)

        logger.info(f"Conexao configurada para schema '{schema}'")

    def test_connection(self) -> bool:
        """
        Testa se a conexao esta funcionando.

        Returns:
            True se conectou com sucesso
        """
        try:
            with self.engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Conexao testada com sucesso!")
            return True
        except Exception as e:
            logger.error(f"Erro ao conectar: {e}")
            return False

    def load_dataframe(
        self,
        df: pd.DataFrame,
        table_name: str,
        if_exists: Literal['fail', 'replace', 'append'] = 'append',
        chunk_size: Optional[int] = None
    ) -> int:
        """
        Carrega um DataFrame em uma tabela.

        Args:
            df: DataFrame para carregar
            table_name: Nome da tabela destino
            if_exists: O que fazer se tabela existir
                - 'fail': Erro
                - 'replace': Apaga e recria
                - 'append': Adiciona aos dados existentes
            chunk_size: Tamanho do batch (util para tabelas grandes)

        Returns:
            Numero de linhas carregadas
        """
        chunk_size = chunk_size or BATCH_SIZE

        logger.info(f"Carregando {len(df)} linhas em {self.schema}.{table_name}")

        total_rows = len(df)

        # Para DataFrames grandes, processa em chunks
        if total_rows > chunk_size:
            loaded = 0
            for start in range(0, total_rows, chunk_size):
                end = min(start + chunk_size, total_rows)
                chunk = df.iloc[start:end]

                chunk.to_sql(
                    table_name,
                    self.engine,
                    schema=self.schema,
                    if_exists='append' if start > 0 or if_exists == 'append' else if_exists,
                    index=False,
                    method='multi'
                )

                loaded += len(chunk)
                progress = (loaded / total_rows) * 100
                logger.info(f"Progresso: {loaded}/{total_rows} ({progress:.1f}%)")

        else:
            df.to_sql(
                table_name,
                self.engine,
                schema=self.schema,
                if_exists=if_exists,
                index=False,
                method='multi'
            )

        logger.info(f"Carregamento concluido: {total_rows} linhas")
        return total_rows
```

---

# ETAPA 6: Setup Docker

## 6.1 Criar docker-compose.yml

Crie o arquivo `docker/docker-compose.yml`:

```yaml
version: '3.8'

services:
  # Banco de dados PostgreSQL
  postgres:
    image: postgres:15
    container_name: climate_postgres
    environment:
      POSTGRES_USER: climate
      POSTGRES_PASSWORD: climate_password
      POSTGRES_DB: climate_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-db.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U climate"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - climate_network

  # Interface para gerenciar PostgreSQL (opcional, mas util)
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: climate_pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@climate.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - postgres
    networks:
      - climate_network

volumes:
  postgres_data:

networks:
  climate_network:
    driver: bridge
```

## 6.2 Criar script de inicializacao do banco

Crie o arquivo `docker/init-db.sql`:

```sql
-- Criacao do schema e tabelas
CREATE SCHEMA IF NOT EXISTS climate;

-- Dimensao de Data
CREATE TABLE IF NOT EXISTS climate.dim_date (
    date_id         SERIAL PRIMARY KEY,
    full_date       DATE NOT NULL UNIQUE,
    year            INTEGER NOT NULL,
    month           INTEGER NOT NULL,
    month_name      VARCHAR(20) NOT NULL,
    quarter         INTEGER NOT NULL,
    decade          INTEGER NOT NULL,
    century         INTEGER NOT NULL,
    is_modern_era   BOOLEAN NOT NULL
);

-- Dimensao de Localizacao
CREATE TABLE IF NOT EXISTS climate.dim_location (
    location_id     SERIAL PRIMARY KEY,
    granularity     VARCHAR(20) NOT NULL,
    city            VARCHAR(100),
    state           VARCHAR(100),
    country         VARCHAR(100),
    latitude        DECIMAL(9,6),
    longitude       DECIMAL(9,6),
    latitude_raw    VARCHAR(20),
    longitude_raw   VARCHAR(20),
    hemisphere_ns   CHAR(1),
    hemisphere_ew   CHAR(1),
    UNIQUE(granularity, city, state, country)
);

-- Tabela Fato de Temperatura
CREATE TABLE IF NOT EXISTS climate.fact_temperature (
    temperature_id              SERIAL PRIMARY KEY,
    date_id                     INTEGER REFERENCES climate.dim_date(date_id),
    location_id                 INTEGER REFERENCES climate.dim_location(location_id),
    avg_temperature             DECIMAL(10,4),
    avg_temperature_uncertainty DECIMAL(10,4),
    land_max_temperature        DECIMAL(10,4),
    land_max_temp_uncertainty   DECIMAL(10,4),
    land_min_temperature        DECIMAL(10,4),
    land_min_temp_uncertainty   DECIMAL(10,4),
    land_ocean_avg_temperature  DECIMAL(10,4),
    land_ocean_avg_temp_uncertainty DECIMAL(10,4),
    source_file                 VARCHAR(100) NOT NULL,
    loaded_at                   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date_id, location_id, source_file)
);

-- Indices para performance
CREATE INDEX idx_fact_date ON climate.fact_temperature(date_id);
CREATE INDEX idx_fact_location ON climate.fact_temperature(location_id);
CREATE INDEX idx_dim_date_decade ON climate.dim_date(decade);
CREATE INDEX idx_dim_location_country ON climate.dim_location(country);

-- Permissoes
GRANT ALL ON SCHEMA climate TO climate;
GRANT ALL ON ALL TABLES IN SCHEMA climate TO climate;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA climate TO climate;
```

## 6.3 Como iniciar o ambiente Docker

```bash
# Navegar para pasta docker
cd docker

# Iniciar todos os servicos
docker-compose up -d

# Verificar se estao rodando
docker-compose ps

# Ver logs (se precisar debugar)
docker-compose logs -f postgres
```

**Como verificar:**
- PostgreSQL: `docker exec -it climate_postgres psql -U climate -d climate_db -c "SELECT 1"`
- PgAdmin: Acesse http://localhost:5050 (admin@climate.com / admin)

---

# ETAPA 7: Queries de Analytics

Crie o arquivo `sql/analytics/warming_trends.sql`:

```sql
-- Temperatura media por decada (Global)
SELECT
    d.decade,
    ROUND(AVG(f.avg_temperature)::numeric, 2) as avg_temp,
    ROUND(AVG(f.avg_temperature_uncertainty)::numeric, 3) as avg_uncertainty,
    COUNT(*) as measurements
FROM climate.fact_temperature f
JOIN climate.dim_date d ON f.date_id = d.date_id
JOIN climate.dim_location l ON f.location_id = l.location_id
WHERE l.granularity = 'global'
  AND f.avg_temperature IS NOT NULL
GROUP BY d.decade
ORDER BY d.decade;

-- Top 10 anos mais quentes
SELECT
    d.year,
    ROUND(AVG(f.avg_temperature)::numeric, 2) as avg_temp
FROM climate.fact_temperature f
JOIN climate.dim_date d ON f.date_id = d.date_id
JOIN climate.dim_location l ON f.location_id = l.location_id
WHERE l.granularity = 'global'
  AND f.avg_temperature IS NOT NULL
GROUP BY d.year
ORDER BY avg_temp DESC
LIMIT 10;
```

---

# ETAPA 8: Streamlit Dashboard

Crie o arquivo `streamlit_app/app.py`:

```python
"""
Dashboard de Analise Climatica
"""
import streamlit as st

st.set_page_config(
    page_title="Climate Data Explorer",
    page_icon="thermometer",
    layout="wide"
)

st.title("Climate Temperature Analysis")
st.markdown("### Explorando 272 anos de dados climaticos globais (1743-2015)")

# Metricas principais
col1, col2, col3, col4 = st.columns(4)
col1.metric("Total de Registros", "10M+")
col2.metric("Periodo", "1743-2015")
col3.metric("Paises", "243")
col4.metric("Cidades", "3,490")

st.markdown("---")
st.markdown("### Navegue pelas paginas no menu lateral para explorar os dados!")
```

---

# ETAPA 9: Testes

## 9.1 Criar fixtures de teste

Crie o arquivo `tests/conftest.py`:

```python
"""
Fixtures compartilhadas para testes.
"""
import pytest
import pandas as pd

@pytest.fixture
def sample_global_data():
    """Dados de exemplo para testes."""
    return pd.DataFrame({
        'dt': ['2010-01-01', '2010-02-01', '2010-03-01'],
        'LandAverageTemperature': [3.5, 4.2, 7.8],
        'LandAverageTemperatureUncertainty': [0.5, 0.4, 0.3],
    })

@pytest.fixture
def sample_city_data():
    """Dados de cidade para testes."""
    return pd.DataFrame({
        'dt': ['2010-01-01', '2010-02-01'],
        'AverageTemperature': [10.5, 12.3],
        'AverageTemperatureUncertainty': [0.5, 0.4],
        'City': ['Sao Paulo', 'Rio de Janeiro'],
        'Country': ['Brazil', 'Brazil'],
        'Latitude': ['23.55S', '22.91S'],
        'Longitude': ['46.64W', '43.17W'],
    })
```

## 9.2 Criar testes unitarios

Crie o arquivo `tests/unit/test_coordinates.py`:

```python
"""
Testes para o parser de coordenadas.
"""
import pytest
from src.utils.coordinates import parse_coordinate

class TestParseCoordinate:

    def test_north_latitude(self):
        assert parse_coordinate("57.05N") == 57.05

    def test_south_latitude(self):
        assert parse_coordinate("23.45S") == -23.45

    def test_east_longitude(self):
        assert parse_coordinate("10.33E") == 10.33

    def test_west_longitude(self):
        assert parse_coordinate("46.64W") == -46.64

    def test_none_input(self):
        assert parse_coordinate(None) is None

    def test_empty_string(self):
        assert parse_coordinate("") is None

    def test_invalid_format(self):
        assert parse_coordinate("invalid") is None
```

## 9.3 Rodar testes

```bash
# Rodar todos os testes
pytest tests/ -v

# Com cobertura
pytest tests/ --cov=src --cov-report=html

# Ver relatorio de cobertura
open htmlcov/index.html
```

---

# ETAPA 10: Documentacao e Publicacao

## 10.1 Criar README.md

O README deve conter:
1. Titulo e descricao do projeto
2. Diagrama de arquitetura
3. Pre-requisitos
4. Instrucoes de instalacao
5. Como executar o pipeline
6. Exemplos de queries
7. Screenshots do dashboard

## 10.2 Publicar no GitHub

```bash
# Inicializar git (se ainda nao foi feito)
git init

# Adicionar arquivos
git add .

# Primeiro commit
git commit -m "Initial commit: Climate ETL Pipeline"

# Criar repositorio no GitHub e conectar
git remote add origin https://github.com/seu-usuario/climate-etl-pipeline.git

# Push
git push -u origin main
```

---

# Checklist Final

- [ ] Estrutura de pastas criada
- [ ] Arquivos __init__.py criados
- [ ] requirements.txt configurado
- [ ] .gitignore criado
- [ ] Modulo de coordenadas implementado
- [ ] Modulo de configuracao implementado
- [ ] Extrator CSV implementado
- [ ] Modulo de limpeza implementado
- [ ] Modulo de transformacao implementado
- [ ] Carregador de banco implementado
- [ ] Docker compose configurado
- [ ] Banco de dados inicializado
- [ ] Queries de analytics criadas
- [ ] Streamlit dashboard basico criado
- [ ] Testes unitarios escritos
- [ ] README.md criado
- [ ] Publicado no GitHub

---

# Conceitos Explicados para Junior

## O que e ETL?
- **Extract**: Ler dados das fontes (CSVs)
- **Transform**: Limpar e reformatar
- **Load**: Carregar no destino (banco de dados)

## O que e Star Schema?
- Modelo de dados otimizado para analise
- Tabela FATO central (medicoes)
- Tabelas DIMENSAO ao redor (data, localizacao)
- Formato de "estrela" facilita queries agregadas

## O que e um DAG?
- Directed Acyclic Graph (Grafo Aciclico Direcionado)
- Define tarefas e suas dependencias
- Garante ordem correta de execucao
- Sem loops (A -> B -> C, nunca A -> B -> A)

## O que e Docker Compose?
- Ferramenta para definir multiplos containers
- Um arquivo YAML configura todo o ambiente
- `docker-compose up` inicia tudo

## O que e Incerteza nos Dados?
- Cada temperatura tem um valor de incerteza (+-C)
- Dados antigos: alta incerteza (+-3-7C)
- Dados modernos: baixa incerteza (+-0.1C)
- Importante considerar nas analises

---

# Comandos Uteis

```bash
# Iniciar ambiente
cd docker && docker-compose up -d

# Ver logs
docker-compose logs -f postgres

# Conectar ao PostgreSQL
docker exec -it climate_postgres psql -U climate -d climate_db

# Rodar testes
pytest tests/ -v

# Parar ambiente
docker-compose down

# Rodar Streamlit
streamlit run streamlit_app/app.py
```

---

*Fim do Passo a Passo*
