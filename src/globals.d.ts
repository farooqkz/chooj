declare module "*.png";
declare module "*.svg";
declare module "*.ogg";
declare module "xmimetype";

declare global {
  interface Navigator {
    volumeManager: VolumeManager; 
    getDeviceStorage: (deviceStorage: ValidDeviceStorages) => DeviceStorage;
  }
  interface Window {
    MozActivity: MozActivity; 
  }
  interface VolumeManager {
    requestShow: () => void;
  }

  interface MozActivity {
    new (options: MozActivityOptions): MozActivity;
    onerror?: (error: any) => void;
  }

  interface MozActivityOptions {
    name: string;
    data?: any;
  }
  type ValidDeviceStorages = "apps" | "music" | "pictures" | "videos" | "sdcard";
}
