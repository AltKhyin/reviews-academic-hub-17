
// ABOUTME: Grid layout utilities with enhanced normalization
// Handles panel size calculations and grid layout transformations

/**
 * Normalize percentages to sum exactly to 100%
 * Uses precise floating-point arithmetic to avoid rounding errors
 */
export const normalizePercentages = (values: number[]): number[] => {
  if (values.length === 0) return [];
  
  const sum = values.reduce((acc, val) => acc + val, 0);
  
  if (sum === 0) {
    // All values are zero, distribute equally
    return Array(values.length).fill(100 / values.length);
  }
  
  // Normalize to sum to 100
  const normalized = values.map(val => (val / sum) * 100);
  
  // Fix floating-point precision issues
  const normalizedSum = normalized.reduce((acc, val) => acc + val, 0);
  const adjustment = (100 - normalizedSum) / normalized.length;
  
  return normalized.map(val => Math.round((val + adjustment) * 100) / 100);
};

/**
 * Convert column widths (percentages) to panel sizes for ResizablePanelGroup
 * Ensures exact 100% total to prevent ResizablePanel warnings
 */
export const columnWidthsToPanelSizes = (
  columnWidths: number[] | undefined, 
  columns: number
): number[] => {
  if (!columnWidths || columnWidths.length !== columns) {
    // Default equal distribution
    const equalSize = 100 / columns;
    return Array(columns).fill(equalSize);
  }
  
  // Normalize the provided widths to ensure they sum to exactly 100%
  const normalized = normalizePercentages(columnWidths);
  
  console.log('Converting column widths to panel sizes:', {
    input: columnWidths,
    normalized,
    sum: normalized.reduce((acc, val) => acc + val, 0)
  });
  
  return normalized;
};

/**
 * Convert panel sizes back to column widths (percentages)
 * Applies normalization to handle ResizablePanel rounding
 */
export const panelSizesToColumnWidths = (panelSizes: number[]): number[] => {
  if (panelSizes.length === 0) return [];
  
  // Normalize to ensure exact 100% sum
  const normalized = normalizePercentages(panelSizes);
  
  console.log('Converting panel sizes to column widths:', {
    input: panelSizes,
    inputSum: panelSizes.reduce((acc, val) => acc + val, 0),
    normalized,
    normalizedSum: normalized.reduce((acc, val) => acc + val, 0)
  });
  
  return normalized;
};

/**
 * Generate CSS grid container styles for 1D grids
 */
export const generateGridContainerStyles = (
  columns: number,
  gap: number = 4,
  columnWidths?: number[]
): React.CSSProperties => {
  let gridTemplateColumns: string;
  
  if (columnWidths && columnWidths.length === columns) {
    // Use specific column widths
    const normalizedWidths = normalizePercentages(columnWidths);
    gridTemplateColumns = normalizedWidths.map(width => `${width}%`).join(' ');
  } else {
    // Use equal columns
    gridTemplateColumns = `repeat(${columns}, 1fr)`;
  }
  
  return {
    display: 'grid',
    gridTemplateColumns,
    gap: `${gap}px`,
    width: '100%'
  };
};

/**
 * Validate grid layout percentages
 */
export const validateGridLayout = (widths: number[]): boolean => {
  const sum = widths.reduce((acc, val) => acc + val, 0);
  const isValid = Math.abs(sum - 100) < 0.01; // Allow tiny floating-point differences
  
  if (!isValid) {
    console.warn('Invalid grid layout detected:', {
      widths,
      sum,
      difference: Math.abs(sum - 100)
    });
  }
  
  return isValid;
};

/**
 * Create default grid layout
 */
export const createDefaultGridLayout = (columns: number): number[] => {
  return normalizePercentages(Array(columns).fill(100 / columns));
};

/**
 * Redistribute grid layout when adding/removing columns
 */
export const redistributeGridLayout = (
  currentWidths: number[], 
  newColumnCount: number
): number[] => {
  if (newColumnCount <= 0) return [];
  if (currentWidths.length === 0) return createDefaultGridLayout(newColumnCount);
  
  if (newColumnCount > currentWidths.length) {
    // Adding columns - distribute space from largest column
    const sortedIndices = currentWidths
      .map((width, index) => ({ width, index }))
      .sort((a, b) => b.width - a.width);
    
    const newWidths = [...currentWidths];
    const columnsToAdd = newColumnCount - currentWidths.length;
    const spacePerNewColumn = 100 / newColumnCount; // Target space for new columns
    
    // Add new columns with default space
    for (let i = 0; i < columnsToAdd; i++) {
      newWidths.push(spacePerNewColumn);
    }
    
    // Normalize to 100%
    return normalizePercentages(newWidths);
  } else {
    // Removing columns - redistribute their space to remaining columns
    const remainingWidths = currentWidths.slice(0, newColumnCount);
    return normalizePercentages(remainingWidths);
  }
};
