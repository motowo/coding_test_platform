#!/bin/bash

# =================================================================
# SkillGaug Development Environment Setup Script
# =================================================================

set -e

echo "🚀 SkillGaug Development Environment Setup"
echo "=========================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install docker-compose and try again."
    exit 1
fi

# Create .env.local from template if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "✅ .env.local created. Please review and update the values as needed."
else
    echo "📝 .env.local already exists."
fi

# Pull Docker images
echo "🐳 Pulling Docker images..."
docker-compose pull

# Build custom images
echo "🔨 Building custom Docker images..."
docker-compose build

# Start the infrastructure services first (database, redis)
echo "🗄️ Starting infrastructure services..."
docker-compose up -d skillgaug-db skillgaug-redis

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until docker-compose exec -T skillgaug-db pg_isready -U skillgaug; do
    sleep 2
done

# Wait for Redis to be ready  
echo "⏳ Waiting for Redis to be ready..."
until docker-compose exec -T skillgaug-redis redis-cli ping; do
    sleep 2
done

echo "✅ Infrastructure services are ready!"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
docker-compose run --rm skillgaug-api npx prisma generate --schema=../database/schema.prisma

# Run database migrations
echo "🗂️ Running database migrations..."
docker-compose run --rm skillgaug-api npx prisma migrate dev --schema=../database/schema.prisma --name init

# Seed the database
echo "🌱 Seeding database with initial data..."
docker-compose run --rm skillgaug-api npm run db:seed

# Start all services
echo "🚀 Starting all services..."
docker-compose up -d

# Wait a moment for services to fully start
sleep 5

# Display service status
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "🌐 Access URLs:"
echo "  • Web Application: http://localhost:3000"
echo "  • API Server: http://localhost:4000"  
echo "  • API Documentation: http://localhost:4000/documentation"
echo "  • Database: localhost:5432"
echo "  • Redis: localhost:6379"
echo ""
echo "🔑 Default Login Credentials:"
echo "  • Admin: admin@skillgaug.local / password123"
echo "  • Creator: creator@skillgaug.local / password123"
echo "  • Recruiter: recruiter@skillgaug.local / password123"
echo "  • Candidate: john.doe@example.com / password123"
echo ""
echo "📚 Next Steps:"
echo "  1. Review and update .env.local with your specific settings"
echo "  2. Access the web application at http://localhost:3000"
echo "  3. Try logging in with the default credentials above"
echo "  4. Check the API documentation at http://localhost:4000/documentation"
echo ""
echo "🔧 Useful Commands:"
echo "  • Stop services: docker-compose down"
echo "  • View logs: docker-compose logs -f [service-name]"
echo "  • Reset database: docker-compose run --rm skillgaug-api npm run db:reset"
echo "  • Access database: docker-compose exec skillgaug-db psql -U skillgaug -d skillgaug"
echo ""
echo "✨ Happy coding! May the Force be with you."