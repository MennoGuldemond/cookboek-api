## Cookboek API

The repository contains the rest api project for the cookboek webapp.
This project makes use of:

- Express
- Prisma
- Google Auth

## Installation steps

1. Run 'npm install'
1. Make sure a mysql database is running on your computer
1. Create a .env file in the root with the following properties:
   - DATABASE_URL=""
   - PORT=3000
   - GOOGLE_CLIENT_ID=""
1. To set the Google CliendId:
   - Navigate to "APIs & Services" > "Credentials".
   - Look for the "OAuth 2.0 Client IDs" section.
   - Find the client you use for your app
   - Copy the "Client ID" value—this is what you should set as GOOGLE_CLIENT_ID in your .env file.
1. Run 'npm run prisma-push' to populate the database
1. For now, create te views by sql script yourself.
1. Create a 'public' folder in the root of the project.
1. Create a 'images' folder inside that public folder.

## CI/CD (Azure)

This repository contains GitHub Actions workflows for provisioning and deployment on Azure App Service:

- `.github/workflows/azure-infra-provision.yml`
- `.github/workflows/azure-webapp-cicd.yml`

Infrastructure-as-code templates are located in:

- `infra/azure/main.bicep`
- `infra/azure/parameters/cookboek-prd.parameters.json`
- `infra/azure/parameters/cookboek-tst.parameters.json`

Setup instructions are documented here:

- `docs/azure-cicd-setup.md`
