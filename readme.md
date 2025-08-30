# House Listing API

A RESTful API for managing property listings with user authentication and CRUD operations.

---------------------------------------------------------------------------------------------------------------------


## Table of Contents

- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Database Migration & Seed](#database-migration--seed)
- [Running the Project](#running-the-project)
- [Scripts](#scripts)

---------------------------------------------------------------------------------------------------------------------

## Setup

1. Clone the repository:

git clone https://github.com/xunna59/house_listing_api.git
cd house_listing_api

2. Install dependencies:


npm install

## Environment Variables

1. Create .env file & Copy the example environment variables from .env.example  into it:


2. Update .env with your configuration (Postgres, JWT, Port.)

DATABASE_URL=postgresql://app:app@localhost:5432/listings?schema=public
JWT_SECRET=change-me
PORT=3000

DATABASE_URL — PostgreSQL connection string
JWT_SECRET — Secret for JWT authentication
PORT — Port the server will run on


## Database Migration & Seed

1. Run migrations to create tables:

npx sequelize-cli db:migrate

2. Seed the database with demo users & Listings:

npx sequelize-cli db:seed:all


## Running the Project

1. npm run dev

## Scripts

npm run dev - start development server
npx sequelize-cli db:migrate - run migrations
npx sequelize-cli db:seed:all - run seeders


API Endpoints

User Auth

POST /api/auth/register — create a new user

POST /api/auth/login — login user

GET /api/auth/me — get current user profile

Listings

GET /api/listings — list all properties (supports filtering, search, pagination, sorting)

POST /api/listings — create a new listing (protected)

GET /api/listings/:id — get a single listing

PATCH /api/listings/:id — update a listing (owner only)

DELETE /api/listings/:id — delete a listing (owner only)
