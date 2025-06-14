
// ABOUTME: API call middleware with proper type safety and error handling
interface ApiCallOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

export class ApiCallMiddleware {
  private static rateLimits = new Map<string, { count: number; reset: number }>();
  private static readonly RATE_LIMIT = 100; // requests per minute
  private static readonly RATE_WINDOW = 60 * 1000; // 1 minute in ms

  static async makeApiCall<T = any>(
    endpoint: string,
    options: ApiCallOptions = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Rate limiting check
      const rateLimitKey = `api_${endpoint}`;
      const now = Date.now();
      const rateLimit = this.rateLimits.get(rateLimitKey);

      if (rateLimit) {
        if (now < rateLimit.reset) {
          if (rateLimit.count >= this.RATE_LIMIT) {
            return {
              error: 'Rate limit exceeded',
              status: 429,
            };
          }
          rateLimit.count++;
        } else {
          // Reset window
          this.rateLimits.set(rateLimitKey, { count: 1, reset: now + this.RATE_WINDOW });
        }
      } else {
        this.rateLimits.set(rateLimitKey, { count: 1, reset: now + this.RATE_WINDOW });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout || 30000);

      const response = await fetch(endpoint, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          error: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        };
      }

      const data = await response.json();
      return {
        data,
        status: response.status,
      };
    } catch (error) {
      console.error('API call error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 500,
      };
    }
  }

  static async makeSupabaseCall<T = any>(
    tableName: string,
    operation: 'select' | 'insert' | 'update' | 'delete',
    options: any = {}
  ): Promise<ApiResponse<T>> {
    try {
      // This would be implemented with proper Supabase client calls
      // For now, return a placeholder structure
      return {
        data: [] as T,
        status: 200,
      };
    } catch (error) {
      console.error('Supabase call error:', error);
      return {
        error: error instanceof Error ? error.message : 'Database error',
        status: 500,
      };
    }
  }
}
