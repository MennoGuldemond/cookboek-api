# Azure infrastructure + CI/CD setup (GitHub Actions)

This project includes two workflows:

- `.github/workflows/azure-infra-provision.yml` (manual infrastructure provisioning)
- `.github/workflows/azure-webapp-cicd.yml` (app deployment on `main`)

With these files, you can start from only an existing resource group and provision the rest as code.

## Quick start for your project

You can use these two environments:

- `prd` in resource group `cookboek-prd`
- `tst` in resource group `cookboek-tst`

Preferred Azure region "Western Europe" maps to Azure region code `westeurope`.

Create the test resource group once:

```bash
az group create --name "cookboek-tst" --location "westeurope"
```

Provision both environments with parameter files:

```bash
az deployment group create \
  --resource-group "cookboek-prd" \
  --template-file infra/azure/main.bicep \
  --parameters @infra/azure/parameters/cookboek-prd.parameters.json

az deployment group create \
  --resource-group "cookboek-tst" \
  --template-file infra/azure/main.bicep \
  --parameters @infra/azure/parameters/cookboek-tst.parameters.json
```

Set repository variables (or secrets) for deployment targets:

- `AZURE_WEBAPP_NAME_PRD` = app name used in `cookboek-prd.parameters.json`
- `AZURE_WEBAPP_NAME_TST` = app name used in `cookboek-tst.parameters.json`

## 1) Prerequisites

- You have an Azure resource group in your Visual Studio subscription.
- You can run Azure CLI locally (`az login`).

## 2) Azure authentication for GitHub Actions

Both workflows support two auth options.

If you do not have Entra ID access, use publish profiles for app deployment (section 2A) and skip to section 3 for infra via local CLI.

### 2A) No Entra access: use App Service publish profiles (deploy workflow)

From Azure Portal:

- Open Web App `cookboek-tst-api` -> Get publish profile -> download the file.
- Open Web App `cookboek-prd-api` -> Get publish profile -> download the file.

In GitHub repository settings -> Secrets and variables -> Actions, add:

- `AZURE_WEBAPP_PUBLISH_PROFILE_TST`: full XML content from tst publish profile file
- `AZURE_WEBAPP_PUBLISH_PROFILE_PRD`: full XML content from prd publish profile file

Optional single fallback secret:

- `AZURE_WEBAPP_PUBLISH_PROFILE`

Keep app name values configured as variables or secrets:

- `AZURE_WEBAPP_NAME_TST`
- `AZURE_WEBAPP_NAME_PRD`

### Option A (recommended): OIDC federation

Use this if your tenant allows workload identity federation.

### Create service principal and assign RG-scoped role

```bash
SUBSCRIPTION_ID="<your-subscription-id>"
RESOURCE_GROUP="<your-resource-group>"
APP_NAME="gh-cookboek-api"

az account set --subscription "$SUBSCRIPTION_ID"

SP_APP_ID=$(az ad app create --display-name "$APP_NAME" --query appId -o tsv)
SP_OBJECT_ID=$(az ad sp create --id "$SP_APP_ID" --query id -o tsv)

RG_SCOPE=$(az group show -n "$RESOURCE_GROUP" --query id -o tsv)
az role assignment create --assignee-object-id "$SP_OBJECT_ID" --assignee-principal-type ServicePrincipal --role Contributor --scope "$RG_SCOPE"
```

### Add federated credential for GitHub repo

```bash
GITHUB_ORG_OR_USER="<your-github-user>"
GITHUB_REPO="cookboek-api"

cat > federated-credential.json <<EOF
{
  "name": "github-main",
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "repo:${GITHUB_ORG_OR_USER}/${GITHUB_REPO}:ref:refs/heads/main",
  "description": "GitHub Actions on main",
  "audiences": ["api://AzureADTokenExchange"]
}
EOF

az ad app federated-credential create --id "$SP_APP_ID" --parameters @federated-credential.json
```

### Add GitHub secrets for OIDC

- `AZURE_CLIENT_ID`: service principal app id (`$SP_APP_ID`)
- `AZURE_TENANT_ID`: your tenant id (`az account show --query tenantId -o tsv`)
- `AZURE_SUBSCRIPTION_ID`: your subscription id

### Option B (fallback): service principal secret

Use this when OIDC is blocked by tenant policy.

```bash
SUBSCRIPTION_ID="<your-subscription-id>"
RESOURCE_GROUP="<your-resource-group>"

az account set --subscription "$SUBSCRIPTION_ID"

az ad sp create-for-rbac \
  --name "gh-cookboek-api-secret" \
  --role Contributor \
  --scopes "$(az group show -n "$RESOURCE_GROUP" --query id -o tsv)" \
  --json-auth
```

Copy the full JSON output into GitHub secret:

- `AZURE_CREDENTIALS`

## 3) Provision infrastructure as code

### Method 1: GitHub Actions (recommended)

Run workflow `.github/workflows/azure-infra-provision.yml` with inputs:

- `resourceGroup`: your existing resource group
- `location`: e.g. `westeurope`
- `appName`: globally unique web app name (example: `cookboek-api-menno-001`)
- `skuName`: `B1`, `S1`, or `P1v3`

This provisions from `infra/azure/main.bicep`:

- Linux App Service plan
- Linux Web App (Node 22)
- baseline app settings

### Method 2: Local Azure CLI

```bash
RESOURCE_GROUP="<your-resource-group>"
LOCATION="westeurope"
APP_NAME="cookboek-api-menno-001"

az deployment group create \
  --resource-group "$RESOURCE_GROUP" \
  --template-file infra/azure/main.bicep \
  --parameters appName="$APP_NAME" location="$LOCATION" skuName="B1"
```

Optional parameter example file:

- `infra/azure/main.parameters.example.json`
- `infra/azure/parameters/cookboek-prd.parameters.json`
- `infra/azure/parameters/cookboek-tst.parameters.json`

## 4) Configure app name for deploy workflow

Set one of these in GitHub repository settings:

- Variable `AZURE_WEBAPP_NAME_PRD` (recommended for production)
- Variable `AZURE_WEBAPP_NAME_TST` (recommended for test)
- or fallback single-name Variable `AZURE_WEBAPP_NAME`

You can also store them as secrets with the same names.

## 5) Configure runtime settings in Azure Web App

In Azure Web App configuration, set:

- Startup command: `npm start`
- Node version: 22 LTS
- App settings (example):
  - `DATABASE_URL`
  - `GOOGLE_CLIENT_ID`
  - `PORT` (optional, App Service usually injects this)

## 6) Trigger application deployment

- Pull request to `main` deploys to `tst` only.
- Push to `main` deploys to `prd`.
- Manual run can target `tst` or `prd`, but `prd` is blocked unless the run is on `main`.
- Deploy workflow auth preference is: publish profile first, then OIDC, then `AZURE_CREDENTIALS` fallback.

## 7) Troubleshooting

- If login fails with OIDC-related errors, switch to `AZURE_CREDENTIALS` fallback.
- If deployment succeeds but app does not start, verify startup command and required app settings.
- If Prisma/database access fails, ensure firewall/network allows Azure App Service outbound access.

## 8) Verify deployment quickly

After deploy, test these endpoints:

- Swagger UI: `https://<your-webapp-name>.azurewebsites.net/docs`
- Health endpoint: `https://<your-webapp-name>.azurewebsites.net/health`

Example checks:

```bash
curl -i "https://cookboek-tst-api.azurewebsites.net/health"
curl -I "https://cookboek-tst-api.azurewebsites.net/docs"
```
