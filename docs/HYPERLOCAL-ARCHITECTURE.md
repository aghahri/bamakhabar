# Hyperlocal-Ready Architecture

The schema is designed so you can expand to full hyperlocal (city, district, neighborhood, topics, GIS, relevance) and maps later **without breaking existing flows**. Nothing is required today; all new fields are optional.

---

## Models Added / Extended

### 1. **Ingestion** (raw content before it becomes News)

- `sourceUrl`, `sourceType` – where the content came from (e.g. RSS, scraper).
- `rawTitle`, `rawBody`, `rawSummary` – raw text for processing.
- `extractedCity`, `extractedDistrict`, `extractedNeighborhoodName` – place names you can parse from text and later match to `Neighborhood` or city/district.
- `status` – `PENDING` → `PROCESSING` → `PROCESSED` or `FAILED`.
- `processedNewsId` – links to the `News` row once you create it.
- `errorMessage` – for failed ingestions.

**Future use:** Run a job that reads `Ingestion` (e.g. `status = PENDING`), extracts city/district/neighborhood (and optionally coordinates), creates or links `News`, then sets `status = PROCESSED` and `processedNewsId`.

---

### 2. **News** (processed article – extended, not replaced)

Existing fields unchanged. Optional hyperlocal fields:

- **`city`** – city name when you don’t have a specific neighborhood (or in addition to it).
- **`district`** – district/region (منطقه).
- **`latitude`, `longitude`** – point for this article (e.g. event location). No map UI now; data is ready for a map later.
- **`localRelevanceScore`** – float (e.g. 0–1) for “how local” this article is; use later for ranking or filtering.
- **`localTopics`** – many-to-many with **LocalTopic** for tagging (traffic, schools, etc.) and later mapping to areas.

**Future use:**  
Fill these when creating/editing news (manually or from Ingestion). Use `latitude`/`longitude` for map markers; use `localRelevanceScore` for sorting/filtering; use `localTopics` for topic-based and area-based views.

---

### 3. **LocalTopic**

- `name`, `slug` – e.g. "ترافیک", "آموزش".
- `areaType` – optional: `"city"`, `"district"`, `"neighborhood"`, `"general"` for later area mapping.
- `parent` / `children` – optional hierarchy (e.g. parent topic per city).

**Future use:**  
Create topics, attach them to News via `localTopics`. Later you can map topics to city/district/neighborhood for “all local traffic news” etc., and optionally to maps.

---

### 4. **Neighborhood** (extended)

- **`latitude`, `longitude`** – optional center of the neighborhood. Not used by any map UI today; ready for centering a map or drawing a boundary later.

---

## What Is *Not* Implemented (By Design)

- No map UI; no rendering of points or polygons.
- No ingestion pipeline (no job that actually creates `News` from `Ingestion`).
- No automatic extraction of city/district/neighborhood or coordinates.
- No UI to edit `city`, `district`, `latitude`, `longitude`, `localRelevanceScore`, or `localTopics` on the news form (you can add these later without schema changes).

---

## What *Is* Ready

- **Schema:** All of the above exist and are optional. Existing code paths (create/edit news, list by neighborhood, etc.) keep working.
- **Queries:** You can already filter/sort by `city`, `district`, `latitude`, `longitude`, `localRelevanceScore`, and `localTopics` when you’re ready.
- **Maps later:** Storing coordinates on `News` and center on `Neighborhood` does not block any future map library (e.g. Leaflet, Mapbox); you only need to read these fields and plot them.

---

## Deploying the schema

Use **push** (no migrations in this repo):

```bash
npx prisma generate
npx prisma db push
```

All new columns and tables are additive and nullable, so existing data is unchanged.
