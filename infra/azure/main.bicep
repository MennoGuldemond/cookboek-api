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

@description('Globally unique Storage Account name for image uploads. Leave empty to auto-generate from appName.')
param storageAccountName string = ''

@description('Blob container name used for uploaded images.')
param imageContainerName string = 'images'

@description('Additional app settings to merge into the Web App configuration.')
param appSettings object = {}

var resolvedStorageAccountName = empty(storageAccountName)
  ? take('${toLower(replace(appName, '-', ''))}img', 24)
  : toLower(storageAccountName)

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
  {
    name: 'IMAGE_STORAGE_PROVIDER'
    value: 'azure'
  }
  {
    name: 'AZURE_STORAGE_CONTAINER_NAME'
    value: imageContainerName
  }
  {
    name: 'AZURE_STORAGE_CONNECTION_STRING'
    value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${storageAccount.listKeys().keys[0].value};EndpointSuffix=${environment().suffixes.storage}'
  }
]

var customAppSettings = [
  for item in filter(
    items(appSettings),
    item => !empty(string(item.value)) && toLower(string(item.value)) != 'replace-me'
  ): {
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

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: resolvedStorageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: true
    supportsHttpsTrafficOnly: true
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' = {
  name: 'default'
  parent: storageAccount
}

resource imageContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  name: imageContainerName
  parent: blobService
  properties: {
    publicAccess: 'Blob'
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
output storageAccountName string = storageAccount.name
output imageContainerName string = imageContainer.name
