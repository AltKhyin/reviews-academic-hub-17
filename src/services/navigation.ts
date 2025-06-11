
// ABOUTME: Centralized navigation service with consistent routing patterns
export interface ArchiveFilters {
  specialty?: string;
  year?: string;
  search?: string;
  featured?: boolean;
  page?: number;
}

export class NavigationService {
  static getIssueUrl(id: string): string {
    return `/review/${encodeURIComponent(id)}`;
  }

  static getArchiveUrl(filters?: ArchiveFilters): string {
    const params = new URLSearchParams();
    
    if (filters?.specialty) params.set('specialty', filters.specialty);
    if (filters?.year) params.set('year', filters.year);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.featured !== undefined) params.set('featured', filters.featured.toString());
    if (filters?.page && filters.page > 1) params.set('page', filters.page.toString());

    const query = params.toString();
    return query ? `/acervo?${query}` : '/acervo';
  }

  static getSearchUrl(query?: string): string {
    return query ? `/search?q=${encodeURIComponent(query)}` : '/search';
  }

  static getCommunityUrl(): string {
    return '/community';
  }

  static getProfileUrl(): string {
    return '/profile';
  }

  static getHomepageUrl(): string {
    return '/';
  }

  static parseArchiveFilters(searchParams: URLSearchParams): ArchiveFilters {
    const filters: ArchiveFilters = {};
    
    const specialty = searchParams.get('specialty');
    if (specialty) filters.specialty = specialty;
    
    const year = searchParams.get('year');
    if (year) filters.year = year;
    
    const search = searchParams.get('search');
    if (search) filters.search = search;
    
    const featured = searchParams.get('featured');
    if (featured !== null) filters.featured = featured === 'true';
    
    const page = searchParams.get('page');
    if (page) filters.page = parseInt(page, 10);
    
    return filters;
  }
}
