# GitHub Profile Analyzer

A backend service that fetches public GitHub user data, extracts meaningful insights, and persists them in a MySQL database.

Built with **Node.js**, **Express.js**, and **MySQL**.

---

## What It Does

- Hits the GitHub public API to pull profile data, repository stats, and language usage
- Computes derived metrics (total stars, fork ratio, follower-to-repo ratio, etc.)
- Stores everything in MySQL across two normalized tables
- Exposes a clean REST API to trigger analysis, list all profiles, or pull a single one
- Handles rate limiting, input validation, and graceful error messages out of the box

---

## Project Structure

```
├── server.js                   # Entry point
├── src/
│   ├── app.js                  # Express app setup
│   ├── config/
│   │   └── db.js               # MySQL connection pool
│   ├── controllers/
│   │   └── profile.controller.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── models/
│   │   └── profile.model.js    # All SQL queries
│   ├── routes/
│   │   └── profiles.js
│   └── services/
│       └── github.service.js   # GitHub API calls + insight builder
├── scripts/
│   └── schema.sql              # Database schema
├── postman_collection.json
└── .env.example
```

---

## Setup

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- A GitHub personal access token *(optional but strongly recommended)*

### 1. Clone & install

```bash
git clone <your-repo-url>
cd github-profile-analyzer
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Open `.env` and fill in your MySQL credentials:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=github_analyzer

# Optional — raises GitHub API limit from 60 to 5000 requests/hour
GITHUB_TOKEN=ghp_your_token_here
```

### 3. Create the database

```bash
mysql -u root -p < scripts/schema.sql
```

Or run the contents of `scripts/schema.sql` manually in your MySQL client.

### 4. Start the server

```bash
# Production
npm start

# Development (auto-restarts on file changes, Node 18+)
npm run dev
```

---

## API Reference

Base URL: `http://localhost:3000`

---

### `GET /health`

Check server status.

```json
{
  "success": true,
  "status": "online",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": "42s"
}
```

---

### `POST /api/profiles/analyze/:username`

Fetch a GitHub user's data, compute insights, and store them in MySQL. If the user was already analyzed before, their record is updated.

```bash
POST /api/profiles/analyze/torvalds
```

**Response:**
```json
{
  "success": true,
  "message": "Profile @torvalds analyzed and stored successfully.",
  "data": {
    "username": "torvalds",
    "name": "Linus Torvalds",
    "followers": 236000,
    "public_repos": 8,
    "total_stars": 192000,
    "top_languages": [
      { "language": "C", "repo_count": 4 }
    ]
  }
}
```

---

### `POST /api/profiles/analyze/:username/refresh`

Re-fetch and overwrite an existing profile's data. Useful for keeping records up to date.

---

### `GET /api/profiles`

List all analyzed profiles with pagination and sorting.

**Query params:**

| Param   | Default            | Options                                              |
|---------|--------------------|------------------------------------------------------|
| `page`  | `1`                | Any positive integer                                 |
| `limit` | `20`               | `1–100`                                              |
| `sort`  | `last_analyzed_at` | `last_analyzed_at`, `followers`, `total_stars`, `public_repos`, `username` |
| `order` | `desc`             | `asc`, `desc`                                        |

```bash
GET /api/profiles?sort=total_stars&order=desc&limit=10
```

---

### `GET /api/profiles/:username`

Get stored insights for a single profile.

```bash
GET /api/profiles/torvalds
```

Returns 404 if the user hasn't been analyzed yet.

---

### `DELETE /api/profiles/:username`

Remove a profile and all associated language data from the database.

```bash
DELETE /api/profiles/torvalds
```

---

## Stored Insights

| Field                    | Description                                        |
|--------------------------|----------------------------------------------------|
| `github_id`              | Stable numeric GitHub user ID                      |
| `username`               | GitHub login handle                                |
| `name`, `bio`, `location`| Public profile fields                              |
| `followers`, `following` | Follower/following counts                          |
| `public_repos`           | Number of public repositories                      |
| `total_stars`            | Sum of stars across all public repos               |
| `total_forks`            | Sum of forks across all public repos               |
| `original_repos`         | Repos the user actually created (not forked)       |
| `forked_repos`           | Repos that are forks of other projects             |
| `most_starred_repo`      | Name of the user's most-starred repository         |
| `follower_to_repo_ratio` | `followers / public_repos` — rough popularity gauge |
| `top_languages`          | Up to 5 most-used programming languages            |
| `last_analyzed_at`       | Timestamp of the most recent analysis run          |

---

## Rate Limits

The service applies a default limit of **100 requests per 15 minutes** per IP to protect the GitHub API quota.

Without a `GITHUB_TOKEN`, GitHub caps unauthenticated requests at **60/hour**. With a token, this rises to **5,000/hour**. For any serious usage, set one.

---

## Database Schema

See [`scripts/schema.sql`](scripts/schema.sql) for the full schema. Two tables:

- **`profiles`** — one row per GitHub user, holds all insights
- **`profile_languages`** — one row per language per user (FK → profiles)

---

## Postman Collection

Import `postman_collection.json` into Postman. Set the `base_url` variable to your server URL and you're ready to go.
