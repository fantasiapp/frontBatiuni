import { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'com.batiuni.app',
  appName: 'batiuni',
  webDir: 'dist',
  bundledWebRuntime: false,
  backgroundColor: '#ffffffff',
  plugins: {
    Keyboard: {
      "resizeOnFullScreen": true,
      resize: KeyboardResize.Native
    },
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: '#ffffffff'
    }
  }
};

export default config;