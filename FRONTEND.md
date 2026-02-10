# FRONTEND.md - Interface Web React para Climate Data

> **Projeto:** Climate ETL Pipeline - Frontend React
> **Estilo:** Windy.com (dark theme, mapa interativo)
> **Deploy:** Vercel (gratuito)

---

## Visao Geral

Criar uma interface web moderna com React, estilo Windy.com, para visualizar dados climaticos historicos (1743-2015) com:
- **Backend:** Supabase (PostgreSQL gratuito na nuvem)
- **Mapa:** Mapbox (mapa interativo com gradientes)
- **Deploy:** Vercel (gratuito) + GitHub
- **Custo:** 100% gratuito

---

## Stack Tecnologico

| Componente | Tecnologia | Justificativa |
|------------|------------|---------------|
| **Framework** | Next.js 14 | App Router, SSR, otimizado para Vercel |
| **Linguagem** | TypeScript | Tipagem forte, menos bugs |
| **Estilizacao** | Tailwind CSS | Rapido, responsivo, tema escuro |
| **Graficos** | Recharts | Leve, React-native, interativo |
| **Mapa** | Mapbox GL JS | Mapas profissionais, 50K loads/mes gratis |
| **Backend** | Supabase | PostgreSQL gratuito, 500MB, API REST |
| **Deploy** | Vercel | CI/CD automatico, gratuito |
| **UI Components** | shadcn/ui | Componentes modernos, acessiveis |

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────────┐
│                           VERCEL                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    NEXT.JS 14 APP                            │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │    │
│  │  │  Mapa    │  │ Graficos │  │ Filtros  │  │  Cards   │    │    │
│  │  │ (Mapbox) │  │(Recharts)│  │(shadcn)  │  │  (UI)    │    │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                       │
│                              ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    API ROUTES                                │    │
│  │  /api/temperatures  /api/countries  /api/cities  /api/global │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          SUPABASE                                    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    PostgreSQL                                │    │
│  │  ┌──────────┐  ┌──────────────┐  ┌────────────────────┐     │    │
│  │  │dim_date  │  │ dim_location │  │ fact_temperature   │     │    │
│  │  └──────────┘  └──────────────┘  └────────────────────┘     │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Interface Visual (Baseada no Windy.com)

### Layout Principal

```
┌─────────────────────────────────────────────────────────────────────┐
│ HEADER: Logo | Filtros Rapidos | Busca Cidade | Theme Toggle        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────┐                                                       │
│  │ SIDEBAR  │         MAPA INTERATIVO (MAPBOX)                      │
│  │          │         - Gradiente de cores por temperatura          │
│  │ Filtros: │         - Pontos clicaveis por cidade                 │
│  │ - Ano    │         - Zoom e navegacao                            │
│  │ - Mes    │         - Popup com dados ao clicar                   │
│  │ - Pais   │                                                       │
│  │ - Cidade │                                                       │
│  │          │                                                       │
│  └──────────┘                                                       │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                    PAINEL INFERIOR (GRAFICOS)                        │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  Grafico de Linha: Temperatura ao Longo do Tempo           │     │
│  │  [Metricas] Avg: 14.5°C | Max: 32°C | Min: -5°C            │     │
│  └────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

### Tema Escuro (Como Windy)

| Elemento | Cor | Hex |
|----------|-----|-----|
| Background | Azul escuro | `#1a1a2e` |
| Cards | Azul mais escuro | `#16213e` |
| Texto | Cinza claro | `#e0e0e0` |
| Accent | Verde agua | `#4ecca3` |
| Temperatura quente | Vermelho | `#ff6b6b` |
| Temperatura fria | Azul esverdeado | `#4ecdc4` |

---

## Estrutura do Projeto

```
climate-web/
├── README.md
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── .env.local.example
├── .gitignore
│
├── app/
│   ├── layout.tsx              # Layout principal
│   ├── page.tsx                # Home (Mapa + Dashboard)
│   ├── globals.css             # Estilos globais
│   │
│   ├── api/
│   │   ├── temperatures/
│   │   │   └── route.ts        # GET temperaturas filtradas
│   │   ├── countries/
│   │   │   └── route.ts        # GET lista de paises
│   │   ├── cities/
│   │   │   ├── route.ts        # GET lista de cidades
│   │   │   └── search/
│   │   │       └── route.ts    # GET busca de cidades
│   │   └── global/
│   │       └── route.ts        # GET dados globais agregados
│   │
│   └── dashboard/
│       └── page.tsx            # Pagina alternativa sem mapa
│
├── components/
│   ├── ui/                     # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── select.tsx
│   │   ├── input.tsx
│   │   ├── slider.tsx
│   │   └── ...
│   │
│   ├── layout/
│   │   ├── Header.tsx          # Cabecalho
│   │   ├── Sidebar.tsx         # Barra lateral com filtros
│   │   └── Footer.tsx          # Rodape
│   │
│   ├── map/
│   │   ├── ClimateMap.tsx      # Mapa Mapbox principal
│   │   ├── MapMarkers.tsx      # Marcadores de cidades
│   │   ├── HeatmapLayer.tsx    # Camada de calor
│   │   └── MapControls.tsx     # Controles do mapa
│   │
│   ├── charts/
│   │   ├── TemperatureChart.tsx    # Grafico de linha temporal
│   │   ├── DecadeChart.tsx         # Grafico por decada
│   │   ├── SeasonalChart.tsx       # Grafico sazonal
│   │   └── ComparisonChart.tsx     # Comparacao de regioes
│   │
│   ├── filters/
│   │   ├── YearFilter.tsx          # Filtro de ano/range de anos
│   │   ├── MonthFilter.tsx         # Filtro de mes/meses
│   │   ├── CountryFilter.tsx       # Dropdown de pais
│   │   ├── CitySearch.tsx          # Busca de cidade
│   │   └── FilterPanel.tsx         # Painel completo de filtros
│   │
│   └── cards/
│       ├── MetricsCard.tsx         # Card com metricas
│       ├── TemperatureCard.tsx     # Card de temperatura
│       └── LocationCard.tsx        # Card de localizacao
│
├── lib/
│   ├── supabase.ts             # Cliente Supabase
│   ├── mapbox.ts               # Configuracao Mapbox
│   ├── utils.ts                # Funcoes utilitarias
│   └── types.ts                # TypeScript types
│
├── hooks/
│   ├── useTemperatures.ts      # Hook para buscar temperaturas
│   ├── useCountries.ts         # Hook para lista de paises
│   ├── useCities.ts            # Hook para cidades
│   └── useFilters.ts           # Hook para estado dos filtros
│
├── styles/
│   └── map.css                 # Estilos especificos do mapa
│
└── public/
    ├── favicon.ico
    └── images/
```

---

## Funcionalidades dos Filtros

### 1. Filtro de Ano

```typescript
interface YearFilter {
  type: 'single' | 'range' | 'multiple';
  single?: number;           // Ex: 2010
  range?: {                  // Ex: 1990-2010
    start: number;
    end: number;
  };
  multiple?: number[];       // Ex: [1990, 2000, 2010]
}
```

**Funcionalidades:**
- Selecionar um ano especifico
- Selecionar um intervalo de anos (1990-2010)
- Selecionar multiplos anos nao consecutivos

### 2. Filtro de Mes

```typescript
interface MonthFilter {
  type: 'single' | 'multiple' | 'season';
  single?: number;           // Ex: 9 (Setembro)
  multiple?: number[];       // Ex: [6, 7, 8] (Verao)
  season?: 'spring' | 'summer' | 'fall' | 'winter';
}
```

**Funcionalidades:**
- Selecionar um mes especifico
- Selecionar multiplos meses
- Selecionar por estacao (Verao, Inverno, etc.)

### 3. Filtro de Pais

```typescript
interface CountryFilter {
  countries: string[];       // Ex: ['Brazil', 'Argentina']
}
```

**Funcionalidades:**
- Dropdown com lista de 243 paises
- Multi-select para comparar paises

### 4. Busca de Cidade

```typescript
interface CitySearch {
  query: string;             // Texto digitado
  results: City[];           // Resultados da busca
  selected?: City;           // Cidade selecionada
}
```

**Funcionalidades:**
- Autocomplete ao digitar
- Exibe cidade + pais nos resultados
- Zoom no mapa ao selecionar

---

## Etapas de Implementacao

### FASE 1: Setup Supabase (Backend)

| # | Tarefa | Descricao |
|---|--------|-----------|
| 1 | Criar conta Supabase | Acessar supabase.com, criar conta gratuita |
| 2 | Criar projeto | Nome: "climate-data" |
| 3 | Criar tabelas | dim_date, dim_location, fact_temperature |
| 4 | Migrar dados | Script Python para carregar CSVs |
| 5 | Criar indices | Otimizar queries frequentes |
| 6 | Configurar RLS | Row Level Security para leitura publica |

### FASE 2: Setup Projeto Next.js

| # | Tarefa | Comando/Descricao |
|---|--------|-------------------|
| 7 | Criar projeto | `npx create-next-app@latest climate-web --typescript --tailwind --app` |
| 8 | Instalar deps | `npm install @supabase/supabase-js mapbox-gl react-map-gl recharts` |
| 9 | Configurar env | Criar `.env.local` com chaves |
| 10 | Tailwind escuro | Configurar tema dark estilo Windy |

### FASE 3: Componentes Base

| # | Tarefa | Arquivo |
|---|--------|---------|
| 11 | UI Components | `npx shadcn-ui@latest init` |
| 12 | Header | `components/layout/Header.tsx` |
| 13 | Sidebar | `components/layout/Sidebar.tsx` |

### FASE 4: API Routes

| # | Endpoint | Funcao |
|---|----------|--------|
| 14 | `/api/temperatures` | Busca filtrada de temperaturas |
| 15 | `/api/countries` | Lista de paises |
| 16 | `/api/cities/search` | Busca de cidades |
| 17 | `/api/global` | Dados globais agregados |

### FASE 5: Filtros

| # | Componente | Funcao |
|---|------------|--------|
| 18 | YearFilter | Slider + range de anos |
| 19 | MonthFilter | Checkboxes + estacoes |
| 20 | CountryFilter | Dropdown multi-select |
| 21 | CitySearch | Input com autocomplete |
| 22 | FilterPanel | Agrupa todos os filtros |

### FASE 6: Mapa Mapbox

| # | Tarefa | Descricao |
|---|--------|-----------|
| 23 | Configurar Mapbox | Token + estilo escuro |
| 24 | Camada de pontos | Cidades como marcadores |
| 25 | Heatmap layer | Gradiente de temperatura |
| 26 | Popup | Dados ao clicar cidade |
| 27 | Sincronizar | Filtros atualizando mapa |

### FASE 7: Graficos

| # | Componente | Tipo |
|---|------------|------|
| 28 | TemperatureChart | Linha temporal |
| 29 | DecadeChart | Barras por decada |
| 30 | SeasonalChart | Radar/polar por mes |
| 31 | Sincronizar | Graficos com filtros |

### FASE 8: Integracao

| # | Tarefa | Descricao |
|---|--------|-----------|
| 32 | Conectar componentes | Estado global |
| 33 | React Query | Cache e fetching |
| 34 | Loading states | Skeletons e spinners |
| 35 | Responsividade | Mobile-first |

### FASE 9: Deploy

| # | Tarefa | Descricao |
|---|--------|-----------|
| 36 | GitHub repo | Criar repositorio |
| 37 | Conectar Vercel | Import do GitHub |
| 38 | Env vars | Configurar na Vercel |
| 39 | Deploy | Automatico a cada push |

### FASE 10: Polimento

| # | Tarefa | Descricao |
|---|--------|-----------|
| 40 | Otimizar queries | Paginacao, cache |
| 41 | Animacoes | Framer Motion |
| 42 | SEO | Meta tags, Open Graph |
| 43 | README | Screenshots, docs |

---

## Configuracoes Necessarias

### .env.local

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1I...
```

### Limites Gratuitos

| Servico | Limite Gratuito | Suficiente? |
|---------|-----------------|-------------|
| **Supabase** | 500MB DB, 50K requests/mes | Sim |
| **Mapbox** | 50K map loads/mes | Sim |
| **Vercel** | 100GB bandwidth, unlimited deploys | Sim |
| **GitHub** | Ilimitado para repos publicos | Sim |

---

## Queries SQL para Supabase

### Temperaturas Filtradas

```sql
SELECT
  d.full_date,
  d.year,
  d.month,
  l.city,
  l.country,
  l.latitude,
  l.longitude,
  f.avg_temperature
FROM fact_temperature f
JOIN dim_date d ON f.date_id = d.date_id
JOIN dim_location l ON f.location_id = l.location_id
WHERE d.year BETWEEN $1 AND $2
  AND d.month = ANY($3)
  AND l.country = $4
ORDER BY d.full_date
LIMIT 1000;
```

### Busca de Cidades

```sql
SELECT DISTINCT city, country, latitude, longitude
FROM dim_location
WHERE city ILIKE $1 || '%'
  AND granularity = 'city'
ORDER BY city
LIMIT 20;
```

### Media por Decada

```sql
SELECT
  d.decade,
  ROUND(AVG(f.avg_temperature)::numeric, 2) as avg_temp,
  COUNT(*) as measurements
FROM fact_temperature f
JOIN dim_date d ON f.date_id = d.date_id
JOIN dim_location l ON f.location_id = l.location_id
WHERE l.granularity = 'global'
GROUP BY d.decade
ORDER BY d.decade;
```

### Media por Mes (Sazonal)

```sql
SELECT
  d.month,
  d.month_name,
  ROUND(AVG(f.avg_temperature)::numeric, 2) as avg_temp
FROM fact_temperature f
JOIN dim_date d ON f.date_id = d.date_id
JOIN dim_location l ON f.location_id = l.location_id
WHERE l.country = $1
  AND d.year BETWEEN $2 AND $3
GROUP BY d.month, d.month_name
ORDER BY d.month;
```

---

## Complexidade por Fase

| Fase | Descricao | Complexidade |
|------|-----------|--------------|
| 1 | Setup Supabase | Media |
| 2 | Setup Next.js | Baixa |
| 3 | Componentes Base | Baixa |
| 4 | API Routes | Media |
| 5 | Filtros | Media |
| 6 | Mapa Mapbox | Alta |
| 7 | Graficos | Media |
| 8 | Integracao | Alta |
| 9 | Deploy | Baixa |
| 10 | Polimento | Media |

---

## Arquivos Criticos

| # | Arquivo | Funcao | Prioridade |
|---|---------|--------|------------|
| 1 | `lib/supabase.ts` | Cliente Supabase | Alta |
| 2 | `app/api/temperatures/route.ts` | API de temperaturas | Alta |
| 3 | `components/map/ClimateMap.tsx` | Mapa principal | Alta |
| 4 | `components/charts/TemperatureChart.tsx` | Grafico temporal | Media |
| 5 | `components/filters/FilterPanel.tsx` | Painel de filtros | Media |
| 6 | `app/page.tsx` | Pagina principal | Alta |
| 7 | `hooks/useFilters.ts` | Estado dos filtros | Media |

---

## Dependencias NPM

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.39.0",
    "mapbox-gl": "^3.0.0",
    "react-map-gl": "^7.1.0",
    "recharts": "^2.10.0",
    "@tanstack/react-query": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "lucide-react": "^0.300.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0"
  }
}
```

---

## Resultado Esperado

Uma interface web moderna, responsiva, com tema escuro estilo Windy.com que permite:

1. **Visualizar** dados de temperatura em mapa interativo
2. **Filtrar** por ano, grupo de anos, mes, grupo de meses
3. **Filtrar** por pais (dropdown)
4. **Buscar** cidade por nome (autocomplete)
5. **Ver graficos** de evolucao temporal
6. **Explorar** 272 anos de dados climaticos
7. **Acessar** de qualquer dispositivo (responsivo)
8. **Deploy gratuito** na Vercel

---

## Links Uteis

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)
- [Recharts](https://recharts.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vercel Deployment](https://vercel.com/docs)

---

*Ultima atualizacao: 2025-02-09*
*Versao: 1.0*
