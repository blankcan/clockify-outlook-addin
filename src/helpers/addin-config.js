 export function getConfig() {
  const config = {};

  config.clockifyApiKey = Office.context.roamingSettings.get('clockifyApiKey');
  config.clockifyWorkspaceId = Office.context.roamingSettings.get('clockifyWorkspaceId');
  config.clockifyProjectId = Office.context.roamingSettings.get('clockifyProjectId');

  return config;
}

export function setConfig(config, callback) {
  Office.context.roamingSettings.set('clockifyApiKey', config.clockifyApiKey);
  Office.context.roamingSettings.set('clockifyWorkspaceId', config.clockifyWorkspaceId);
  Office.context.roamingSettings.set('clockifyProjectId', config.clockifyProjectId);

  Office.context.roamingSettings.saveAsync(callback);
}