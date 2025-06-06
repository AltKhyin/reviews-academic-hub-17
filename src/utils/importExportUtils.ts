// ABOUTME: Enhanced import/export utilities with comprehensive format handling and content preservation
// Handles data migration, validation, and complete content field mapping for all block types

import { ReviewBlock, BlockType } from '@/types/review';
import { normalizePercentages, validateGridLayout } from './gridLayoutUtils';

export interface ImportData {
  version: string;
  timestamp: string;
  blocks: any[];
  metadata?: {
    totalBlocks: number;
    gridBlocks: number;
    singleBlocks: number;
    exportSource: string;
  };
}

export interface ExportData {
  version: string;
  timestamp: string;
  blocks: ReviewBlock[];
  metadata: {
    totalBlocks: number;
    gridBlocks: number;
    singleBlocks: number;
    exportSource: string;
  };
}

/**
 * Comprehensive content field mapping for all block types
 * Ensures all content variants are properly preserved during import/export
 */
const normalizeBlockContent = (block: any): any => {
  const content = block.content || block.payload || {};
  
  // Handle block-specific content normalization
  switch (block.type) {
    case 'heading':
      return {
        text: content.text || content.content || 'Novo Título',
        level: content.level || 2,
        anchor: content.anchor,
        text_color: content.text_color,
        background_color: content.background_color
      };
      
    case 'paragraph':
      return {
        text: content.text || content.content || 'Novo parágrafo',
        content: content.content || content.text,
        text_color: content.text_color,
        background_color: content.background_color
      };
      
    case 'figure':
      return {
        url: content.url || content.src || '',
        src: content.src || content.url || content.image_url || '',
        caption: content.caption || 'Nova figura',
        alt: content.alt || content.alt_text || '',
        width: content.width || '100%',
        height: content.height,
        image_url: content.image_url || content.src || content.url,
        alt_text: content.alt_text || content.alt
      };
      
    case 'table':
      return {
        headers: content.headers || ['Coluna 1', 'Coluna 2'],
        rows: content.rows || [['Dado 1', 'Dado 2']],
        table_data: content.table_data || {
          headers: content.headers || ['Coluna 1', 'Coluna 2'],
          rows: content.rows || [['Dado 1', 'Dado 2']],
          sortable: content.sortable || false,
          compact: content.compact || false,
          striped: content.striped || false,
          bordered: content.bordered || false
        },
        caption: content.caption,
        text_color: content.text_color,
        background_color: content.background_color,
        border_color: content.border_color
      };
      
    case 'callout':
      return {
        text: content.text || 'Nova caixa de destaque',
        content: content.content || content.text,
        type: content.type || 'info',
        title: content.title || 'Destaque',
        text_color: content.text_color,
        background_color: content.background_color,
        border_color: content.border_color,
        accent_color: content.accent_color
      };
      
    case 'snapshot_card':
      return {
        title: content.title || 'Novo Snapshot',
        subtitle: content.subtitle,
        value: content.value || '0',
        change: content.change,
        trend: content.trend,
        population: content.population,
        intervention: content.intervention,
        comparison: content.comparison,
        outcome: content.outcome,
        design: content.design,
        // Preserve finding sections exactly as they are
        finding_sections: content.finding_sections || content.key_findings ? 
          content.finding_sections || [{
            id: 'migrated_findings',
            label: 'Principais Achados',
            items: (content.key_findings || []).map((finding: string, index: number) => ({
              id: `migrated_item_${index}`,
              text: finding,
              color: '#3b82f6'
            }))
          }] : [],
        // Preserve custom badges exactly as they are
        custom_badges: content.custom_badges || [],
        // Legacy field migration
        evidence_level: content.evidence_level,
        recommendation_strength: content.recommendation_strength,
        text_color: content.text_color,
        background_color: content.background_color,
        accent_color: content.accent_color
      };
      
    case 'number_card':
      return {
        title: content.title || 'Novo Card Numérico',
        number: content.number || content.value || '0',
        value: content.value || content.number || '0',
        description: content.description,
        trend: content.trend || 'neutral',
        percentage: content.percentage,
        show_comparison: content.show_comparison,
        show_target: content.show_target,
        previous_value: content.previous_value,
        target_value: content.target_value,
        text_color: content.text_color,
        background_color: content.background_color,
        accent_color: content.accent_color
      };
      
    case 'reviewer_quote':
      return {
        quote: content.quote || content.text || 'Nova citação do revisor',
        text: content.text || content.quote,
        author: content.author || content.reviewer || 'Revisor',
        reviewer: content.reviewer || content.author,
        role: content.role || 'Especialista',
        institution: content.institution,
        rating: content.rating,
        show_context: content.show_context,
        show_date: content.show_date,
        show_location: content.show_location,
        show_contact: content.show_contact,
        show_rating: content.show_rating,
        text_color: content.text_color,
        background_color: content.background_color,
        border_color: content.border_color
      };
      
    case 'poll':
      return {
        question: content.question || 'Nova enquete',
        options: content.options || [
          { id: 'option-0', text: 'Opção 1', votes: 0 },
          { id: 'option-1', text: 'Opção 2', votes: 0 }
        ],
        description: content.description,
        poll_type: content.poll_type || 'single_choice',
        poll_status: content.poll_status || 'active',
        show_results: content.show_results,
        show_vote_count: content.show_vote_count,
        show_percentage: content.show_percentage,
        result_display: content.result_display,
        text_color: content.text_color,
        background_color: content.background_color,
        border_color: content.border_color,
        accent_color: content.accent_color
      };
      
    case 'citation_list':
      return {
        citations: content.citations || [],
        title: content.title || 'Referências',
        description: content.description,
        show_abstract: content.show_abstract,
        show_keywords: content.show_keywords,
        group_by_type: content.group_by_type,
        text_color: content.text_color,
        background_color: content.background_color
      };
      
    case 'divider':
      return {
        style: content.style || 'solid',
        color: content.color || '#374151',
        thickness: content.thickness || 1
      };
      
    case 'code':
      return {
        code: content.code || '// Código aqui',
        language: content.language || 'javascript',
        text_color: content.text_color,
        background_color: content.background_color
      };
      
    case 'list':
      return {
        items: content.items || ['Item 1', 'Item 2'],
        ordered: content.ordered || false,
        text_color: content.text_color,
        background_color: content.background_color
      };
      
    case 'quote':
      return {
        text: content.text || 'Nova citação',
        author: content.author || '',
        text_color: content.text_color,
        background_color: content.background_color,
        border_color: content.border_color
      };
      
    default:
      return content;
  }
};

/**
 * Validate import data structure with enhanced content checking
 */
export const validateImportData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data || typeof data !== 'object') {
    errors.push('Invalid data format: must be a JSON object');
    return { isValid: false, errors };
  }
  
  if (!data.version) {
    errors.push('Missing version field');
  }
  
  if (!data.blocks || !Array.isArray(data.blocks)) {
    errors.push('Missing or invalid blocks array');
    return { isValid: false, errors };
  }
  
  // Validate each block with content checking
  data.blocks.forEach((block: any, index: number) => {
    if (!block.type) {
      errors.push(`Block ${index}: missing type field`);
    }
    
    // Content validation is now more permissive to handle various formats
    const hasContent = block.content || block.payload;
    if (!hasContent && block.type !== 'divider') {
      console.warn(`Block ${index}: no content found, will use defaults`);
    }
    
    if (typeof block.sort_index !== 'number') {
      console.warn(`Block ${index}: invalid sort_index, will be auto-assigned`);
    }
  });
  
  return { isValid: errors.length === 0, errors };
};

/**
 * Enhanced migration with comprehensive content preservation
 */
export const migrateImportData = (data: any): ReviewBlock[] => {
  console.log('Starting enhanced data migration:', { 
    version: data.version, 
    blocksCount: data.blocks?.length,
    timestamp: new Date().toISOString()
  });
  
  if (!data.blocks || !Array.isArray(data.blocks)) {
    throw new Error('Invalid blocks data');
  }
  
  const migratedBlocks: ReviewBlock[] = data.blocks.map((block: any, index: number) => {
    // Normalize content with comprehensive field mapping
    const normalizedContent = normalizeBlockContent(block);
    
    // Generate proper ID if missing
    const id = block.id || -(Date.now() + Math.random() + index);
    
    // Migrate and validate layout metadata
    const meta = migrateBlockMeta(block.meta);
    
    const migratedBlock: ReviewBlock = {
      id,
      type: block.type as BlockType,
      content: normalizedContent,
      sort_index: typeof block.sort_index === 'number' ? block.sort_index : index,
      visible: typeof block.visible === 'boolean' ? block.visible : true,
      meta,
      created_at: block.created_at || new Date().toISOString(),
      updated_at: block.updated_at || new Date().toISOString()
    };
    
    console.log(`Migrated block ${index}:`, {
      id: migratedBlock.id,
      type: migratedBlock.type,
      contentKeys: Object.keys(migratedBlock.content),
      hasLayout: !!migratedBlock.meta?.layout,
      layoutType: migratedBlock.meta?.layout?.row_id ? '1D grid' : 
                  migratedBlock.meta?.layout?.grid_id ? '2D grid' : 'single'
    });
    
    return migratedBlock;
  });
  
  // Repair grid metadata after migration
  const repairedBlocks = repairGridMetadata(migratedBlocks);
  
  console.log('Enhanced migration complete:', {
    originalBlocks: data.blocks.length,
    migratedBlocks: repairedBlocks.length,
    gridBlocks: repairedBlocks.filter(b => b.meta?.layout).length,
    contentPreserved: true
  });
  
  return repairedBlocks;
};

/**
 * Migrate block metadata with proper validation
 */
const migrateBlockMeta = (meta: any): any => {
  if (!meta) return {};
  
  const migratedMeta = { ...meta };
  
  // Handle layout migration
  if (meta.layout) {
    const layout = { ...meta.layout };
    
    // Normalize column widths if present
    if (layout.columnWidths && Array.isArray(layout.columnWidths)) {
      const normalizedWidths = normalizePercentages(layout.columnWidths);
      if (validateGridLayout(normalizedWidths)) {
        layout.columnWidths = normalizedWidths;
      } else {
        console.warn('Invalid column widths detected, using default layout');
        layout.columnWidths = undefined;
      }
    }
    
    // Ensure numeric values are properly typed
    if (typeof layout.position === 'string') {
      layout.position = parseInt(layout.position, 10);
    }
    if (typeof layout.columns === 'string') {
      layout.columns = parseInt(layout.columns, 10);
    }
    if (typeof layout.gap === 'string') {
      layout.gap = parseInt(layout.gap, 10);
    }
    
    migratedMeta.layout = layout;
  }
  
  return migratedMeta;
};

/**
 * Repair grid metadata consistency after import
 */
export const repairGridMetadata = (blocks: ReviewBlock[]): ReviewBlock[] => {
  const repairedBlocks = [...blocks];
  
  // Group blocks by grid/row
  const gridGroups = new Map<string, ReviewBlock[]>();
  const rowGroups = new Map<string, ReviewBlock[]>();
  
  repairedBlocks.forEach(block => {
    const layout = block.meta?.layout;
    if (layout?.grid_id) {
      // 2D grid
      if (!gridGroups.has(layout.grid_id)) {
        gridGroups.set(layout.grid_id, []);
      }
      gridGroups.get(layout.grid_id)!.push(block);
    } else if (layout?.row_id) {
      // 1D grid
      if (!rowGroups.has(layout.row_id)) {
        rowGroups.set(layout.row_id, []);
      }
      rowGroups.get(layout.row_id)!.push(block);
    }
  });
  
  // Repair 1D grid rows
  rowGroups.forEach((rowBlocks, rowId) => {
    console.log(`Repairing 1D grid row: ${rowId}`, { blocks: rowBlocks.length });
    
    // Sort by position
    rowBlocks.sort((a, b) => (a.meta?.layout?.position || 0) - (b.meta?.layout?.position || 0));
    
    // Validate and repair layout metadata
    rowBlocks.forEach((block, index) => {
      const layout = block.meta?.layout;
      if (layout) {
        layout.position = index;
        layout.columns = rowBlocks.length;
        
        // Ensure column widths are normalized
        if (layout.columnWidths && layout.columnWidths.length === rowBlocks.length) {
          layout.columnWidths = normalizePercentages(layout.columnWidths);
        } else {
          layout.columnWidths = Array(rowBlocks.length).fill(100 / rowBlocks.length);
        }
      }
    });
  });
  
  // Repair 2D grid groups
  gridGroups.forEach((gridBlocks, gridId) => {
    console.log(`Repairing 2D grid: ${gridId}`, { blocks: gridBlocks.length });
    
    // Find grid dimensions
    const positions = gridBlocks.map(b => b.meta?.layout?.grid_position).filter(Boolean);
    const maxRow = Math.max(...positions.map(p => p!.row)) + 1;
    const maxCol = Math.max(...positions.map(p => p!.column)) + 1;
    
    // Repair each block's grid metadata
    gridBlocks.forEach(block => {
      const layout = block.meta?.layout;
      if (layout) {
        layout.grid_rows = maxRow;
        layout.columns = maxCol;
        
        // Ensure column widths and row heights are normalized
        if (!layout.columnWidths || layout.columnWidths.length !== maxCol) {
          layout.columnWidths = Array(maxCol).fill(100 / maxCol);
        } else {
          layout.columnWidths = normalizePercentages(layout.columnWidths);
        }
        
        if (!layout.rowHeights || layout.rowHeights.length !== maxRow) {
          layout.rowHeights = Array(maxRow).fill(120);
        }
      }
    });
  });
  
  console.log('Grid metadata repair complete:', {
    totalBlocks: repairedBlocks.length,
    gridRows: rowGroups.size,
    grid2D: gridGroups.size
  });
  
  return repairedBlocks;
};

/**
 * Enhanced export with content normalization
 */
export const exportBlocks = (blocks: ReviewBlock[]): ExportData => {
  // Ensure all blocks have properly normalized content
  const exportBlocks = blocks.map(block => {
    const normalizedContent = normalizeBlockContent(block);
    return {
      ...block,
      content: normalizedContent,
      // Remove payload field if it exists for clean export
      payload: undefined
    };
  }).filter(block => block.content !== undefined);
  
  const gridBlocks = exportBlocks.filter(b => b.meta?.layout).length;
  
  return {
    version: '2.0.1',
    timestamp: new Date().toISOString(),
    blocks: exportBlocks,
    metadata: {
      totalBlocks: exportBlocks.length,
      gridBlocks,
      singleBlocks: exportBlocks.length - gridBlocks,
      exportSource: 'native-editor'
    }
  };
};

/**
 * Create default content for block types with comprehensive field mapping
 */
export const getDefaultBlockContent = (type: BlockType): any => {
  const defaults: Record<BlockType, any> = {
    paragraph: { text: 'Novo parágrafo', content: 'Novo parágrafo' },
    heading: { text: 'Novo Título', level: 2 },
    list: { items: ['Item 1', 'Item 2'], ordered: false },
    quote: { text: 'Nova citação', author: '' },
    code: { code: '// Código aqui', language: 'javascript' },
    divider: { style: 'solid', color: '#374151', thickness: 1 },
    figure: { 
      caption: 'Nova figura', 
      url: '', 
      src: '', 
      image_url: '', 
      alt: '', 
      alt_text: '',
      width: '100%'
    },
    callout: { 
      text: 'Nova caixa de destaque',
      content: 'Nova caixa de destaque',
      type: 'info',
      title: 'Destaque'
    },
    table: {
      headers: ['Coluna 1', 'Coluna 2'],
      rows: [['Dado 1', 'Dado 2']],
      table_data: {
        headers: ['Coluna 1', 'Coluna 2'],
        rows: [['Dado 1', 'Dado 2']],
        sortable: false,
        compact: false,
        striped: false,
        bordered: false
      }
    },
    citation_list: { 
      citations: [],
      title: 'Referências',
      description: '',
      show_abstract: false,
      show_keywords: false,
      group_by_type: false
    },
    poll: {
      question: 'Nova enquete',
      options: [
        { id: 'option-0', text: 'Opção 1', votes: 0 },
        { id: 'option-1', text: 'Opção 2', votes: 0 }
      ],
      description: '',
      poll_type: 'single_choice',
      poll_status: 'active'
    },
    reviewer_quote: {
      quote: 'Nova citação do revisor',
      text: 'Nova citação do revisor',
      author: 'Revisor',
      reviewer: 'Revisor',
      role: 'Especialista',
      rating: 5
    },
    snapshot_card: {
      title: 'Novo Snapshot',
      subtitle: 'Dados importantes',
      value: '0',
      population: '',
      intervention: '',
      comparison: '',
      outcome: '',
      design: '',
      finding_sections: [],
      custom_badges: []
    },
    number_card: {
      title: 'Novo Card Numérico',
      number: '0',
      value: '0',
      description: 'Descrição',
      trend: 'neutral'
    }
  };
  
  return defaults[type] || {};
};
