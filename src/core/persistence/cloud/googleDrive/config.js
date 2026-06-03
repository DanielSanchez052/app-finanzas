const GD_CLIENT_ID_KEY = "googleDriveClientId";
const GD_API_KEY_KEY = "googleDriveApiKey";

export function getProviderConfig() {
  return {
    clientId: localStorage.getItem(GD_CLIENT_ID_KEY) || "",
    apiKey: localStorage.getItem(GD_API_KEY_KEY) || ""
  };
}

export function setProviderConfig({ clientId, apiKey }) {
  if (clientId) {
    localStorage.setItem(GD_CLIENT_ID_KEY, clientId);
  } else {
    localStorage.removeItem(GD_CLIENT_ID_KEY);
  }

  if (apiKey) {
    localStorage.setItem(GD_API_KEY_KEY, apiKey);
  } else {
    localStorage.removeItem(GD_API_KEY_KEY);
  }
}