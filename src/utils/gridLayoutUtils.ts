
// ABOUTME: Enhanced grid layout utilities with comprehensive alignment support
// Provides consistent column width calculations and grid rendering logic

export interface GridColumnConfig {
  widths: number[];
  totalColumns: number;
  gap: number;
}

export interface GridLayoutConfig {
  columns: number;
  gap: number;
  columnWidths?: number[];
  verticalAlignment?: 'top' | 'center' | 'bottom';
}

/**
 * Calculate CSS grid template columns from column widths
 */
export const calculateGridTemplateColumns = (
  columnWidths?: number[],
  columns: number = 1
): string => {
  if (columnWidths && columnWidths.length === columns) {
    // Use custom widths as percentages
    return columnWidths.map(width => `${width}%`).join(' ');
  }
  
  // Default to equal distribution
  return `repeat(${columns}, 1fr)`;
};

/**
 * Calculate CSS gap value from numeric gap
 */
export const calculateGridGap = (gap: number = 4): string => {
  return `${gap * 0.25}rem`; // Convert from Tailwind spacing units
};

/**
 * Normalize column widths to ensure they sum to 100%
 */
export const normalizeColumnWidths = (widths: number[]): number[] => {
  const total = widths.reduce((sum, width) => sum + width, 0);
  
  if (total === 0) {
    // All widths are 0, distribute equally
    return widths.map(() => 100 / widths.length);
  }
  
  if (Math.abs(total - 100) < 0.1) {
    // Already normalized (within tolerance)
    return widths;
  }
  
  // Normalize to sum to 100%
  return widths.map(width => (width / total) * 100);
};

/**
 * Convert panel sizes from react-resizable-panels to column widths
 */
export const panelSizesToColumnWidths = (sizes: number[]): number[] => {
  return normalizeColumnWidths(sizes);
};

/**
 * Convert column widths to panel sizes for react-resizable-panels
 */
export const columnWidthsToPanelSizes = (
  columnWidths?: number[],
  columns: number = 1
): number[] => {
  if (columnWidths && columnWidths.length === columns) {
    return normalizeColumnWidths(columnWidths);
  }
  
  // Default equal distribution
  return Array(columns).fill(100 / columns);
};

/**
 * Generate CSS styles for grid container with alignment support
 */
export const generateGridContainerStyles = (
  columns: number,
  gap: number,
  columnWidths?: number[],
  verticalAlignment: 'top' | 'center' | 'bottom' = 'top'
): React.CSSProperties => {
  const alignItems = verticalAlignment === 'center' ? 'center' :
                    verticalAlignment === 'bottom' ? 'end' : 'start';

  return {
    display: 'grid',
    gridTemplateColumns: calculateGridTemplateColumns(columnWidths, columns),
    gap: calculateGridGap(gap),
    alignItems,
    width: '100%',
    minHeight: 'fit-content'
  };
};

/**
 * Generate CSS styles for grid items with individual alignment
 */
export const generateGridItemStyles = (
  verticalAlignment: 'top' | 'center' | 'bottom' = 'top'
): React.CSSProperties => {
  return {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: verticalAlignment === 'center' ? 'center' :
                   verticalAlignment === 'bottom' ? 'flex-end' : 'flex-start',
    alignItems: 'stretch',
    height: '100%',
    minHeight: 'fit-content'
  };
};

/**
 * Validate grid configuration
 */
export const validateGridConfig = (config: Partial<GridColumnConfig>): boolean => {
  if (config.totalColumns && config.totalColumns < 1) return false;
  if (config.widths && config.totalColumns && config.widths.length !== config.totalColumns) return false;
  if (config.gap && config.gap < 0) return false;
  
  return true;
};

/**
 * Create layout configuration for grid blocks
 */
export const createGridLayoutConfig = (
  columns: number,
  gap: number = 4,
  columnWidths?: number[]
): GridLayoutConfig => {
  return {
    columns,
    gap,
    columnWidths: columnWidths ? normalizeColumnWidths(columnWidths) : undefined
  };
};

/**
 * Extract grid configuration from block metadata
 */
export const extractGridConfigFromBlock = (blockMeta: any): GridLayoutConfig | null => {
  const layout = blockMeta?.layout;
  if (!layout) return null;

  return {
    columns: layout.columns || 1,
    gap: layout.gap || 4,
    columnWidths: layout.columnWidths,
    verticalAlignment: blockMeta?.alignment?.vertical || 'top'
  };
};

/**
 * Check if blocks belong to the same grid row
 */
export const blocksInSameRow = (block1: any, block2: any): boolean => {
  const rowId1 = block1.meta?.layout?.row_id;
  const rowId2 = block2.meta?.layout?.row_id;
  
  return rowId1 && rowId2 && rowId1 === rowId2;
};

/**
 * Generate unique row ID for grid blocks
 */
export const generateRowId = (): string => {
  return `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
