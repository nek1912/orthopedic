# Phase 1: Monorepo Scaffold + Docker

**Goal:** Create the directory structure, Docker Compose for local PostgreSQL, and config files.

## Files to Create

```
d:\client_project\
├── docker-compose.yml
├── .gitignore
├── frontend/
│   └── (empty — scaffolded in Phase 7)
├── backend/
│   └── (empty — scaffolded in Phase 2)
└── shared/
    └── types/
        └── (empty — populated incrementally)
```

## Task: Create Docker Compose

Create `docker-compose.yml` with:
- PostgreSQL 16 service
- Port 5432 mapped
- Volume for persistence
- Default dev credentials: `dental_dev` / `dental_dev_pass` / `dental_clinic_dev`
- Health check

## Task: Create .gitignore

Standard Python + Node + IDE ignores. Include:
- `node_modules/`, `dist/`, `.env`, `venv/`, `__pycache__/`, `.pytest_cache/`

## Acceptance Criteria

- [ ] `docker-compose up -d` starts PostgreSQL
- [ ] Can connect to DB on localhost:5432
- [ ] Directory structure matches spec

## Constraints (from AGENTS.md)

- No comments in code unless explicitly asked
- Mobile-first strictly
- Never commit without explicit instruction
