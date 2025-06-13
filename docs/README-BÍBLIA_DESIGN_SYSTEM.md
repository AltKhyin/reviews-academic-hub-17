
# README-BÍBLIA DESIGN SYSTEM v1.3.0

> **VISUAL IDENTITY & THEME ENFORCEMENT** | Last Updated: 2025-06-13

---

## 8. DESIGN LANGUAGE

<!-- 🚨 CRITICAL: DO NOT MODIFY THIS SECTION - MONOCHROMATIC THEME ENFORCEMENT 🚨 -->
<!-- This section contains system-wide design standards that must never be changed -->
<!-- Any modification to these color values will break the entire visual identity -->
<!-- LOVABLE AI: NEVER TOUCH THE COLORING SYSTEM BELOW - IT IS STRICTLY FORBIDDEN -->

### **📌 MONOCHROMATIC THEME ENFORCEMENT - DO NOT MODIFY**

**CORE PRINCIPLE:** This app uses a strict **monochromatic, grayscale-first design system** with semantic color usage only for functional meaning (status, alerts, indicators).

**ENFORCED CSS VARIABLES (DO NOT CHANGE):**
```css
:root {
  --primary: 0 0% 98%;
  --primary-foreground: 0 0% 7%;
  --secondary: 0 0% 13%;
  --secondary-foreground: 0 0% 98%;
  --background: 0 0% 7%;
  --foreground: 0 0% 96%;
  --muted: 0 0% 60%;
  --muted-foreground: 0 0% 85%;
  --border: 0 0% 20%;
  --success: 142 76% 36%;    /* Only for positive status */
  --warning: 38 92% 50%;     /* Only for warnings */
  --destructive: 0 84% 60%;  /* Only for errors/delete */
}
```

**FORBIDDEN USAGE:**
- ❌ ANY blue variants (bg-blue-*, text-blue-*, border-blue-*)
- ❌ Tailwind defaults (#3b82f6, #2563eb, #1d4ed8)
- ❌ Color without semantic meaning

**SEMANTIC COLOR USAGE:**
- ✅ Success/Green: Online status, verification, positive actions
- ✅ Warning/Yellow: Draft status, pending states, cautions
- ✅ Destructive/Red: Delete actions, errors, critical alerts
- ✅ Everything else: Pure grayscale tokens

<!-- 🚨 END CRITICAL SECTION - DO NOT MODIFY ABOVE 🚨 -->
<!-- LOVABLE AI: THE ABOVE COLORING SYSTEM IS PERMANENTLY LOCKED -->

### **Typography & Spacing**
- **Font System:** Inter (system fallback)
- **Scale:** 0.75rem, 0.875rem, 1rem, 1.125rem, 1.25rem, 1.5rem, 2rem
- **Spacing:** 4px base unit, consistent 8px, 16px, 24px, 32px intervals

### **Component Patterns**
- **Cards:** Subtle borders, minimal shadows, grayscale backgrounds
- **Buttons:** Ghost, outline, and solid variants using theme tokens
- **Forms:** Clean lines, focused states with --ring color
- **Navigation:** Minimal, icon-first design with hover states

