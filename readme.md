## Cookbook API

The repository contains the rest api project for the cookbook webapp.
This project makes use of:

- Express
- Prisma
- Google Auth

## Installation steps

1. run 'npm install'
1. Make sure a mysql database is running on your computer
1. Create a .env file in the root with the following properties:
   - DATABASE_URL=""
   - PORT=3000
   - GOOGLE_CLIENT_ID=""
1. run 'npm run prisma-push' to populate the database
