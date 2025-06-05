
// ABOUTME: Default payload configurations for all block types
// Provides standardized starting configurations for new blocks

import { BlockType, BlockPayload } from '@/types/review';

export const getDefaultPayload = (type: BlockType): BlockPayload => {
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
        text: 'Novo Título',
        level: 2,
        anchor: ''
      };

    case 'paragraph':
      return {
        content: '<p>Digite seu conteúdo aqui...</p>',
        alignment: 'left',
        emphasis: 'normal'
      };

    case 'figure':
      return {
        src: '',
        alt: '',
        caption: '',
        width: 'auto',
        alignment: 'center'
      };

    case 'table':
      return {
        title: '',
        headers: ['Coluna 1', 'Coluna 2'],
        rows: [['Dados 1', 'Dados 2']],
        caption: '',
        compact: false
      };

    case 'callout':
      return {
        type: 'info',
        title: 'Informação Importante',
        content: 'Digite o conteúdo do destaque aqui...',
        icon: ''
      };

    case 'number_card':
      return {
        number: '0',
        label: 'Métrica',
        description: 'Descrição da métrica',
        trend: 'neutral',
        percentage: 0
      };

    case 'reviewer_quote':
      return {
        quote: 'Digite a citação aqui...',
        author: 'Nome do Autor',
        title: 'Título/Cargo',
        institution: 'Instituição',
        avatar_url: ''
      };

    case 'poll':
      return {
        question: 'Qual é sua opinião?',
        options: [
          { id: '1', text: 'Opção 1', votes: 0 },
          { id: '2', text: 'Opção 2', votes: 0 }
        ],
        poll_type: 'single_choice',
        total_votes: 0,
        opens_at: new Date().toISOString(),
        closes_at: null
      };

    case 'citation_list':
      return {
        citations: [],
        style: 'apa',
        numbered: true,
        title: 'Referências'
      };

    case 'divider':
      return {
        style: 'solid',
        color: '#2a2a2a',
        thickness: 1
      };

    default:
      return {};
  }
};
