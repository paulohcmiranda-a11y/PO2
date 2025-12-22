
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Upload, Cross, Settings, Image, Loader2, Box, Undo2, 
  Scissors, RefreshCcw, Type, Palette, Sparkles, 
  MousePointer2, Maximize2, Move, Search, Check, Layers,
  Square, Circle, AlertCircle, X, Shield, LayoutGrid, Info,
  Navigation, SlidersHorizontal, ZoomIn, History, Maximize,
  Edit3, Wand2, Trash2, ArrowsMaximize, MoveHorizontal, MoveVertical,
  CircleDot
} from 'lucide-react';
import { PanelPosition, OratoryDesign, PanelShape, ButtonMetal } from './types';
import { LEATHER_COLORS, LITURGICAL_FABRICS, STITCH_STYLES, STITCH_COLORS, TEXT_COLORS, PRESET_IMAGES, DEFAULT_PRAYER, DEFAULT_AI_HISTORY, BUTTON_METALS } from './constants';
import Panel from './components/Panel';
import { generateSacredArt } from './services/gemini';

const App: React.FC = () => {
  const [design, setDesign] = useState<OratoryDesign>({
    panels: {
      top: { imageUrl: null, label: 'Painel Superior', fitMode: 'cover', shape: 'square', imageScale: 0.68, imageZoom: 1, imageOffsetX: 0, imageOffsetY: 0, aiHistory: [...DEFAULT_AI_HISTORY], lastPrompt: '' },
      bottom: { imageUrl: null, label: 'Painel Inferior', fitMode: 'cover', isPrayer: true, prayerText: DEFAULT_PRAYER, prayerTextColor: '#1a1a1a', shape: 'square', imageScale: 0.68, imageZoom: 1, imageOffsetX: 0, imageOffsetY: 0, aiHistory: [...DEFAULT_AI_HISTORY], lastPrompt: '' },
      left: { imageUrl: null, label: 'Ala Esquerda', fitMode: 'cover', shape: 'square', imageScale: 0.68, imageZoom: 1, imageOffsetX: 0, imageOffsetY: 0, aiHistory: [...DEFAULT_AI_HISTORY], lastPrompt: '' },
      right: { imageUrl: null, label: 'Ala Direita', fitMode: 'cover', shape: 'square', imageScale: 0.68, imageZoom: 1, imageOffsetX: 0, imageOffsetY: 0, aiHistory: [...DEFAULT_AI_HISTORY], lastPrompt: '' },
      center: { imageUrl: null, label: 'Painel Central', fitMode: 'cover', shape: 'square', imageScale: 0.68, imageZoom: 1, imageOffsetX: 0, imageOffsetY: 0, aiHistory: [...DEFAULT_AI_HISTORY], lastPrompt: '' },
    },
    exteriorLeatherColor: 'tobacco',
    internalFabricPattern: 'golden-damask',
    exteriorEngraving: 'cross',
    crucifixStyle: 'classic',
    isGoldLeaf: true,
    showMedals: true,
    buttonMetal: 'gold',
    showButtons: true,
    internalStitchColor: '#f5f5f5',
    internalStitchStyle: 'solid',
    internalStitchWeight: 0.8,
    externalStitchColor: '#d4af37',
    externalStitchStyle: 'dashed',
    externalStitchWeight: 1.2,
  });

  const [past, setPast] = useState<OratoryDesign[]>([]);
  const [activeTab, setActiveTab] = useState<'exterior' | 'interior' | 'abas' | 'ai'>('exterior');
  const [selectedPosition, setSelectedPosition] = useState<PanelPosition | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFolded, setIsFolded] = useState(false);
  const [isRotated, setIsRotated] = useState(true);
  const [showInspector, setShowInspector] = useState(false);
  
  const [zoom, setZoom] = useState(0.85); 
  const [mockupGlobalScale, setMockupGlobalScale] = useState(1.1); 
  
  const [userGeneratedImages, setUserGeneratedImages] = useState<{id: string, url: string}[]>([]);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const zoomLevels = [0.225, 0.375, 0.75, 1.125, 1.5, 2.25];

  useEffect(() => {
    if (selectedPosition && activeTab === 'ai') {
      setAiPrompt(design.panels[selectedPosition].lastPrompt || '');
    }
  }, [selectedPosition, activeTab]);

  const applyChange = useCallback((newDesign: OratoryDesign | ((prev: OratoryDesign) => OratoryDesign)) => {
    setDesign(prev => {
      const updated = typeof newDesign === 'function' ? newDesign(prev) : newDesign;
      setPast(p => [...p, prev].slice(-20));
      return updated;
    });
  }, []);

  const handleTabChange = (tab: 'exterior' | 'interior' | 'abas' | 'ai') => {
    setActiveTab(tab);
    if (tab === 'exterior') setIsRotated(true);
    else setIsRotated(false);
  };

  const updatePanelImage = (pos: PanelPosition | null, url: string | null) => {
    if (!pos) return;
    applyChange(prev => ({
      ...prev,
      panels: { ...prev.panels, [pos]: { ...prev.panels[pos], imageUrl: url, isPrayer: url ? false : prev.panels[pos].isPrayer } }
    }));
  };

  const updatePanelShape = (pos: PanelPosition, shape: PanelShape) => {
    applyChange(prev => ({
      ...prev,
      panels: { ...prev.panels, [pos]: { ...prev.panels[pos], shape } }
    }));
  };

  const updatePanelScale = (pos: PanelPosition, scale: number) => {
    applyChange(prev => ({
      ...prev,
      panels: { ...prev.panels, [pos]: { ...prev.panels[pos], imageScale: scale } }
    }));
  };

  const updatePanelZoom = (pos: PanelPosition, zoomVal: number) => {
    applyChange(prev => ({
      ...prev,
      panels: { ...prev.panels, [pos]: { ...prev.panels[pos], imageZoom: zoomVal } }
    }));
  };

  const updatePanelOffset = (pos: PanelPosition, axis: 'x' | 'y', value: number) => {
    applyChange(prev => ({
      ...prev,
      panels: { 
        ...prev.panels, 
        [pos]: { ...prev.panels[pos], [axis === 'x' ? 'imageOffsetX' : 'imageOffsetY']: value } 
      }
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedPosition) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          const url = ev.target.result as string;
          updatePanelImage(selectedPosition, url);
          setUserGeneratedImages(prev => [{ id: `user-${Date.now()}`, url }, ...prev]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt || !selectedPosition) return;
    setIsGenerating(true);
    const currentPrompt = aiPrompt;
    const panelConfig = design.panels[selectedPosition];
    
    try {
      const url = await generateSacredArt(currentPrompt, panelConfig.shape, selectedPosition);
      if (url) {
        applyChange(prev => ({
          ...prev,
          panels: {
            ...prev.panels,
            [selectedPosition]: {
              ...prev.panels[selectedPosition],
              imageUrl: url,
              isPrayer: false,
              imageOffsetX: 0,
              imageOffsetY: 0,
              imageZoom: 1,
              lastPrompt: currentPrompt,
              aiHistory: [url, ...(prev.panels[selectedPosition].aiHistory || [])]
            }
          }
        }));
        setUserGeneratedImages(prev => [{ id: `ai-${Date.now()}`, url }, ...prev]);
        handleTabChange('abas');
      }
    } catch (error) { console.error(error); } finally { setIsGenerating(false); }
  };

  const resetView = () => {
    setZoom(0.85);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="flex h-screen bg-[#f1f3f5] text-slate-800 overflow-hidden font-sans select-none">
      
      <aside className="w-24 bg-white/40 backdrop-blur-2xl border-r border-slate-200 flex flex-col items-center py-10 gap-8 z-30">
        <div className="w-14 h-14 bg-slate-900 rounded-3xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-all cursor-pointer">
          <Cross className="w-7 h-7 text-white" />
        </div>
        
        {(['top', 'left', 'center', 'right', 'bottom'] as PanelPosition[]).map(pos => (
          <button 
            key={pos}
            onClick={() => { setSelectedPosition(pos); handleTabChange('abas'); setShowInspector(true); }}
            className={`relative w-14 h-14 rounded-2xl transition-all flex items-center justify-center border-2 ${selectedPosition === pos ? 'bg-yellow-600 border-yellow-500 text-white shadow-lg scale-110' : 'bg-white/60 border-transparent text-slate-400 hover:bg-white hover:text-slate-600'}`}
          >
            <span className="text-[10px] font-bold uppercase">{pos[0]}</span>
          </button>
        ))}
        <button onClick={() => setDesign(past[past.length-1] || design)} className="mt-auto p-4 text-slate-400 hover:text-slate-800 transition-colors"><Undo2 className="w-6 h-6"/></button>
      </aside>

      <main 
        onMouseDown={(e) => { if(e.button !== 2) setIsPanning(true); lastMousePos.current = { x: e.clientX, y: e.clientY }; }}
        onMouseMove={(e) => { if(!isPanning) return; const dx = e.clientX - lastMousePos.current.x; const dy = e.clientY - lastMousePos.current.y; setPan(prev => ({ x: prev.x + dx, y: prev.y + dy })); lastMousePos.current = { x: e.clientX, y: e.clientY }; }}
        onMouseUp={() => setIsPanning(false)}
        onMouseLeave={() => setIsPanning(false)}
        onWheel={(e) => setZoom(prev => Math.min(Math.max(prev * (e.deltaY > 0 ? 0.9 : 1.1), 0.2), 4))}
        className="flex-1 relative flex flex-col bg-gradient-to-tr from-[#e9ecef] via-white to-[#dee2e6] overflow-hidden"
      >
        <header className="absolute top-0 left-0 right-0 p-12 flex justify-between items-start z-40 pointer-events-none">
          <div className="backdrop-blur-xl bg-white/30 p-6 rounded-[32px] border border-white/60 shadow-sm pointer-events-auto">
            <h1 className="text-2xl font-cinzel font-bold tracking-[0.4em] text-slate-900">SacraDesign</h1>
          </div>
          <button onClick={() => setShowInspector(!showInspector)} className="p-5 bg-white/60 border border-slate-200 rounded-3xl text-slate-500 hover:bg-white transition-all shadow-xl backdrop-blur-md pointer-events-auto">
            <Settings className="w-6 h-6" />
          </button>
        </header>

        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 p-1 bg-white/50 backdrop-blur-2xl border border-white/80 rounded-full shadow-sm">
          {zoomLevels.map(z => (
            <button key={z} onClick={() => setZoom(z)} className={`px-3 py-1.5 rounded-full text-[9px] font-bold tracking-tight transition-all ${Math.abs(zoom - z) < 0.05 ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}>{Math.round((z / 0.85) * 100)}%</button>
          ))}
          <button onClick={resetView} className="p-2 text-slate-400 hover:text-yellow-600"><Maximize2 className="w-4 h-4"/></button>
        </div>

        <div className="flex-1 flex items-center justify-center perspective-[2500px]">
          <div className={`relative transition-transform duration-150 ease-out`} style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom * mockupGlobalScale})` }}>
            <div className="flex flex-col items-center gap-0 transition-all duration-[2000ms] ease-in-out" style={{ transformStyle: 'preserve-3d', transform: `rotateX(15deg) rotateY(${isRotated ? 180 : 0}deg) ${isFolded ? 'rotateX(5deg)' : ''}` }}>
              <Panel position="top" {...design.panels.top} internalFabric={design.internalFabricPattern} externalLeather={design.exteriorLeatherColor} isGoldLeaf={design.isGoldLeaf} onSelect={setSelectedPosition} isFolded={isFolded} exteriorEngraving={design.exteriorEngraving} internalStitchColor={design.internalStitchColor} internalStitchStyle={design.internalStitchStyle} internalStitchWeight={design.internalStitchWeight} externalStitchColor={design.externalStitchColor} externalStitchStyle={design.externalStitchStyle} externalStitchWeight={design.externalStitchWeight} isActive={selectedPosition === 'top'} showButtons={design.showButtons} buttonMetal={design.buttonMetal} />
              <div className="flex items-center gap-0" style={{ transformStyle: 'preserve-3d' }}>
                <Panel position="left" {...design.panels.left} internalFabric={design.internalFabricPattern} externalLeather={design.exteriorLeatherColor} isGoldLeaf={design.isGoldLeaf} onSelect={setSelectedPosition} isFolded={isFolded} exteriorEngraving={design.exteriorEngraving} internalStitchColor={design.internalStitchColor} internalStitchStyle={design.internalStitchStyle} internalStitchWeight={design.internalStitchWeight} externalStitchColor={design.externalStitchColor} externalStitchStyle={design.externalStitchStyle} externalStitchWeight={design.externalStitchWeight} isActive={selectedPosition === 'left'} showButtons={design.showButtons} buttonMetal={design.buttonMetal} />
                <Panel position="center" isCenter={true} {...design.panels.center} internalFabric={design.internalFabricPattern} externalLeather={design.exteriorLeatherColor} isGoldLeaf={design.isGoldLeaf} onSelect={setSelectedPosition} isFolded={isFolded} exteriorEngraving={design.exteriorEngraving} internalStitchColor={design.internalStitchColor} internalStitchStyle={design.internalStitchStyle} internalStitchWeight={design.internalStitchWeight} externalStitchColor={design.externalStitchColor} externalStitchStyle={design.externalStitchStyle} externalStitchWeight={design.externalStitchWeight} isActive={selectedPosition === 'center'} showButtons={design.showButtons} buttonMetal={design.buttonMetal} />
                <Panel position="right" {...design.panels.right} internalFabric={design.internalFabricPattern} externalLeather={design.exteriorLeatherColor} isGoldLeaf={design.isGoldLeaf} onSelect={setSelectedPosition} isFolded={isFolded} exteriorEngraving={design.exteriorEngraving} internalStitchColor={design.internalStitchColor} internalStitchStyle={design.internalStitchStyle} internalStitchWeight={design.internalStitchWeight} externalStitchColor={design.externalStitchColor} externalStitchStyle={design.externalStitchStyle} externalStitchWeight={design.externalStitchWeight} isActive={selectedPosition === 'right'} showButtons={design.showButtons} buttonMetal={design.buttonMetal} />
              </div>
              <Panel position="bottom" {...design.panels.bottom} internalFabric={design.internalFabricPattern} externalLeather={design.exteriorLeatherColor} isGoldLeaf={design.isGoldLeaf} onSelect={setSelectedPosition} isFolded={isFolded} exteriorEngraving={design.exteriorEngraving} internalStitchColor={design.internalStitchColor} internalStitchStyle={design.internalStitchStyle} internalStitchWeight={design.internalStitchWeight} externalStitchColor={design.externalStitchColor} externalStitchStyle={design.externalStitchStyle} externalStitchWeight={design.externalStitchWeight} isActive={selectedPosition === 'bottom'} showButtons={design.showButtons} buttonMetal={design.buttonMetal} />
            </div>
          </div>
        </div>

        <footer className="absolute bottom-12 right-12 flex items-center gap-4 z-40">
           <button onClick={() => setIsFolded(!isFolded)} className={`flex items-center gap-3 px-8 py-4 rounded-[32px] font-bold text-[10px] tracking-[0.2em] transition-all shadow-lg ${isFolded ? 'bg-slate-900 text-white' : 'bg-yellow-600 text-white hover:bg-yellow-500'}`}>
              <Box className="w-4 h-4" /> {isFolded ? 'DESDOBRAR' : 'DOBRAR PEÇA'}
           </button>
           <button onClick={() => setIsRotated(!isRotated)} className="p-4 rounded-full bg-white hover:bg-slate-50 border border-slate-100 shadow-sm"><RefreshCcw className={`w-5 h-5 transition-transform duration-[1500ms] ${isRotated ? 'rotate-180' : ''}`} /></button>
        </footer>
      </main>

      <aside className={`transition-all duration-700 bg-white/60 backdrop-blur-3xl border-l border-slate-200 flex flex-col z-50 ${showInspector ? 'w-[450px]' : 'w-0 opacity-0 overflow-hidden'}`}>
        <div className="w-[450px] h-full flex flex-col">
          <div className="p-8 border-b border-slate-100 flex gap-2">
            {(['exterior', 'interior', 'abas', 'ai'] as const).map(tab => (
              <button key={tab} onClick={() => handleTabChange(tab)} className={`flex-1 py-3 rounded-2xl text-[9px] font-bold uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                {tab === 'exterior' && <Shield className="w-4 h-4 mx-auto mb-1"/>}
                {tab === 'interior' && <Box className="w-4 h-4 mx-auto mb-1"/>}
                {tab === 'abas' && <LayoutGrid className="w-4 h-4 mx-auto mb-1"/>}
                {tab === 'ai' && <Sparkles className="w-4 h-4 mx-auto mb-1"/>}
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
            {activeTab === 'abas' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                {selectedPosition ? (
                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <h2 className="text-sm font-cinzel font-bold text-slate-900 uppercase tracking-widest">{design.panels[selectedPosition].label}</h2>
                      <button 
                        onClick={() => updatePanelImage(selectedPosition, null)} 
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-[10px] font-bold hover:bg-red-100 transition-colors shadow-sm"
                        title="Remover imagem desta ala"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> LIMPAR IMAGEM
                      </button>
                    </div>
                    
                    {/* Personalização Básica */}
                    <section className="p-8 bg-slate-50 rounded-[32px] border border-slate-200/50 space-y-8 shadow-sm">
                      <div className="flex items-center justify-between">
                         <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                           <Type className="w-3.5 h-3.5" /> Modo Oração
                         </h4>
                         <button onClick={() => applyChange(d => ({...d, panels: {...d.panels, [selectedPosition]: {...d.panels[selectedPosition], isPrayer: !d.panels[selectedPosition].isPrayer}}})) } className={`w-12 h-6 rounded-full relative transition-all ${design.panels[selectedPosition].isPrayer ? 'bg-yellow-600' : 'bg-slate-300'}`}>
                           <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${design.panels[selectedPosition].isPrayer ? 'translate-x-6' : ''}`} />
                         </button>
                      </div>
                      
                      {design.panels[selectedPosition].isPrayer && (
                        <div className="space-y-6">
                          <textarea 
                            value={design.panels[selectedPosition].prayerText} 
                            onChange={(e) => applyChange(d => ({...d, panels: {...d.panels, [selectedPosition]: {...d.panels[selectedPosition], prayerText: e.target.value}}})) } 
                            className="w-full h-32 p-4 bg-white border border-slate-200 rounded-2xl text-xs font-serif italic outline-none focus:border-yellow-600 shadow-inner" 
                          />
                          
                          {/* AJUSTE TIPOGRÁFICO: SELETOR DE COR LITÚRGICA */}
                          <div className="space-y-4">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cores Litúrgicas do Texto</span>
                            <div className="flex gap-2">
                              {TEXT_COLORS.map(c => (
                                <button 
                                  key={c.id} 
                                  onClick={() => applyChange(d => ({...d, panels: {...d.panels, [selectedPosition]: {...d.panels[selectedPosition], prayerTextColor: c.color}}})) } 
                                  className={`w-8 h-8 rounded-full border-2 transition-all ${design.panels[selectedPosition].prayerTextColor === c.color ? 'border-yellow-600 scale-110 shadow-sm' : 'border-slate-100'}`} 
                                  style={{backgroundColor: c.color}}
                                  title={c.name}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Geometria do Recorte</span>
                         <div className="grid grid-cols-3 gap-3">
                           {(['square', 'circle', 'oval'] as PanelShape[]).map(s => (
                             <button key={s} onClick={() => updatePanelShape(selectedPosition, s)} className={`p-3 rounded-xl border-2 transition-all ${design.panels[selectedPosition].shape === s ? 'border-yellow-600 bg-yellow-50 text-yellow-800 shadow-sm' : 'border-slate-100 bg-white text-slate-400'}`}>
                               {s === 'square' ? <Square className="w-4 h-4 mx-auto"/> : s === 'circle' ? <Circle className="w-4 h-4 mx-auto"/> : <div className="w-3 h-5 border-2 border-current rounded-full mx-auto"/>}
                               <span className="text-[8px] font-bold uppercase block mt-1">{s}</span>
                             </button>
                           ))}
                         </div>
                      </div>

                      {/* FERRAMENTAS DE DIMENSÃO (Visíveis para Imagem OU Oração) */}
                      {(design.panels[selectedPosition].imageUrl || design.panels[selectedPosition].isPrayer) && (
                        <div className="space-y-8 pt-6 border-t border-slate-200/50">
                          {/* Tamanho e Zoom */}
                          <div className="space-y-6">
                            <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
                              <span>Tamanho do Frame</span>
                              <span className="text-slate-900">{Math.round((design.panels[selectedPosition].imageScale || 0.68) * 100)}%</span>
                            </div>
                            <input 
                              type="range" 
                              min="0.3" 
                              max="0.78" 
                              step="0.01" 
                              value={design.panels[selectedPosition].imageScale || 0.68} 
                              onChange={(e) => updatePanelScale(selectedPosition, parseFloat(e.target.value))} 
                              className="w-full h-1 bg-slate-200 rounded-full appearance-none accent-yellow-600" 
                            />
                            
                            <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
                              <span>Zoom da Imagem / Texto</span>
                              <span className="text-slate-900">{Math.round((design.panels[selectedPosition].imageZoom || 1) * 100)}%</span>
                            </div>
                            <input 
                              type="range" 
                              min="1" 
                              max="4" 
                              step="0.01" 
                              value={design.panels[selectedPosition].imageZoom || 1} 
                              onChange={(e) => updatePanelZoom(selectedPosition, parseFloat(e.target.value))} 
                              className="w-full h-1 bg-slate-200 rounded-full appearance-none accent-yellow-600" 
                            />
                          </div>

                          {/* Reposicionamento (Mantido apenas para Imagens para evitar desalinhamento de texto) */}
                          {design.panels[selectedPosition].imageUrl && (
                            <div className="space-y-6">
                              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Move className="w-3.5 h-3.5" /> Reposicionamento de Obra
                              </h5>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between text-[9px] font-bold uppercase text-slate-500">
                                  <span className="flex items-center gap-1"><MoveHorizontal className="w-3 h-3"/> Eixo Horizontal</span>
                                  <span>{design.panels[selectedPosition].imageOffsetX}px</span>
                                </div>
                                <input 
                                  type="range" 
                                  min="-100" 
                                  max="100" 
                                  step="1" 
                                  value={design.panels[selectedPosition].imageOffsetX || 0} 
                                  onChange={(e) => updatePanelOffset(selectedPosition, 'x', parseInt(e.target.value))} 
                                  className="w-full h-1 bg-slate-200 rounded-full appearance-none accent-slate-600" 
                                />
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between text-[9px] font-bold uppercase text-slate-500">
                                  <span className="flex items-center gap-1"><MoveVertical className="w-3 h-3"/> Eixo Vertical</span>
                                  <span>{design.panels[selectedPosition].imageOffsetY}px</span>
                                </div>
                                <input 
                                  type="range" 
                                  min="-100" 
                                  max="100" 
                                  step="1" 
                                  value={design.panels[selectedPosition].imageOffsetY || 0} 
                                  onChange={(e) => updatePanelOffset(selectedPosition, 'y', parseInt(e.target.value))} 
                                  className="w-full h-1 bg-slate-200 rounded-full appearance-none accent-slate-600" 
                                />
                              </div>
                              
                              <button 
                                onClick={() => {
                                  updatePanelOffset(selectedPosition, 'x', 0);
                                  updatePanelOffset(selectedPosition, 'y', 0);
                                }}
                                className="w-full py-2 text-[8px] font-black uppercase tracking-tighter text-slate-400 hover:text-slate-900 transition-colors"
                              >
                                Resetar Coordenadas
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </section>

                    {/* Sugestões Default */}
                    <section className="space-y-6">
                      <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-3">
                        <History className="w-5 h-5 text-yellow-600" /> Obras Sacras Sugeridas
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        <button 
                          onClick={() => updatePanelImage(selectedPosition, null)} 
                          className="aspect-square bg-white border-2 border-slate-100 rounded-2xl flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all border-dashed"
                        >
                          <Trash2 className="w-6 h-6" />
                          <span className="text-[8px] font-bold uppercase">Limpar</span>
                        </button>
                        {DEFAULT_AI_HISTORY.map((url, idx) => (
                          <button 
                            key={idx} 
                            onClick={() => updatePanelImage(selectedPosition, url)} 
                            className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all relative group bg-slate-200 ${design.panels[selectedPosition].imageUrl === url ? 'border-yellow-600 scale-105 shadow-md' : 'border-white hover:border-slate-300'}`}
                          >
                            <img src={url} alt={`Sugestão ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                            <div className={`absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-all ${design.panels[selectedPosition].imageUrl === url ? 'bg-yellow-600/20' : ''}`}>
                               <Check className={`text-white transition-opacity ${design.panels[selectedPosition].imageUrl === url ? 'opacity-100' : 'opacity-0'}`} />
                            </div>
                          </button>
                        ))}
                      </div>
                    </section>

                    {/* Galeria de Relíquias */}
                    <section className="space-y-6">
                      <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-3">
                        <Image className="w-5 h-5 text-yellow-600" /> Galeria de Relíquias
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        <label className="aspect-square bg-white border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-yellow-50 transition-all">
                          <Upload className="w-6 h-6 text-slate-300" />
                          <input type="file" className="hidden" onChange={handleFileUpload} />
                        </label>
                        {userGeneratedImages.map(img => (
                          <button key={img.id} onClick={() => updatePanelImage(selectedPosition, img.url)} className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${design.panels[selectedPosition].imageUrl === img.url ? 'border-yellow-600 scale-105 shadow-md' : 'border-white'}`}>
                            <img src={img.url} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </section>
                  </div>
                ) : (
                  <div className="h-[400px] flex flex-col items-center justify-center text-center opacity-30">
                    <MousePointer2 className="w-14 h-14 text-slate-300 mb-6" />
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] max-w-[200px]">Selecione uma ala do oratório no preview para começar</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                 <div className="space-y-4">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                     <Edit3 className="w-3.5 h-3.5" /> COMANDO DE MANIFESTAÇÃO
                   </label>
                   <textarea 
                     value={aiPrompt} 
                     onChange={(e) => setAiPrompt(e.target.value)} 
                     placeholder="Ex: A Virgem Maria em estilo barroco com tons dourados..." 
                     className="w-full h-72 p-10 bg-white border-[6px] border-slate-800 rounded-[44px] text-sm outline-none focus:border-yellow-600 transition-all shadow-xl font-serif italic" 
                   />
                 </div>
                 <button onClick={handleGenerateAI} disabled={isGenerating || !aiPrompt || !selectedPosition} className="w-full py-9 bg-slate-900 text-white rounded-[44px] text-[13px] font-bold uppercase tracking-[0.5em] flex items-center justify-center gap-4 disabled:opacity-30 shadow-2xl hover:bg-black transition-all font-cinzel">
                   {isGenerating ? <Loader2 className="w-7 h-7 animate-spin" /> : <Wand2 className="w-7 h-7" />}
                   {isGenerating ? 'MANIFESTANDO...' : 'CRIAR OBRA SACRA'}
                 </button>
              </div>
            )}
            
            {activeTab === 'exterior' && (
               <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                  <section className="space-y-6">
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Couros Nobres</h3>
                    <div className="grid grid-cols-5 gap-3">
                      {LEATHER_COLORS.map(l => (
                        <button key={l.id} onClick={() => applyChange(d => ({...d, exteriorLeatherColor: l.id as any}))} className={`w-full aspect-square rounded-full border-4 transition-all ${design.exteriorLeatherColor === l.id ? 'border-yellow-600 scale-110 shadow-md' : 'border-white hover:border-slate-200'}`} style={{backgroundColor: l.color}} title={l.name} />
                      ))}
                    </div>
                  </section>

                  {/* NOVO MENU DE PERSONALIZAÇÃO DE BOTÕES */}
                  <section className="p-8 bg-slate-50 rounded-[32px] border border-slate-200/50 space-y-8 shadow-sm">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                         <CircleDot className="w-4 h-4" /> Botões de Fechamento
                       </h4>
                       <button onClick={() => applyChange(d => ({...d, showButtons: !d.showButtons}))} className={`w-12 h-6 rounded-full relative transition-all ${design.showButtons ? 'bg-yellow-600' : 'bg-slate-300'}`}>
                         <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${design.showButtons ? 'translate-x-6' : ''}`} />
                       </button>
                    </div>

                    {design.showButtons && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Acabamento Metálico</span>
                        <div className="grid grid-cols-4 gap-3">
                          {BUTTON_METALS.map(m => (
                            <button 
                              key={m.id} 
                              onClick={() => applyChange(d => ({...d, buttonMetal: m.id as ButtonMetal}))} 
                              className={`aspect-square rounded-xl border-2 transition-all flex flex-col items-center justify-center p-2 ${design.buttonMetal === m.id ? 'border-yellow-600 bg-yellow-50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                            >
                              <div className="w-6 h-6 rounded-full shadow-inner mb-2" style={{ backgroundColor: m.color, boxShadow: `inset -2px -2px 4px rgba(0,0,0,0.3), 2px 2px 4px ${m.highlight}` }} />
                              <span className="text-[7px] font-bold uppercase text-center leading-tight">{m.name.split(' ')[0]}</span>
                            </button>
                          ))}
                        </div>
                        <div className="p-4 bg-white rounded-2xl border border-slate-100">
                          <p className="text-[9px] text-slate-400 font-medium leading-relaxed italic">
                            * Os botões de pressão (Macho na Ala Superior e Fêmea na Ala Inferior) permitem o fechamento vertical seguro da peça.
                          </p>
                        </div>
                      </div>
                    )}
                  </section>

                  <section className="space-y-6">
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Dimensão do Mockup</h3>
                    <input type="range" min="0.5" max="2" step="0.05" value={mockupGlobalScale} onChange={(e) => setMockupGlobalScale(parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-full appearance-none accent-yellow-600" />
                  </section>
               </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default App;
