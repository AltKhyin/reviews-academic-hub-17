
// ABOUTME: Core types for homepage layout customization system
// Defines spacing, sizing, and configuration interfaces for flexible layout control

export interface SpacingConfig {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface SizeConfig {
  maxWidth: string; // e.g., 'max-w-4xl', 'max-w-5xl', etc.
  width: string;    // e.g., 'w-full', 'w-auto', etc.
}

export interface SectionLayoutConfig {
  id: string;
  name: string;
  padding: SpacingConfig;
  margin: SpacingConfig;
  size: SizeConfig;
  visible: boolean;
  order: number;
}

export interface PageLayoutConfig {
  id: 'homepage' | 'dashboard';
  name: string;
  globalPadding: SpacingConfig;
  globalMargin: SpacingConfig;
  globalSize: SizeConfig;
  sections: SectionLayoutConfig[];
  lastModified: string;
  version: number;
}

export interface LayoutPreset {
  id: string;
  name: string;
  description: string;
  config: PageLayoutConfig;
  isDefault: boolean;
  createdAt: string;
}

// Utility type for Tailwind spacing classes
export type TailwindSpacing = 
  | '0' | '0.5' | '1' | '1.5' | '2' | '2.5' | '3' | '3.5' | '4' | '5' | '6' | '7' | '8' | '9' | '10' 
  | '11' | '12' | '14' | '16' | '18' | '20' | '24' | '28' | '32' | '36' | '40' | '44' | '48' | '52' 
  | '56' | '60' | '64' | '72' | '80' | '96';

// Utility type for Tailwind max-width classes
export type TailwindMaxWidth = 
  | 'max-w-xs' | 'max-w-sm' | 'max-w-md' | 'max-w-lg' | 'max-w-xl' | 'max-w-2xl' | 'max-w-3xl' 
  | 'max-w-4xl' | 'max-w-5xl' | 'max-w-6xl' | 'max-w-7xl' | 'max-w-full' | 'max-w-screen-sm' 
  | 'max-w-screen-md' | 'max-w-screen-lg' | 'max-w-screen-xl' | 'max-w-screen-2xl';

// Utility type for Tailwind width classes
export type TailwindWidth = 
  | 'w-auto' | 'w-full' | 'w-screen' | 'w-min' | 'w-max' | 'w-fit' 
  | 'w-1/2' | 'w-1/3' | 'w-2/3' | 'w-1/4' | 'w-3/4' | 'w-1/5' | 'w-2/5' | 'w-3/5' | 'w-4/5';

export const DEFAULT_SPACING: SpacingConfig = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
};

export const DEFAULT_SIZE: SizeConfig = {
  maxWidth: 'max-w-5xl',
  width: 'w-full'
};

export const DEFAULT_HOMEPAGE_SECTIONS: SectionLayoutConfig[] = [
  {
    id: 'hero',
    name: 'Hero Section',
    padding: { top: 8, right: 4, bottom: 8, left: 4 },
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    size: { maxWidth: 'max-w-3xl', width: 'w-full' },
    visible: true,
    order: 0
  },
  {
    id: 'articles',
    name: 'Articles Grid',
    padding: { top: 12, right: 4, bottom: 12, left: 4 },
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    size: { maxWidth: 'max-w-5xl', width: 'w-full' },
    visible: true,
    order: 1
  }
];
