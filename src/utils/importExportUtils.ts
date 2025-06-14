
// ABOUTME: Import/export utilities for review blocks with proper type handling
import { ReviewBlock, BlockType } from '@/types/review';

interface ImportResult {
  success: boolean;
  message: string;
  blocks?: ReviewBlock[];
}

interface ExportOptions {
  includeIds?: boolean;
  prettyPrint?: boolean;
}

export interface ExportData {
  blocks: ReviewBlock[];
  metadata: {
    exportedAt: string;
    version: string;
    totalBlocks: number;
  };
}

// Helper function to generate a unique ID
const generateId = (): string => {
  return crypto.randomUUID();
};

// Helper function to validate JSON
const isValidJSON = (jsonString: string): boolean => {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (error) {
    return false;
  }
};

// Fix the ReviewBlock creation to match the interface
export const createReviewBlockFromImport = (blockData: any, sortIndex: number): ReviewBlock => {
  return {
    id: blockData.id || crypto.randomUUID(),
    type: blockData.type as BlockType,
    content: blockData.content || blockData.payload,
    sort_index: sortIndex,
    visible: blockData.visible !== false,
    meta: blockData.meta || {}
  };
};

// Function to import review blocks from a JSON string
export const importReviewBlocks = (jsonString: string): ImportResult => {
  if (!isValidJSON(jsonString)) {
    return {
      success: false,
      message: 'Invalid JSON format.',
    };
  }

  try {
    const data = JSON.parse(jsonString);

    if (!Array.isArray(data)) {
      return {
        success: false,
        message: 'JSON data must be an array of review blocks.',
      };
    }

    const blocks: ReviewBlock[] = data.map((blockData, index) => {
      return {
        id: blockData.id || generateId(),
        type: blockData.type as BlockType,
        content: blockData.content || blockData.payload,
        sort_index: index,
        visible: blockData.visible !== false,
        meta: blockData.meta || {}
      };
    });

    return {
      success: true,
      message: `Successfully imported ${blocks.length} review blocks.`,
      blocks: blocks,
    };
  } catch (error: any) {
    console.error('Import error:', error);
    return {
      success: false,
      message: `Import failed: ${error.message || 'Unknown error'}.`,
    };
  }
};

// Function to export review blocks to a JSON string
export const exportReviewBlocks = (blocks: ReviewBlock[], options: ExportOptions = {}): string => {
  const { includeIds = true, prettyPrint = true } = options;

  const exportedBlocks = blocks.map(block => {
    const exportedBlock: any = {
      type: block.type,
      content: block.content,
      sort_index: block.sort_index,
      visible: block.visible,
      meta: block.meta || {}
    };

    if (includeIds) {
      exportedBlock.id = block.id;
    }

    return exportedBlock;
  });

  return prettyPrint ? JSON.stringify(exportedBlocks, null, 2) : JSON.stringify(exportedBlocks);
};

// Export blocks with metadata
export const exportBlocks = (blocks: ReviewBlock[], options: ExportOptions = {}): ExportData => {
  return {
    blocks,
    metadata: {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      totalBlocks: blocks.length
    }
  };
};

// Validate import data
export const validateImportData = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!Array.isArray(data)) {
    errors.push('Data must be an array');
    return { valid: false, errors };
  }

  data.forEach((block, index) => {
    if (!block.type) {
      errors.push(`Block ${index}: Missing type`);
    }
    if (block.content === undefined) {
      errors.push(`Block ${index}: Missing content`);
    }
  });

  return { valid: errors.length === 0, errors };
};

// Migrate import data to current format
export const migrateImportData = (data: any): ReviewBlock[] => {
  if (!Array.isArray(data)) return [];
  
  return data.map((blockData, index) => createReviewBlockFromImport(blockData, index));
};

// Fix the block type defaults to include all required BlockType values
const BLOCK_TYPE_DEFAULTS: Record<BlockType, any> = {
  text: { content: '' },
  paragraph: { text: '', content: '' },
  heading: { text: '', level: 1 },
  image: { url: '', alt: '', caption: '' },
  video: { url: '', thumbnail: '', title: '' },
  quote: { text: '', author: '' },
  list: { items: [], ordered: false },
  code: { code: '', language: 'javascript' },
  table: { headers: [], rows: [] },
  divider: {},
  callout: { type: 'info', title: '', content: '' },
  embed: { url: '', type: 'iframe' },
  poll: { question: '', options: [], votes: {} },
  chart: { type: 'bar', data: [], labels: [] },
  audio: { url: '', title: '', duration: 0 },
  file: { url: '', name: '', size: 0 },
  gallery: { images: [] },
  timeline: { events: [] },
  comparison: { items: [] },
  accordion: { sections: [] },
  tabs: { tabs: [] },
  figure: { imageUrl: '', caption: '' },
  number_card: { title: '', value: '', description: '' },
  reviewer_quote: { quote: '', author: '', role: '' },
  citation_list: { citations: [] },
  snapshot_card: { title: '', metrics: [] },
  diagram: { 
    title: '', 
    nodes: [], 
    connections: [], 
    canvas: { 
      width: 800, 
      height: 600, 
      backgroundColor: '#ffffff',
      gridEnabled: true,
      gridSize: 20,
      gridColor: '#f0f0f0',
      snapToGrid: true
    } 
  }
};

// Function to create a default block of a given type
export const createDefaultBlock = (type: BlockType): ReviewBlock => {
  const defaultContent = BLOCK_TYPE_DEFAULTS[type] || {};
  return {
    id: generateId(),
    type: type,
    content: defaultContent,
    sort_index: 0,
    visible: true,
    meta: {}
  };
};
