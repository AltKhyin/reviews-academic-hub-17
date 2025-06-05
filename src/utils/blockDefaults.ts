
// ABOUTME: Block default configurations and content templates
// Provides consistent default values for all block types

import { BlockType } from '@/types/review';

// Generic block content type (replaces BlockPayload)
export type BlockContent = any;

export const getBlockDefaults = (type: BlockType): BlockContent => {
  switch (type) {
    case 'paragraph':
      return {
        content: '',
        alignment: 'left',
        emphasis: 'normal',
        text_color: '#d1d5db',
        background_color: 'transparent',
        border_color: 'transparent'
      };

    case 'heading':
      return {
        text: '',
        level: 1,
        anchor: '',
        text_color: '#ffffff',
        background_color: 'transparent',
        border_color: 'transparent'
      };

    case 'list':
      return {
        items: [''],
        ordered: false,
        text_color: '#d1d5db',
        background_color: 'transparent',
        border_color: 'transparent'
      };

    case 'quote':
      return {
        text: '',
        author: '',
        citation: '',
        text_color: '#d1d5db',
        background_color: 'transparent',
        border_color: '#4f46e5'
      };

    case 'code':
      return {
        code: '',
        language: 'javascript',
        showLineNumbers: true,
        text_color: '#d1d5db',
        background_color: '#111827',
        border_color: '#374151'
      };

    case 'figure':
      return {
        src: '',
        alt: '',
        caption: '',
        width: 'auto',
        text_color: '#d1d5db',
        background_color: 'transparent',
        border_color: 'transparent'
      };

    case 'callout':
      return {
        type: 'info',
        title: '',
        content: '',
        text_color: '#ffffff',
        background_color: 'rgba(59, 130, 246, 0.1)',
        border_color: '#3b82f6',
        accent_color: '#3b82f6'
      };

    case 'table':
      return {
        headers: ['Coluna 1', 'Coluna 2'],
        rows: [['', '']],
        sortable: false,
        compact: false,
        text_color: '#d1d5db',
        background_color: 'transparent',
        border_color: '#2a2a2a',
        header_bg_color: '#1a1a1a',
        cell_bg_color: 'transparent'
      };

    case 'citation_list':
      return {
        title: 'Referências',
        citations: [],
        citation_style: 'apa',
        numbered: true,
        backgroundColor: '#1a1a1a',
        borderColor: '#2a2a2a',
        titleColor: '#ffffff',
        textColor: '#d1d5db',
        accentColor: '#8b5cf6',
        linkColor: '#3b82f6'
      };

    case 'poll':
      return {
        question: '',
        options: ['Opção 1', 'Opção 2'],
        poll_type: 'single_choice',
        votes: [0, 0],
        total_votes: 0,
        allow_add_options: false,
        text_color: '#ffffff',
        background_color: '#1a1a1a',
        border_color: '#2a2a2a',
        accent_color: '#3b82f6'
      };

    case 'reviewer_quote':
      return {
        quote: '',
        author: '',
        title: '',
        institution: '',
        avatar_url: '',
        text_color: '#ffffff',
        background_color: '#1a1a1a',
        border_color: '#2a2a2a',
        accent_color: '#a855f7'
      };

    case 'snapshot_card':
      return {
        population: '',
        intervention: '',
        comparison: '',
        outcome: '',
        design: '',
        key_findings: [],
        evidence_level: 'moderate',
        recommendation_strength: 'conditional',
        background_color: '#1a1a1a',
        border_color: '#2a2a2a',
        accent_color: '#3b82f6',
        text_color: '#ffffff'
      };

    case 'number_card':
      return {
        number: '0',
        label: 'Métrica',
        description: '',
        trend: 'neutral',
        percentage: 0,
        text_color: '#ffffff',
        background_color: '#1a1a1a',
        border_color: '#2a2a2a',
        accent_color: '#3b82f6'
      };

    case 'divider':
      return {
        style: 'gradient',
        color: '#d1d5db',
        thickness: 1
      };

    default:
      return {
        text_color: '#d1d5db',
        background_color: 'transparent',
        border_color: 'transparent'
      };
  }
};

export const createBlockContent = (type: BlockType, customContent?: Partial<BlockContent>): BlockContent => {
  const defaults = getBlockDefaults(type);
  return { ...defaults, ...customContent };
};
