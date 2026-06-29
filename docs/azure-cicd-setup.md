# Azure CI/CD setup (GitHub Actions)

This project includes a GitHub Actions workflow at:

- `.github/workflows/azure-webapp-cicd.yml`

It deploys to Azure App Service (Web App) on pushes to `main`.

## 1) Prerequisites

- You have an Azure resource group in your Visual Studio subscription.
- You created an Azure Web App for Node.js in that resource group.
- You can run Azure CLI locally (`az login`).

## 2) Required GitHub secret

Add this repository secret:

- `AZURE_WEBAPP_NAME`: the exact Azure Web App name.

## 3) Authentication option A (recommended): OIDC federation

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

### Add GitHub secrets

- `AZURE_CLIENT_ID`: service principal app id (`$SP_APP_ID`)
- `AZURE_TENANT_ID`: your tenant id (`az account show --query tenantId -o tsv`)
- `AZURE_SUBSCRIPTION_ID`: your subscription id

## 4) Authentication option B (fallback): service principal secret

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

## 5) Trigger deployment

- Push to `main`, or run the workflow manually from the Actions tab.

## 6) Configure runtime in Azure Web App

In Azure Web App configuration:

- Startup command: `npm start`
- Node version: 20 LTS
- App settings (example):
  - `DATABASE_URL`
  - `PORT` (optional, App Service usually injects this)
  - `GOOGLE_CLIENT_ID`

## 7) Troubleshooting

- If login fails with OIDC-related errors, switch to `AZURE_CREDENTIALS` fallback.
- If deployment succeeds but app does not start, verify startup command and required app settings.
- If Prisma/database access fails, ensure firewall/network allows Azure App Service outbound access.
