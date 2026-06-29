@description('Azure region for resources. Defaults to the resource group location.')
param location string = resourceGroup().location

@description('Globally unique name for the Azure Web App.')
param appName string

@description('Name for the App Service plan.')
param appServicePlanName string = '${appName}-plan'

@allowed([
  'F1'
  'D1'
  'B1'
  'S1'
  'P1v3'
])
@description('SKU for the App Service plan.')
param skuName string = 'B1'

@description('Additional app settings to merge into the Web App configuration.')
param appSettings object = {}

var baseAppSettings = [
  {
    name: 'WEBSITES_PORT'
    value: '3000'
  }
  {
    name: 'NODE_ENV'
    value: 'production'
  }
  {
    name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
    value: 'true'
  }
  {
    name: 'ENABLE_ORYX_BUILD'
    value: 'true'
  }
]

var customAppSettings = [
  for item in items(appSettings): {
    name: item.key
    value: string(item.value)
  }
]

resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: skuName
    tier: skuName == 'F1'
      ? 'Free'
      : skuName == 'D1'
          ? 'Shared'
          : startsWith(skuName, 'B') ? 'Basic' : startsWith(skuName, 'S') ? 'Standard' : 'PremiumV3'
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

resource webApp 'Microsoft.Web/sites@2023-12-01' = {
  name: appName
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|22-lts'
      minTlsVersion: '1.2'
      appSettings: concat(baseAppSettings, customAppSettings)
    }
  }
}

output webAppName string = webApp.name
output webAppDefaultHostName string = webApp.properties.defaultHostName
output appServicePlanName string = appServicePlan.name
