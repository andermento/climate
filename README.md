# Climate ETL Pipeline

<div align="center">

![Python](https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Streamlit](https://img.shields.io/badge/Streamlit-Dashboard-FF4B4B?style=for-the-badge&logo=streamlit&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Pipeline ETL completo para analise de tendencias climaticas globais**

*Processando 272 anos de dados de temperatura (1743-2015)*

[Instalacao](#-instalacao) |
[Como Usar](#-como-executar-o-pipeline) |
[Arquitetura](#-arquitetura) |
[Queries](#-exemplos-de-queries)

</div>

---

## Descricao do Projeto

Este projeto implementa um **pipeline ETL (Extract, Transform, Load)** completo para analise de dados climaticos globais. O objetivo e processar mais de **10 milhoes de registros** de medicoes de temperatura, transformando dados brutos em insights sobre o aquecimento global.

### Destaques

- **10+ milhoes** de registros processados
- **272 anos** de dados historicos (1743-2015)
- **243 paises** e **3.490 cidades** monitoradas
- **Star Schema** otimizado para analytics
- **Dashboard interativo** com Streamlit
- **Testes automatizados** com cobertura de codigo

---

## Dados Utilizados

| Arquivo | Registros | Periodo | Cobertura |
|---------|-----------|---------|-----------|
| `GlobalTemperatures.csv` | 3.192 | 1750-2015 | Global agregado |
| `GlobalLandTemperaturesByCountry.csv` | 577.462 | 1743-2013 | 243 paises |
| `GlobalLandTemperaturesByState.csv` | 645.675 | 1855-2013 | 241 estados |
| `GlobalLandTemperaturesByMajorCity.csv` | 239.177 | 1849-2013 | 100 cidades principais |
| `GlobalLandTemperaturesByCity.csv` | 8.599.212 | 1743-2013 | 3.490 cidades |

**Fonte:** [Berkeley Earth](http://berkeleyearth.org/) via [Kaggle](https://www.kaggle.com/berkeleyearth/climate-change-earth-surface-temperature-data)

---

## Arquitetura

### Diagrama do Pipeline

```
+-------------------------------------------------------------------------+
|                            APACHE AIRFLOW                                |
|  +-------------+   +---------------+   +-----------+   +---------------+ |
|  |   EXTRACT   | > |   TRANSFORM   | > |    LOAD   | > | QUALITY CHECK | |
|  | (CSV Files) |   | (Clean/Parse) |   | (Postgres)|   | (Validation)  | |
|  +-------------+   +---------------+   +-----------+   +---------------+ |
+-------------------------------------------------------------------------+
        |                   |                  |
        v                   v                  v
+---------------+   +---------------+   +------------------+
|   data/raw/   |   |  Star Schema  |   |    PostgreSQL    |
|   (572 MB)    |   |  Dimensions   |   |   Data Warehouse |
|   5 CSVs      |   |  + Facts      |   |                  |
+---------------+   +---------------+   +------------------+
                                               |
                                               v
                                    +--------------------+
                                    |     STREAMLIT      |
                                    |     Dashboard      |
                                    | (Visualizacoes)    |
                                    +--------------------+
```

### Star Schema (Modelo Dimensional)

```
                    +------------------+
                    |    dim_date      |
                    +------------------+
                    | date_id (PK)     |
                    | full_date        |
                    | year             |
                    | month            |
                    | quarter          |
                    | decade           |
                    | century          |
                    | is_modern_era    |
                    +------------------+
                            |
                            | 1:N
                            v
+------------------+    +------------------------+
|  dim_location    |    |   fact_temperature     |
+------------------+    +------------------------+
| location_id (PK) |--->| temperature_id (PK)    |
| granularity      |    | date_id (FK)           |
| city             |    | location_id (FK)       |
| state            |    | avg_temperature        |
| country          |    | avg_temp_uncertainty   |
| latitude         |    | land_max_temperature   |
| longitude        |    | land_min_temperature   |
| hemisphere_ns    |    | source_file            |
| hemisphere_ew    |    | loaded_at              |
+------------------+    +------------------------+
```

---

## Stack Tecnologico

| Componente | Tecnologia | Versao |
|------------|------------|--------|
| Linguagem | Python | 3.11+ |
| Containerizacao | Docker + Compose | 3.8+ |
| Orquestracao | Apache Airflow | 2.8+ |
| Data Warehouse | PostgreSQL | 15 |
| Processamento | Pandas + PyArrow | 2.0+ |
| Visualizacao | Streamlit + Plotly | 1.30+ |
| Testes | Pytest + Coverage | 7.0+ |

---

## Pre-requisitos

Antes de comecar, certifique-se de ter instalado:

- **Python 3.11** ou superior
- **Docker** e **Docker Compose**
- **Git**
- **Make** (opcional, para comandos simplificados)

### Verificar instalacao

```bash
python --version    # Python 3.11+
docker --version    # Docker 20+
docker-compose --version  # Docker Compose 2+
```

---

## Instalacao

### 1. Clone o repositorio

```bash
git clone https://github.com/seu-usuario/climate-etl-pipeline.git
cd climate-etl-pipeline
```

### 2. Crie o ambiente virtual

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
.\venv\Scripts\activate   # Windows
```

### 3. Instale as dependencias

```bash
pip install -r requirements.txt
```

### 4. Configure as variaveis de ambiente

```bash
cp .env.example .env
# Edite o arquivo .env com suas configuracoes
```

### 5. Inicie os containers Docker

```bash
cd docker
docker-compose up -d
```

### 6. Verifique se tudo esta rodando

```bash
docker-compose ps
```

**Servicos disponiveis:**
- PostgreSQL: `localhost:5432`
- PgAdmin: `http://localhost:5050` (admin@climate.com / admin)

---

## Como Executar o Pipeline

### Opcao 1: Execucao Manual (Desenvolvimento)

```bash
# Ativar ambiente virtual
source venv/bin/activate

# Executar extracao
python -c "from src.extract.csv_extractor import CSVExtractor; e = CSVExtractor(); print(e.extract('global').head())"

# Executar transformacao
python -c "from src.transform.cleaners import clean_temperature_data; ..."

# Carregar no banco
python -c "from src.load.database_loader import DatabaseLoader; ..."
```

### Opcao 2: Via Airflow (Producao)

```bash
# Iniciar Airflow
docker-compose up -d airflow-webserver airflow-scheduler

# Acessar UI
open http://localhost:8080
# Login: admin / admin

# Ativar a DAG 'climate_etl_dag'
```

### Opcao 3: Dashboard Streamlit

```bash
cd streamlit_app
streamlit run app.py
# Acesse: http://localhost:8501
```

---

## Exemplos de Queries

### Temperatura Media por Decada

```sql
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
```

**Resultado esperado:**
```
 decade | avg_temp | avg_uncertainty | measurements
--------+----------+-----------------+--------------
   1750 |     8.72 |           1.523 |          120
   1760 |     8.39 |           1.471 |          120
   ...
   2000 |     9.85 |           0.054 |          120
   2010 |    10.12 |           0.049 |           72
```

### Top 10 Anos Mais Quentes

```sql
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

### Comparacao entre Paises

```sql
SELECT
    l.country,
    ROUND(AVG(f.avg_temperature)::numeric, 2) as avg_temp,
    COUNT(*) as records
FROM climate.fact_temperature f
JOIN climate.dim_location l ON f.location_id = l.location_id
WHERE l.granularity = 'country'
  AND f.avg_temperature IS NOT NULL
GROUP BY l.country
ORDER BY avg_temp DESC
LIMIT 10;
```

---

## Screenshots do Dashboard

### Pagina Principal
```
+------------------------------------------------------------------+
|  CLIMATE TEMPERATURE ANALYSIS                                     |
|  Explorando 272 anos de dados climaticos globais (1743-2015)     |
+------------------------------------------------------------------+
|                                                                   |
|  +------------+  +------------+  +------------+  +------------+   |
|  | 10M+       |  | 1743-2015  |  | 243        |  | 3,490      |   |
|  | Registros  |  | Periodo    |  | Paises     |  | Cidades    |   |
|  +------------+  +------------+  +------------+  +------------+   |
|                                                                   |
+------------------------------------------------------------------+
```

### Tendencias Globais
```
+------------------------------------------------------------------+
|  AQUECIMENTO GLOBAL POR DECADA                                    |
+------------------------------------------------------------------+
|                                                            ****   |
|                                                      *****        |
|                                                *****              |
|                                          ******                   |
|  Temperatura (C)                   ******                         |
|                              *******                              |
|                        *******                                    |
|                  *******                                          |
|            ******                                                 |
|      ******                                                       |
|  ****                                                             |
+------------------------------------------------------------------+
|  1750   1800   1850   1900   1950   2000   2010                  |
+------------------------------------------------------------------+
```

### Analise por Pais
```
+------------------------------------------------------------------+
|  ANALISE POR PAIS                                                 |
+------------------------------------------------------------------+
|  Selecione um pais: [Brazil v]                                    |
|                                                                   |
|  +-----------------------------------------------------------+   |
|  |  Evolucao da Temperatura - Brazil                         |   |
|  |                                                  ___       |   |
|  |                                            _____/          |   |
|  |                                     ______/                |   |
|  |  25.2C                        _____/                       |   |
|  |                          ____/                             |   |
|  |                    _____/                                  |   |
|  |              _____/                                        |   |
|  |  24.8C _____/                                              |   |
|  +-----------------------------------------------------------+   |
|     1900    1920    1940    1960    1980    2000    2013         |
+------------------------------------------------------------------+
```

---

## Estrutura do Projeto

```
climate-etl-pipeline/
|-- README.md                 # Este arquivo
|-- requirements.txt          # Dependencias Python
|-- .env.example             # Template de variaveis de ambiente
|-- .gitignore               # Arquivos ignorados pelo Git
|
|-- data/
|   |-- raw/                 # CSVs originais (572 MB)
|   |-- processed/           # Dados transformados
|   +-- sample/              # Amostras para testes
|
|-- src/
|   |-- config.py            # Configuracoes centralizadas
|   |-- extract/
|   |   +-- csv_extractor.py # Extracao de CSVs
|   |-- transform/
|   |   |-- cleaners.py      # Limpeza de dados
|   |   +-- transformers.py  # Transformacoes dimensionais
|   |-- load/
|   |   +-- database_loader.py # Carregamento no PostgreSQL
|   +-- utils/
|       +-- coordinates.py   # Parser de coordenadas
|
|-- docker/
|   |-- docker-compose.yml   # Orquestracao de containers
|   +-- init-db.sql          # Script de inicializacao do banco
|
|-- sql/
|   |-- ddl/                 # Scripts de criacao de tabelas
|   +-- analytics/           # Queries de analise
|
|-- streamlit_app/
|   |-- app.py               # Dashboard principal
|   +-- pages/               # Paginas adicionais
|
|-- tests/
|   |-- unit/                # Testes unitarios
|   +-- integration/         # Testes de integracao
|
+-- docs/                    # Documentacao adicional
```

---

## Testes

### Executar todos os testes

```bash
pytest tests/ -v
```

### Com cobertura de codigo

```bash
pytest tests/ --cov=src --cov-report=html
open htmlcov/index.html
```

### Apenas testes unitarios

```bash
pytest tests/unit/ -v
```

---

## Roadmap

- [x] Estrutura base do projeto
- [x] Modulo de extracao (CSV)
- [x] Modulo de transformacao
- [x] Modulo de carregamento (PostgreSQL)
- [x] Docker Compose setup
- [x] Star Schema implementado
- [ ] DAG do Airflow completa
- [ ] Dashboard Streamlit completo
- [ ] Testes de integracao
- [ ] CI/CD com GitHub Actions
- [ ] Documentacao API

---



## Licenca

Este projeto esta sob a licenca MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.


---

<div align="center">


</div>
