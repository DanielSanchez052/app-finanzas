export default {
  name: "s3",        // string de identificación
  authenticate: async () => { /* OAuth, tokens, etc. */ },
  uploadBackup: async (backupJson) => { /* guarda JSON en la nube */ },
  downloadBackup: async () => { /* devuelve JSON con el backup */ }
}