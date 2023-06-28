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

  class MozActivity {
    constructor(options: MozActivityOptions): MozActivity;
    onerror?: (error: any) => void;
  }

  interface MozActivityOptions {
    name: string;
    data?: any;
  }

  type ValidDeviceStorages = "apps" | "music" | "pictures" | "videos" | "sdcard";

  type DeviceStorage = any
}

export { };