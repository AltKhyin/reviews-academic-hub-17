
// ABOUTME: Shared grid layout calculation utilities
// Provides consistent column width calculations and grid rendering logic

export interface GridColumnConfig {
  widths: number[];
  totalColumns: number;
  gap: number;
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
 * Generate CSS styles for grid container
 */
export const generateGridContainerStyles = (
  columns: number,
  gap: number,
  columnWidths?: number[]
): React.CSSProperties => {
  return {
    display: 'grid',
    gridTemplateColumns: calculateGridTemplateColumns(columnWidths, columns),
    gap: calculateGridGap(gap),
    alignItems: 'start'
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
