
# README‑BÍBLIA PERFORMANCE v3.3.0

## 8. Design Language
Material Design 3 with custom scientific journal styling. Dark theme default.

## 9. Accessibility Contract
WCAG 2.1 AA compliance with error boundary announcements and keyboard navigation.

## 10. Performance Budgets
- Initial bundle: <500KB (optimized with lazy loading)
- Memory usage: <100MB sustained
- Error recovery: <3s average
- API response: <100ms with caching
- **API requests per page load: <10** (CRITICAL - currently failing)

## 11. Security & Compliance
Row Level Security with performance optimization. Rate limiting on all endpoints.

## 12. Admin & Ops
Admin panel with performance monitoring dashboard and error tracking.

## 13. Analytics & KPIs
- Bundle load times and cache hit rates
- Memory usage patterns
- Error frequency and recovery success
- User engagement metrics
- **API request frequency monitoring** (NEW)

## 14. TODO / Backlog
**CRITICAL Priority:**
- Fix API request cascade on page load (hundreds of requests)
- Implement proper query batching
- Validate rate limiting effectiveness

**Phase 2 (Next):**
- Component refactoring for maintainability
- State management optimization
- Advanced caching strategies
