
// ABOUTME: Edition formatting utilities to handle edition display consistently
// Extracts edition from tag-like format and provides formatting functions

export const formatEdition = (editionString: string): string => {
  if (!editionString) return '';
  
  // Handle tag-like format [tag:Edition #015]
  const tagMatch = editionString.match(/\[tag:([^\]]+)\]/g);
  if (tagMatch) {
    return tagMatch
      .map(tag => tag.replace(/\[tag:([^\]]+)\]/, '$1'))
      .join(', ');
  }
  
  // Return as-is if not in tag format
  return editionString;
};

export const parseEditionToTags = (editionString: string): string => {
  if (!editionString) return '';
  
  // If already in tag format, return as-is
  if (editionString.includes('[tag:')) {
    return editionString;
  }
  
  // Convert simple string to tag format
  return `[tag:${editionString}]`;
};

export const getEditionDisplay = (issue: { edition?: string | null; specialty?: string }): string => {
  if (issue.edition) {
    return formatEdition(issue.edition);
  }
  
  // Fallback to specialty for backward compatibility during transition
  if (issue.specialty) {
    return issue.specialty;
  }
  
  return 'Edição não definida';
};
