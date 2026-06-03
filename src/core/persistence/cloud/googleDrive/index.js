import ensureAuthenticated from "./authenticate.js";
import uploadBackup from "./uploadBackup.js";
import downloadBackup from "./downloadBackup.js";
import { getProviderConfig, setProviderConfig } from "./config.js";

export default {
  name: "google-drive",
  authenticate: ensureAuthenticated,
  uploadBackup,
  downloadBackup,
  getProviderConfig,
  setProviderConfig
};