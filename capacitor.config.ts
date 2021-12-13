import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.batiuni.app',
  appName: 'batiuni',
  webDir: 'dist',
  bundledWebRuntime: false,
  backgroundColor: '#ffffffff',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: '#ffffffff'
    }
  }
};

export default config;