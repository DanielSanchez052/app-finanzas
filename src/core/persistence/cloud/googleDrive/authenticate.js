import { getProviderConfig } from "./config.js";

let gapiInitialized = false;
let tokenClient = null;

async function initGapiClient() {
  if (gapiInitialized) return;
  await new Promise(resolve => {
    window.gapi.load("client", resolve);
  });

  const { clientId, apiKey } = getProviderConfig();
  if (!clientId || !apiKey) {
    throw new Error("Google Drive no está configurado: faltan Client ID o API Key.");
  }

  await window.gapi.client.init({
    apiKey,
    discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"]
  });

  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: "openid email https://www.googleapis.com/auth/drive.file",
    callback: (tokenResponse) => {}
  });

  gapiInitialized = true;
}

export default async function ensureAuthenticated() {
  await initGapiClient();

  const currentToken = window.gapi.client.getToken();
  if (currentToken && currentToken.access_token) {
    const savedEmail = localStorage.getItem("googleDriveAccountEmail") || "";
    return {
      token: currentToken,
      user: {
        email: savedEmail
      }
    };
  }

  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error("Cliente de token de Google Identity Services no inicializado."));
      return;
    }
    tokenClient.callback = async (resp) => {
      if (resp.error) {
        reject(resp);
        return;
      }
      try {

        window.gapi.client.setToken(resp);
        const userInfoRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
          headers: {
            Authorization: `Bearer ${resp.access_token}`
          }
        });
 
        if (!userInfoRes.ok) {
          throw new Error(`Error al obtener userinfo: ${userInfoRes.status}`);
        }
 
        const user = await userInfoRes.json();
 
        resolve({
          token: resp,
          user
        });
      } catch (err) {
        reject(err);
      }
    };
 
    tokenClient.requestAccessToken({ prompt: "" });
  });
}