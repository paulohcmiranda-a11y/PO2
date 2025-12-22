
export type PanelPosition = 'top' | 'bottom' | 'left' | 'right' | 'center';

export type FitMode = 'cover' | 'contain';

export type StitchStyle = 'solid' | 'dashed' | 'dotted' | 'double';

export type PanelShape = 'square' | 'circle' | 'oval';

export type ButtonMetal = 'gold' | 'silver' | 'antique-brass' | 'black-nickel';

export interface PanelConfig {
  imageUrl: string | null;
  label: string;
  fitMode: FitMode;
  prayerText?: string;
  prayerTextColor?: string;
  isPrayer?: boolean;
  shape?: PanelShape;
  imageScale?: number; // Tamanho do recorte (Frame)
  imageZoom?: number;  // Zoom interno da imagem
  imageOffsetX?: number;
  imageOffsetY?: number;
  aiHistory?: string[];
  lastPrompt?: string; // Histórico do último comando usado nesta ala
}

export interface OratoryDesign {
  panels: Record<PanelPosition, PanelConfig>;
  exteriorLeatherColor: 'burgundy' | 'navy' | 'forest' | 'tobacco' | 'black';
  internalFabricPattern: 'golden-damask' | 'white-brocade' | 'purple-liturgical' | 'natural-linen';
  exteriorEngraving: 'cross' | 'monogram' | 'floral' | 'none';
  crucifixStyle: 'classic' | 'san-damiano' | 'metal';
  isGoldLeaf: boolean;
  showMedals: boolean;
  buttonMetal: ButtonMetal;
  showButtons: boolean;
  internalStitchColor: string;
  internalStitchStyle: StitchStyle;
  internalStitchWeight: number;
  externalStitchColor: string;
  externalStitchStyle: StitchStyle;
  externalStitchWeight: number;
}
