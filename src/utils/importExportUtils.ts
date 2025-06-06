
// ABOUTME: Enhanced import/export utilities with comprehensive format handling
// Handles data migration, validation, and grid metadata normalization

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
 * Validate import data structure
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
  
  // Validate each block
  data.blocks.forEach((block: any, index: number) => {
    if (!block.type) {
      errors.push(`Block ${index}: missing type field`);
    }
    
    if (!block.content && !block.payload) {
      errors.push(`Block ${index}: missing content/payload field`);
    }
    
    if (typeof block.sort_index !== 'number') {
      errors.push(`Block ${index}: invalid sort_index`);
    }
  });
  
  return { isValid: errors.length === 0, errors };
};

/**
 * Migrate legacy data formats to current structure
 */
export const migrateImportData = (data: any): ReviewBlock[] => {
  console.log('Starting data migration:', { version: data.version, blocksCount: data.blocks?.length });
  
  if (!data.blocks || !Array.isArray(data.blocks)) {
    throw new Error('Invalid blocks data');
  }
  
  const migratedBlocks: ReviewBlock[] = data.blocks.map((block: any, index: number) => {
    // Handle legacy payload field
    const content = block.content || block.payload || {};
    
    // Generate temporary ID if missing
    const id = block.id || -(Date.now() + Math.random() + index);
    
    // Migrate and validate layout metadata
    const meta = migrateBlockMeta(block.meta);
    
    const migratedBlock: ReviewBlock = {
      id,
      type: block.type as BlockType,
      content,
      sort_index: typeof block.sort_index === 'number' ? block.sort_index : index,
      visible: typeof block.visible === 'boolean' ? block.visible : true,
      meta,
      created_at: block.created_at || new Date().toISOString(),
      updated_at: block.updated_at || new Date().toISOString()
    };
    
    console.log(`Migrated block ${index}:`, {
      id: migratedBlock.id,
      type: migratedBlock.type,
      hasLayout: !!migratedBlock.meta?.layout,
      layoutType: migratedBlock.meta?.layout?.row_id ? '1D grid' : 
                  migratedBlock.meta?.layout?.grid_id ? '2D grid' : 'single'
    });
    
    return migratedBlock;
  });
  
  // Repair grid metadata after migration
  const repairedBlocks = repairGridMetadata(migratedBlocks);
  
  console.log('Migration complete:', {
    originalBlocks: data.blocks.length,
    migratedBlocks: repairedBlocks.length,
    gridBlocks: repairedBlocks.filter(b => b.meta?.layout).length
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
 * Export blocks to standard format
 */
export const exportBlocks = (blocks: ReviewBlock[]): ExportData => {
  // Ensure all blocks use the content field consistently
  const exportBlocks = blocks.map(block => ({
    ...block,
    content: block.content, // Ensure content field is used
    // Remove payload field if it exists for clean export
    payload: undefined
  })).filter(block => block.content !== undefined);
  
  const gridBlocks = exportBlocks.filter(b => b.meta?.layout).length;
  
  return {
    version: '2.0',
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
 * Create default content for block types
 */
export const getDefaultBlockContent = (type: BlockType): any => {
  const defaults: Record<BlockType, any> = {
    paragraph: { text: 'Novo parágrafo' },
    heading: { text: 'Novo Título', level: 2 },
    list: { items: ['Item 1', 'Item 2'], ordered: false },
    quote: { text: 'Nova citação', author: '' },
    code: { code: '// Código aqui', language: 'javascript' },
    divider: {},
    figure: { caption: 'Nova figura', image_url: '', alt_text: '' },
    callout: { 
      text: 'Nova caixa de destaque',
      type: 'info',
      title: 'Destaque'
    },
    table: {
      headers: ['Coluna 1', 'Coluna 2'],
      rows: [['Dado 1', 'Dado 2']]
    },
    citation_list: { citations: [] },
    poll: {
      question: 'Nova enquete',
      options: ['Opção 1', 'Opção 2'],
      poll_type: 'single_choice'
    },
    reviewer_quote: {
      quote: 'Nova citação do revisor',
      author: 'Revisor',
      role: 'Especialista'
    },
    snapshot_card: {
      title: 'Novo Snapshot',
      subtitle: 'Dados importantes',
      value: '0',
      evidence_level: 'moderate'
    },
    number_card: {
      title: 'Novo Card Numérico',
      number: '0',
      description: 'Descrição',
      trend: 'neutral'
    }
  };
  
  return defaults[type] || {};
};
