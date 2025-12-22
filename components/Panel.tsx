
import React, { useMemo } from 'react';
import { PanelPosition, FitMode, StitchStyle, PanelShape, ButtonMetal } from '../types';
import { Plus, Cross } from 'lucide-react';
import { LEATHER_COLORS, LITURGICAL_FABRICS, BUTTON_METALS } from '../constants';

interface PanelProps {
  position: PanelPosition;
  imageUrl: string | null;
  fitMode?: FitMode;
  isCenter?: boolean;
  internalFabric: string;
  externalLeather: string;
  isGoldLeaf: boolean;
  onSelect: (pos: PanelPosition) => void;
  isFolded: boolean;
  exteriorEngraving: string;
  prayerText?: string;
  prayerTextColor?: string;
  isPrayer?: boolean;
  internalStitchColor: string;
  internalStitchStyle: StitchStyle;
  internalStitchWeight: number;
  externalStitchColor: string;
  externalStitchStyle: StitchStyle;
  externalStitchWeight: number;
  isActive?: boolean;
  shape?: PanelShape;
  imageScale?: number;
  imageZoom?: number;
  imageOffsetX?: number;
  imageOffsetY?: number;
  showButtons?: boolean;
  buttonMetal?: ButtonMetal;
}

const Panel: React.FC<PanelProps> = ({ 
  position, imageUrl, fitMode = 'cover', isCenter, 
  internalFabric, externalLeather, isGoldLeaf, onSelect,
  isFolded, exteriorEngraving, prayerText, prayerTextColor = '#1a1a1a', isPrayer,
  internalStitchColor, internalStitchStyle, internalStitchWeight,
  externalStitchColor, externalStitchStyle, externalStitchWeight,
  isActive, shape = 'square', imageScale = 0.68, imageZoom = 1,
  imageOffsetX = 0, imageOffsetY = 0,
  showButtons = true, buttonMetal = 'gold'
}) => {
  const leather = useMemo(() => LEATHER_COLORS.find(l => l.id === externalLeather) || LEATHER_COLORS[0], [externalLeather]);
  const fabric = useMemo(() => LITURGICAL_FABRICS.find(f => f.id === internalFabric) || LITURGICAL_FABRICS[0], [internalFabric]);
  const metal = useMemo(() => BUTTON_METALS.find(m => m.id === buttonMetal) || BUTTON_METALS[0], [buttonMetal]);

  const dim = 180; 

  const getTransform = () => {
    if (isCenter) return 'translateZ(0px)';
    const foldAngle = isFolded ? 176 : 0; 
    switch (position) {
      case 'right': return `rotateY(${-foldAngle}deg) translateZ(0.5px)`;
      case 'left': return `rotateY(${foldAngle}deg) translateZ(0.5px)`;
      case 'bottom': return `rotateX(${foldAngle}deg) translateZ(0.5px)`;
      case 'top': return `rotateX(${-foldAngle}deg) translateZ(0.5px)`;
      default: return '';
    }
  };

  const getOrigin = () => {
    switch (position) {
      case 'top': return 'bottom center';
      case 'bottom': return 'top center';
      case 'left': return 'right center';
      case 'right': return 'left center';
      default: return 'center';
    }
  };

  const getRoundedStyle = (isExterior: boolean = false) => {
    if (isCenter) return 'rounded-none';
    let pos = position;
    if (isExterior) {
      if (position === 'left') pos = 'right';
      else if (position === 'right') pos = 'left';
    }
    switch (pos) {
      case 'top': return 'rounded-t-[40px] rounded-b-none';
      case 'bottom': return 'rounded-b-[40px] rounded-t-none';
      case 'left': return 'rounded-l-[40px] rounded-r-none';
      case 'right': return 'rounded-r-[40px] rounded-l-none';
      default: return 'rounded-none';
    }
  };

  const getShapeClasses = () => {
    switch (shape) {
      case 'circle': return 'rounded-full aspect-square';
      case 'oval': return 'rounded-full aspect-[3/4]';
      case 'square': return 'rounded-xl aspect-square';
      default: return 'rounded-none';
    }
  };

  const renderStitching = (isExterior: boolean = false) => {
    const inset = 12;
    const color = isExterior ? externalStitchColor : internalStitchColor;
    const styleName = isExterior ? externalStitchStyle : internalStitchStyle;
    const weight = isExterior ? externalStitchWeight : internalStitchWeight;
    const effectiveWeight = styleName === 'double' ? Math.max(weight, 2.5) : weight;

    const style: React.CSSProperties = {
      position: 'absolute',
      top: inset, left: inset, right: inset, bottom: inset,
      borderWidth: `${effectiveWeight}px`,
      borderColor: color,
      borderStyle: styleName as any,
      opacity: isExterior ? 0.9 : 0.7,
      zIndex: 10,
      pointerEvents: 'none',
      filter: isExterior ? 'drop-shadow(0px 1px 1px rgba(0,0,0,0.3))' : 'none',
    };

    if (!isCenter) {
      const r = 40 - inset;
      let pos = position;
      if (isExterior) {
        if (position === 'left') pos = 'right';
        else if (position === 'right') pos = 'left';
      }
      if (pos === 'top') { style.borderTopLeftRadius = r; style.borderTopRightRadius = r; }
      if (pos === 'bottom') { style.borderBottomLeftRadius = r; style.borderBottomRightRadius = r; }
      if (pos === 'left') { style.borderTopLeftRadius = r; style.borderBottomLeftRadius = r; }
      if (pos === 'right') { style.borderTopRightRadius = r; style.borderBottomRightRadius = r; }
    }

    return <div style={style} />;
  };

  const getDynamicFontSize = (text: string = '', scale: number = 0.68) => {
    const length = text.length || 1;
    let baseFontSize = 11.5;
    const shapeMultiplier = shape === 'oval' ? 0.85 : 1.0;
    
    if (length < 50) baseFontSize = 11.5;
    else if (length < 150) baseFontSize = 9.5;
    else if (length < 300) baseFontSize = 8;
    else if (length < 450) baseFontSize = 7;
    else baseFontSize = 6;
    
    const scaleFactor = (scale / 0.8) * shapeMultiplier;
    const finalSize = baseFontSize * scaleFactor * imageZoom;
    return `${Math.max(finalSize, 4)}px`;
  };

  const getContentStyle = (): React.CSSProperties => {
    const baseScale = imageScale || 0.68;
    const isOval = shape === 'oval';
    
    return {
      height: `${baseScale * 100}%`,
      width: isOval ? `${baseScale * 100 * 0.75}%` : `${baseScale * 100}%`,
      backgroundColor: 'transparent',
      boxShadow: (isPrayer || imageUrl) ? '0 12px 40px rgba(0,0,0,0.25)' : 'none',
      transform: 'translateZ(0.1px)', 
      isolation: 'isolate',
      position: 'relative'
    };
  };

  const renderButton = (type: 'male' | 'female') => {
    if (!showButtons || isCenter) return null;
    
    // Regra: Ao dobrar, a fêmea (aba inferior) é suprimida para não conflitar com o macho
    if (isFolded && position === 'bottom') return null;

    const isMale = type === 'male';
    const buttonSize = 14;
    const metalColor = metal.color;
    const highlight = metal.highlight;

    let style: React.CSSProperties = {
      position: 'absolute',
      width: buttonSize,
      height: buttonSize,
      borderRadius: '50%',
      backgroundColor: metalColor,
      boxShadow: `inset -2px -2px 4px rgba(0,0,0,0.4), 1px 1px 3px rgba(0,0,0,0.3), 0 0 2px ${highlight}`,
      zIndex: 100,
    };

    // CORREÇÃO: O botão deve ficar na extremidade de fechamento.
    // Para a ala superior (top), a extremidade de fechamento é o topo original da ala.
    // Quando dobrada, essa extremidade rotaciona para a parte inferior do mockup.
    if (position === 'top') { 
      style.top = 25; // Mantém no topo da ala (borda livre)
      style.left = '50%'; 
      // Aumentamos o translateZ para evitar clipping durante a animação
      style.transform = 'translateX(-50%) translateZ(2px)'; 
    }
    else if (position === 'bottom') { 
      style.bottom = 25; // Mantém na base da ala (borda livre)
      style.left = '50%'; 
      style.transform = 'translateX(-50%) translateZ(2px)'; 
    }
    
    if (position !== 'top' && position !== 'bottom') return null;

    return (
      <div style={style}>
        {isMale ? (
          <div className="absolute inset-[3px] rounded-full shadow-inner" style={{ backgroundColor: highlight, opacity: 0.6, boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.5)' }} />
        ) : (
          <div className="absolute inset-[4px] rounded-full bg-black/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]" />
        )}
      </div>
    );
  };

  return (
    <div 
      onClick={() => onSelect(position)}
      style={{ 
        width: dim, height: dim,
        transform: getTransform(),
        transformOrigin: getOrigin(),
        transformStyle: 'preserve-3d',
        zIndex: isFolded ? (position === 'center' ? 1 : (position === 'top' ? 60 : (position === 'bottom' ? 40 : 20))) : (isCenter ? 5 : 10),
        margin: '-0.25px', 
      }}
      className={`relative transition-all duration-[1500ms] cubic-bezier(0.4, 0, 0.2, 1) cursor-pointer group`}
    >
      {/* FACE INTERNA (TECIDO) */}
      <div 
        className={`absolute inset-0 flex flex-col items-center justify-center overflow-hidden ${getRoundedStyle(false)}`}
        style={{ 
          backfaceVisibility: 'hidden', 
          backgroundColor: fabric.color,
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)',
        }}
      >
        <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.25)] pointer-events-none z-10" />
        <div className="absolute inset-0 opacity-40 mix-blend-soft-light" style={{ backgroundImage: `url(${fabric.texture})`, backgroundSize: '100px' }} />
        
        {renderStitching(false)}
        
        <div 
          className={`relative z-20 flex items-center justify-center overflow-hidden border border-white/10 ${getShapeClasses()}`}
          style={getContentStyle()}
        >
          {imageUrl && (
            <div className="absolute inset-0 z-0 overflow-hidden flex items-center justify-center">
              <img 
                src={imageUrl} 
                className={`${fitMode === 'cover' ? 'min-w-full min-h-full object-cover' : 'max-w-full max-h-full object-contain'} transition-transform duration-300`} 
                style={{ 
                  filter: 'contrast(1.02) brightness(1.02)',
                  transform: `translate(${imageOffsetX || 0}px, ${imageOffsetY || 0}px) scale(${imageZoom || 1})`,
                  flexShrink: 0
                }}
              />
              {isGoldLeaf && <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/10 via-transparent to-yellow-200/10 mix-blend-overlay pointer-events-none" />}
            </div>
          )}

          {isPrayer && (
            <div 
              className="relative z-10 w-full h-full flex items-center justify-center"
              style={{ 
                padding: shape === 'oval' ? '12% 15%' : '10%',
                overflow: 'hidden'
              }}
            >
              <p 
                className="font-serif leading-[1.25] italic text-justify transition-all"
                style={{ 
                  color: prayerTextColor,
                  fontSize: getDynamicFontSize(prayerText, imageScale),
                  textAlignLast: 'center',
                  textShadow: '0 1px 1px rgba(255,255,255,0.3)',
                  width: '100%',
                  display: '-webkit-box',
                  WebkitLineClamp: 20,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {prayerText}
              </p>
            </div>
          )}

          {!imageUrl && !isPrayer && (
            <div className="flex items-center justify-center w-full h-full">
              {isCenter ? <Cross className="w-12 h-12 text-black/5" strokeWidth={1} /> : <Plus className="w-8 h-8 text-black/5" />}
            </div>
          )}
        </div>

        {isActive && (
           <div className={`absolute inset-0 border-4 border-yellow-500/50 z-50 pointer-events-none animate-pulse ${getRoundedStyle(false)}`} />
        )}
      </div>

      {/* FACE EXTERNA (COURO) */}
      <div 
        className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ${getRoundedStyle(true)}`}
        style={{ 
          transform: 'rotateY(180deg)', 
          backfaceVisibility: 'hidden',
          backgroundColor: leather.color,
        }}
      >
        <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.5)] pointer-events-none z-10" />
        <div className="absolute inset-0 opacity-60 mix-blend-soft-light" style={{ backgroundImage: `url(${leather.texture})`, backgroundSize: '150px' }} />
        {renderStitching(true)}
        
        {position === 'top' && renderButton('male')}
        {position === 'bottom' && renderButton('female')}

        {isCenter && (
          <div className="flex flex-col items-center opacity-40">
            {exteriorEngraving === 'cross' && <Cross className="w-28 h-28 text-white/90" strokeWidth={0.2} />}
            {exteriorEngraving === 'monogram' && <span className="text-7xl font-cinzel font-bold text-white/70 tracking-tighter">IHS</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Panel;
