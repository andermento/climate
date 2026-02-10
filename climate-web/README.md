# Climate Web - Interactive Temperature Visualization

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Mapbox](https://img.shields.io/badge/Mapbox-GL-000?style=for-the-badge&logo=mapbox&logoColor=white)

**Interactive web interface for exploring 272 years of global climate data**

[Live Demo](#) | [Documentation](../FRONTEND.md) | [API Reference](#api-endpoints)

</div>

---

## Features

- **Interactive Map** - Visualize temperature data on a Mapbox-powered heatmap
- **Advanced Filtering** - Filter by year, month, season, country, and city
- **Temperature Charts** - Line charts showing temporal trends
- **Decade Analysis** - Bar charts comparing temperatures by decade
- **Dark Theme** - Windy.com-inspired dark interface
- **Responsive Design** - Works on desktop and mobile devices
- **Real-time Data** - Connected to Supabase PostgreSQL database

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Maps | Mapbox GL JS + react-map-gl |
| Database | Supabase (PostgreSQL) |
| State | React Hooks + React Query |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier)
- Mapbox account (free tier)

### Installation

1. **Clone and navigate to the project:**

```bash
cd climate-web
```

2. **Install dependencies:**

```bash
npm install
```

3. **Configure environment variables:**

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your-mapbox-token
```

4. **Run the development server:**

```bash
npm run dev
```

5. **Open in browser:**

```
http://localhost:3000
```

---

## Project Structure

```
climate-web/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── temperatures/  # GET /api/temperatures
│   │   ├── countries/     # GET /api/countries
│   │   ├── cities/search/ # GET /api/cities/search
│   │   └── global/        # GET /api/global
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # Base UI components
│   ├── layout/            # Header, Sidebar
│   ├── map/               # ClimateMap
│   ├── charts/            # Recharts components
│   ├── filters/           # Filter components
│   └── cards/             # Metric cards
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and types
└── scripts/               # Data migration scripts
```

---

## API Endpoints

### GET /api/temperatures

Fetch temperature data with filters.

**Query Parameters:**
- `yearStart` - Start year (default: 1743)
- `yearEnd` - End year (default: 2015)
- `months` - Comma-separated month numbers
- `country` - Country name
- `city` - City name
- `limit` - Max records (default: 1000)

**Example:**
```
GET /api/temperatures?yearStart=2000&yearEnd=2010&country=Brazil
```

### GET /api/countries

Get list of all countries.

### GET /api/cities/search

Search cities by name.

**Query Parameters:**
- `q` - Search query (min 2 characters)

### GET /api/global

Get global statistics and decade averages.

---

## Database Setup (Supabase)

1. **Create a new Supabase project**

2. **Run the SQL schema:**

```sql
-- See ../docker/init-db.sql for full schema
CREATE SCHEMA IF NOT EXISTS climate;

CREATE TABLE climate.dim_date (...);
CREATE TABLE climate.dim_location (...);
CREATE TABLE climate.fact_temperature (...);
```

3. **Migrate data:**

```bash
python scripts/migrate-to-supabase.py
```

---

## Deployment

### Deploy to Vercel

1. Push your code to GitHub

2. Import the repository in Vercel

3. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_MAPBOX_TOKEN`

4. Deploy!

---

## Color Palette

| Element | Color | Hex |
|---------|-------|-----|
| Background | Dark Blue | `#1a1a2e` |
| Card | Darker Blue | `#16213e` |
| Text | Light Gray | `#e0e0e0` |
| Accent | Teal | `#4ecca3` |
| Hot Temp | Red | `#ff6b6b` |
| Cold Temp | Cyan | `#4ecdc4` |

---

## Performance

- Server-side rendering for initial load
- Client-side data fetching with caching
- Lazy loading of map component
- Optimized chart rendering
- Debounced search inputs

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is part of the Climate ETL Pipeline project.
See the main [LICENSE](../LICENSE) file for details.

---

<div align="center">

**Built with Next.js and Tailwind CSS**

</div>
# climate
