// Ambient type declarations for the BioDigital Human API runtime that is loaded
// via the external script https://human-api.biodigital.com/build/1.2.1/human-api-1.2.1.min.js
// The library attaches itself to `window.HumanAPI` and is not distributed on npm,
// so we declare just enough of the surface we use.

export type BioDigitalRgb = { r: number; g: number; b: number };

export type BioDigitalColor = {
  ambient?: BioDigitalRgb;
  diffuse?: BioDigitalRgb;
  specular?: BioDigitalRgb;
  emissive?: BioDigitalRgb;
};

export type BioDigitalColorObjectArgs = {
  objectId: string;
  color: BioDigitalColor;
  opacity?: number;
};

export type BioDigitalColorResetArgs = {
  objectIds: string[];
};

// Event payloads we care about.
export type BioDigitalPickEvent = {
  objectId: string;
  position?: { x: number; y: number; z: number };
  canvasPosition?: { x: number; y: number };
};

// Map of "send" command names to their argument shapes. Extend as needed.
export type BioDigitalSendMap = {
  "scene.colorObject": BioDigitalColorObjectArgs;
  "scene.colorObject.reset": BioDigitalColorResetArgs;
};

// Map of "on" event names to their payload shapes. Extend as needed.
export type BioDigitalEventMap = {
  "human.ready": void;
  "scene.picked": BioDigitalPickEvent;
};

export interface BioDigitalHuman {
  on<K extends keyof BioDigitalEventMap>(
    event: K,
    handler: (payload: BioDigitalEventMap[K]) => void
  ): void;

  send<K extends keyof BioDigitalSendMap>(
    command: K,
    args: BioDigitalSendMap[K]
  ): void;
}

export interface BioDigitalHumanConstructor {
  new (iframeId: string): BioDigitalHuman;
}

declare global {
  interface Window {
    HumanAPI?: {
      Human: BioDigitalHumanConstructor;
    };
  }
}

export {};
