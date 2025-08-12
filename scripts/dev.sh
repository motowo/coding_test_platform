#!/bin/bash

# =================================================================
# SkillGaug Development Commands
# =================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

function show_help() {
    echo "🛠️  SkillGaug Development Commands"
    echo "=================================="
    echo ""
    echo "Usage: ./scripts/dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start       Start all services"
    echo "  stop        Stop all services"
    echo "  restart     Restart all services"
    echo "  logs        Show logs for all services"
    echo "  logs-api    Show logs for API service only"
    echo "  logs-web    Show logs for Web service only"
    echo "  logs-db     Show logs for Database service only"
    echo "  status      Show status of all services"
    echo "  reset-db    Reset database (with confirmation)"
    echo "  seed        Seed database with sample data"
    echo "  shell-api   Open shell in API container"
    echo "  shell-web   Open shell in Web container"  
    echo "  shell-db    Open database shell"
    echo "  test        Run all tests"
    echo "  test-api    Run API tests only"
    echo "  test-web    Run Web tests only"
    echo "  lint        Run linting for all projects"
    echo "  build       Build all Docker images"
    echo "  clean       Clean Docker containers and volumes"
    echo "  help        Show this help message"
    echo ""
}

function start_services() {
    echo -e "${GREEN}🚀 Starting SkillGaug services...${NC}"
    docker-compose up -d
    echo -e "${GREEN}✅ Services started successfully!${NC}"
    echo ""
    echo "🌐 Access URLs:"
    echo "  • Web: http://localhost:3000"
    echo "  • API: http://localhost:4000"
    echo "  • Docs: http://localhost:4000/documentation"
}

function stop_services() {
    echo -e "${YELLOW}🛑 Stopping SkillGaug services...${NC}"
    docker-compose down
    echo -e "${GREEN}✅ Services stopped successfully!${NC}"
}

function restart_services() {
    echo -e "${YELLOW}🔄 Restarting SkillGaug services...${NC}"
    docker-compose down
    docker-compose up -d
    echo -e "${GREEN}✅ Services restarted successfully!${NC}"
}

function show_logs() {
    echo -e "${BLUE}📊 Showing logs for all services...${NC}"
    docker-compose logs -f
}

function show_logs_api() {
    echo -e "${BLUE}📊 Showing API logs...${NC}"
    docker-compose logs -f skillgaug-api
}

function show_logs_web() {
    echo -e "${BLUE}📊 Showing Web logs...${NC}"
    docker-compose logs -f skillgaug-web
}

function show_logs_db() {
    echo -e "${BLUE}📊 Showing Database logs...${NC}"
    docker-compose logs -f skillgaug-db
}

function show_status() {
    echo -e "${BLUE}📊 Service Status:${NC}"
    docker-compose ps
}

function reset_database() {
    echo -e "${YELLOW}⚠️  WARNING: This will delete all data in the database!${NC}"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🗑️ Resetting database...${NC}"
        docker-compose exec skillgaug-api npm run db:reset
        echo -e "${GREEN}✅ Database reset completed!${NC}"
    else
        echo -e "${BLUE}ℹ️ Database reset cancelled.${NC}"
    fi
}

function seed_database() {
    echo -e "${GREEN}🌱 Seeding database...${NC}"
    docker-compose exec skillgaug-api npm run db:seed
    echo -e "${GREEN}✅ Database seeded successfully!${NC}"
}

function shell_api() {
    echo -e "${BLUE}💻 Opening shell in API container...${NC}"
    docker-compose exec skillgaug-api sh
}

function shell_web() {
    echo -e "${BLUE}💻 Opening shell in Web container...${NC}"
    docker-compose exec skillgaug-web sh
}

function shell_db() {
    echo -e "${BLUE}💻 Opening database shell...${NC}"
    docker-compose exec skillgaug-db psql -U skillgaug -d skillgaug
}

function run_tests() {
    echo -e "${GREEN}🧪 Running all tests...${NC}"
    docker-compose exec skillgaug-api npm run test
    docker-compose exec skillgaug-web npm run test:unit
    echo -e "${GREEN}✅ All tests completed!${NC}"
}

function run_tests_api() {
    echo -e "${GREEN}🧪 Running API tests...${NC}"
    docker-compose exec skillgaug-api npm run test
    echo -e "${GREEN}✅ API tests completed!${NC}"
}

function run_tests_web() {
    echo -e "${GREEN}🧪 Running Web tests...${NC}"
    docker-compose exec skillgaug-web npm run test:unit
    echo -e "${GREEN}✅ Web tests completed!${NC}"
}

function run_lint() {
    echo -e "${GREEN}🔍 Running linting...${NC}"
    docker-compose exec skillgaug-api npm run lint
    docker-compose exec skillgaug-web npm run lint
    echo -e "${GREEN}✅ Linting completed!${NC}"
}

function build_images() {
    echo -e "${GREEN}🔨 Building Docker images...${NC}"
    docker-compose build
    echo -e "${GREEN}✅ Images built successfully!${NC}"
}

function clean_docker() {
    echo -e "${YELLOW}⚠️  This will remove all containers, networks, and volumes for this project.${NC}"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🧹 Cleaning Docker resources...${NC}"
        docker-compose down -v --remove-orphans
        docker-compose rm -f
        echo -e "${GREEN}✅ Docker cleanup completed!${NC}"
    else
        echo -e "${BLUE}ℹ️ Docker cleanup cancelled.${NC}"
    fi
}

# Main command dispatcher
case "${1:-help}" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    logs)
        show_logs
        ;;
    logs-api)
        show_logs_api
        ;;
    logs-web)
        show_logs_web
        ;;
    logs-db)
        show_logs_db
        ;;
    status)
        show_status
        ;;
    reset-db)
        reset_database
        ;;
    seed)
        seed_database
        ;;
    shell-api)
        shell_api
        ;;
    shell-web)
        shell_web
        ;;
    shell-db)
        shell_db
        ;;
    test)
        run_tests
        ;;
    test-api)
        run_tests_api
        ;;
    test-web)
        run_tests_web
        ;;
    lint)
        run_lint
        ;;
    build)
        build_images
        ;;
    clean)
        clean_docker
        ;;
    help|*)
        show_help
        ;;
esac