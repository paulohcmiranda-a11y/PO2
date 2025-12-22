
import React from 'react';

export const LEATHER_COLORS = [
  { id: 'burgundy', name: 'Bordeaux', color: '#630d16', texture: 'https://www.transparenttextures.com/patterns/leather.png' },
  { id: 'navy', name: 'Azul Marinho', color: '#0d1b2a', texture: 'https://www.transparenttextures.com/patterns/leather.png' },
  { id: 'forest', name: 'Verde Floresta', color: '#1a2e1a', texture: 'https://www.transparenttextures.com/patterns/leather.png' },
  { id: 'tobacco', name: 'Tabaco', color: '#3d2b1f', texture: 'https://www.transparenttextures.com/patterns/leather.png' },
  { id: 'black', name: 'Preto Nobre', color: '#121212', texture: 'https://www.transparenttextures.com/patterns/leather.png' },
];

export const LITURGICAL_FABRICS = [
  { id: 'golden-damask', name: 'Damasco Dourado', color: '#d4af37', texture: 'https://www.transparenttextures.com/patterns/cubes.png' },
  { id: 'white-brocade', name: 'Brocado Branco', color: '#fcfcfc', texture: 'https://www.transparenttextures.com/patterns/shattered-island.png' },
  { id: 'purple-liturgical', name: 'Roxo Quaresmal', color: '#4b0082', texture: 'https://www.transparenttextures.com/patterns/gplay.png' },
  { id: 'natural-linen', name: 'Linho Rústico', color: '#e5e1d5', texture: 'https://www.transparenttextures.com/patterns/natural-paper.png' },
];

export const BUTTON_METALS = [
  { id: 'gold', name: 'Ouro Polido', color: '#d4af37', highlight: '#fdf5e6' },
  { id: 'silver', name: 'Prata Cromo', color: '#a8a9ad', highlight: '#ffffff' },
  { id: 'antique-brass', name: 'Latão Envelhecido', color: '#8e7618', highlight: '#c5b358' },
  { id: 'black-nickel', name: 'Níquel Negro', color: '#1a1a1a', highlight: '#4a4a4a' },
];

export const STITCH_COLORS = [
  { id: 'gold', name: 'Ouro Ducado', color: '#d4af37' },
  { id: 'silver', name: 'Prata Velha', color: '#a8a9ad' },
  { id: 'crimson', name: 'Carmesim', color: '#8b0000' },
  { id: 'white', name: 'Seda Branca', color: '#f5f5f5' },
  { id: 'black', name: 'Preto Nanquim', color: '#1a1a1a' },
];

export const TEXT_COLORS = [
  { id: 'charcoal', name: 'Nanquim', color: '#1a1a1a' },
  { id: 'sepia', name: 'Sépia', color: '#4a3728' },
  { id: 'blood', name: 'Carmesim', color: '#7a0000' },
  { id: 'gold', name: 'Ouro Nobre', color: '#b8860b' },
  { id: 'white', name: 'Branco Marfim', color: '#fdf5e6' },
];

export const STITCH_STYLES = [
  { id: 'dashed', name: 'Ponto Corrido', spacing: '6px 4px' },
  { id: 'solid', name: 'Linha Direta', spacing: 'none' },
  { id: 'dotted', name: 'Ponto de Agulha', spacing: '2px 3px' },
  { id: 'double', name: 'Ponto Duplo', spacing: 'none' },
];

export const CRUCIFIX_STYLES = [
  { id: 'metal', name: 'Metal Prateado' },
  { id: 'classic', name: 'Pintura Sacra' },
  { id: 'san-damiano', name: 'São Damião' },
];

export const DEFAULT_PRAYER = `ANIMA Christi, sanctifica me.
Corpus Christi, salva me.
Sanguis Christi, inebria me.
Aqua lateris Christi, lava me.
Passio Christi, conforta me.
O bone Iesu, exaudi me.
Intra tua vulnera absconde me.
Ne permittas me separari a te.
Amen.`;

export const PRESET_IMAGES = [
  { 
    id: 'sacred-1', 
    url: 'https://images.unsplash.com/photo-1594708767771-a7502209ff51?auto=format&fit=crop&q=80&w=800', 
    title: 'Virgem Maria' 
  },
  { 
    id: 'sacred-2', 
    url: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=800', 
    title: 'Cristo Crucificado' 
  },
  { 
    id: 'sacred-3', 
    url: 'https://images.unsplash.com/photo-1579623261984-41f9a81d4044?auto=format&fit=crop&q=80&w=800', 
    title: 'Anjo Adorador' 
  },
];

export const DEFAULT_AI_HISTORY = [
  'https://images.unsplash.com/photo-1594708767771-a7502209ff51?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1579623261984-41f9a81d4044?auto=format&fit=crop&q=80&w=800',
];
