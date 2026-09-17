# Media Tracker

A full-stack web application designed to track and analyze personal movie and TV series watch history.

Built with Spring Boot (Java 25) on the backend and React (TypeScript, Vite, Tailwind CSS) on the frontend, containerized with Docker.

---

## Key Highlights & Architecture

- **Strict Normalization & UUIDv7**: Primary keys use time-sortable UUIDv7 to ensure high-throughput database inserts and index locality without B-Tree fragmentation.
- **Resilient Time-Series Analytics**: Activity charts use PostgreSQL's generate_series for seamless, gap-free date aggregation (daily, weekly, monthly, yearly) across formats and content types.
- **Zero-Loss Data Backup**: Full backup export/import via JSON using native batching (JdbcTemplate), bypassing ORM lifecycles to reliably preserve exact IDs, timestamps, and relational integrity.
- **Archiving vs. Cascading Deletions**: Explicit separation between hiding items from daily view (archived = true) and irreversible physical cascading deletion.
- **Enterprise-Grade Integration Testing**: 100% of critical business flows (analytics, cascading rules, backup restore) tested against real PostgreSQL instances via Testcontainers.
- **Self-Contained Deployment**: Multi-stage Docker build bundles the frontend assets directly into the backend runtime container.

---

## Tech Stack

### Backend
- **Language**: Java 25
- **Framework**: Spring Boot
- **Persistence**: Spring Data JPA, Hibernate, Flyway Migrations
- **Database**: PostgreSQL 16
- **API Documentation**: OpenAPI 3 / Swagger UI (SpringDoc)
- **Testing**: JUnit 5, AssertJ, Testcontainers (PostgreSQL)

### Frontend
- **Framework**: React 19, TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS
- **Data Visualization**: Chart.js / react-chartjs-2
- **Icons**: Lucide React
- **Client**: Axios with type generation via openapi-typescript

---

## Quick Start (Docker Compose)

### Prerequisites
- Docker and Docker Compose

### 1. Clone the repository
```bash
git clone https://github.com/kudryavcAS/media-tracker-rest.git
cd media-tracker-rest
```

### 2. Run with Docker Compose
```bash
docker compose up --build
```

### 3. Open the Application
- Frontend UI: http://localhost:8080
- Swagger API Docs: http://localhost:8080/swagger-ui.html

*(Optional: if port 5432 is already occupied by a local PostgreSQL instance on your host, create a .env file in the root with DOCKER_DB_PORT=5433 before running).*

---

## Local Development Setup

### Backend
```bash
cd backend
./mvnw clean spring-boot:run
```
*(Requires PostgreSQL running on localhost:5432 with database media_db).*

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Access the Vite development server at http://localhost:5173.

---

## License
MIT