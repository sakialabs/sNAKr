.PHONY: help build up down restart ps logs logs-api logs-web logs-db logs-redis logs-minio logs-celery clean shell-api shell-web shell-db test migrate ci-lint-api ci-lint-web ci-test-api ci-format-api ci-format-web ci-all

help:
	@echo "sNAKr Development Commands"
	@echo ""
	@echo "Docker Commands:"
	@echo "  make build          - Build all Docker containers"
	@echo "  make up             - Start all services"
	@echo "  make down           - Stop all services"
	@echo "  make restart        - Restart all services"
	@echo "  make ps             - Show running containers"
	@echo "  make clean          - Stop services and remove volumes"
	@echo ""
	@echo "Logs:"
	@echo "  make logs           - View logs from all services"
	@echo "  make logs-api       - View API logs"
	@echo "  make logs-web       - View web logs"
	@echo "  make logs-db        - View database logs"
	@echo "  make logs-redis     - View Redis logs"
	@echo "  make logs-minio     - View MinIO logs"
	@echo "  make logs-celery    - View Celery worker logs"
	@echo ""
	@echo "Shell Access:"
	@echo "  make shell-api      - Open shell in API container"
	@echo "  make shell-web      - Open shell in web container"
	@echo "  make shell-db       - Open PostgreSQL shell"
	@echo ""
	@echo "Development:"
	@echo "  make test           - Run API tests"
	@echo "  make migrate        - Run database migrations"
	@echo ""
	@echo "CI/CD:"
	@echo "  make ci-format-api  - Format API code"
	@echo "  make ci-format-web  - Format web code"
	@echo "  make ci-lint-api    - Lint API code"
	@echo "  make ci-lint-web    - Lint web code"
	@echo "  make ci-test-api    - Run API tests with coverage"
	@echo "  make ci-all         - Run all CI checks"

# Docker Commands
build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

restart:
	docker-compose restart

ps:
	docker-compose ps

clean:
	docker-compose down -v

# Logs
logs:
	docker-compose logs -f

logs-api:
	docker-compose logs -f api

logs-web:
	docker-compose logs -f web

logs-db:
	docker-compose logs -f db

logs-redis:
	docker-compose logs -f redis

logs-minio:
	docker-compose logs -f minio

logs-celery:
	docker-compose logs -f celery-worker

# Shell Access
shell-api:
	docker-compose exec api bash

shell-web:
	docker-compose exec web sh

shell-db:
	docker-compose exec db psql -U snakr_user -d snakr

# Development
test:
	docker-compose exec api pytest

migrate:
	docker-compose exec api alembic upgrade head

# CI/CD
ci-format-api:
	docker-compose exec api black .
	docker-compose exec api isort .

ci-format-web:
	docker-compose exec web npm run lint -- --fix

ci-lint-api:
	docker-compose exec api black --check .
	docker-compose exec api isort --check .
	docker-compose exec api flake8 .

ci-lint-web:
	docker-compose exec web npm run lint
	docker-compose exec web npm run type-check

ci-test-api:
	docker-compose exec api pytest --cov=. --cov-report=term-missing

ci-all: ci-lint-api ci-lint-web ci-test-api
	@echo "All CI checks passed!"
