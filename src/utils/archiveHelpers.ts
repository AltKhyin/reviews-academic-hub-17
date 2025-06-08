
// ABOUTME: Helper functions for archive data conversion and processing
import { Issue } from '@/types/issue';
import { ArchiveIssue } from '@/types/archive';

export const convertIssueToArchiveIssue = (issue: Issue): ArchiveIssue => {
  return {
    id: issue.id,
    title: issue.title,
    authors: issue.authors || '',
    description: issue.description || '',
    specialty: issue.specialty,
    backend_tags: issue.backend_tags || '',
    published_at: issue.published_at || issue.created_at,
    created_at: issue.created_at,
    score: issue.score || 0,
    cover_image_url: issue.cover_image_url || '',
    pdf_url: issue.pdf_url,
    year: issue.year || '',
    design: issue.design || '',
    population: issue.population || '',
    search_title: issue.search_title || '',
    search_description: issue.search_description || '',
    featured: issue.featured || false,
  };
};

export const convertIssuesToArchiveIssues = (issues: Issue[]): ArchiveIssue[] => {
  return issues.map(convertIssueToArchiveIssue);
};
