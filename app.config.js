// Permite publicar la web en una subcarpeta (por ejemplo, GitHub Pages en /voiceUp)
// sin cambiar la configuración del desarrollo local.
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    baseUrl: process.env.EXPO_BASE_URL || undefined,
  },
});
