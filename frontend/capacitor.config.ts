import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tesis.nuclearlab',
  appName: 'NuclearLab',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
