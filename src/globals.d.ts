declare global {
  interface Navigator {
    volumeManager: VolumeManager;
    getDeviceStorage: (deviceStorage: ValidDeviceStorages) => DeviceStorage;
  }
  interface Window {
    MozActivity: MozActivity;
    getKaiAd?: KaiAdFunc;
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

  type ValidDeviceStorages =
    | "apps"
    | "music"
    | "pictures"
    | "videos"
    | "sdcard";

  type DeviceStorage = any;

  class XMLHttpRequest {
    constructor(options: undefined | { mozSystem?: boolean }): XMLHttpRequest;
  }

  type getKaiAd = (opts: KaiAdOpts) => void;
  interface KaiAdOpts {
    publisher: string;
    app: string;
    slot: string;
    onerror: (err: any) => void;
    onready: (ad: any) => void;
    h?: number;
    w?: number;
    container?: HTMLDivElement;
    timeout?: number;
  }
}

export {};
