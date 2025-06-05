
// ABOUTME: Default payload configurations for different block types
// Provides initial data structures for new blocks

import { BlockType } from '@/types/review';

export const getDefaultPayload = (type: BlockType): Record<string, any> => {
  switch (type) {
    case 'snapshot_card':
      return {
        population: '',
        intervention: '',
        comparison: '',
        outcome: '',
        design: '',
        key_findings: [],
        evidence_level: 'moderate',
        recommendation_strength: 'conditional'
      };
    case 'heading':
      return {
        text: 'Nova Seção',
        level: 2,
        slug: '',
        anchor_id: ''
      };
    case 'paragraph':
      return {
        content: '<p>Digite o conteúdo aqui...</p>',
        citations: []
      };
    case 'figure':
      return {
        image_url: '',
        caption: '',
        alt_text: '',
        figure_number: null
      };
    case 'table':
      return {
        headers: ['Coluna 1', 'Coluna 2'],
        rows: [['Dado 1', 'Dado 2']],
        caption: '',
        sortable: true
      };
    case 'callout':
      return {
        type: 'info',
        title: '',
        content: 'Conteúdo do destaque...',
        icon: ''
      };
    case 'number_card':
      return {
        number: '0',
        label: 'Métrica',
        description: '',
        trend: 'neutral'
      };
    case 'reviewer_quote':
      return {
        quote: '',
        author: '',
        title: '',
        institution: '',
        avatar_url: ''
      };
    case 'poll':
      return {
        question: 'Nova pergunta de enquete',
        options: [
          { id: '1', text: 'Opção 1', votes: 0 },
          { id: '2', text: 'Opção 2', votes: 0 }
        ],
        poll_type: 'single_choice',
        total_votes: 0,
        is_open: true
      };
    case 'citation_list':
      return {
        title: 'Referências Bibliográficas',
        citations: [],
        style: 'apa',
        show_numbers: true,
        show_links: true
      };
    default:
      return {};
  }
};
