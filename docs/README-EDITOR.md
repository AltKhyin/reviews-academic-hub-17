
# AI Review Block System - JSON Import Guide

## PURPOSE
This document serves as a focused guide for AI systems to convert plain text reviews into properly formatted JSON structures for direct import into the native review editor. The editor supports rich block-based content with precise formatting control.

## OVERVIEW
The native review editor uses a block-based system where each content element is a discrete block with specific properties. Blocks are rendered sequentially and support advanced layout, styling, and interactive features.

## CORE BLOCK STRUCTURE
Every block follows this fundamental JSON schema:

```json
{
  "type": "block_type",
  "content": {
    // Block-specific content object
  },
  "sort_index": 0,
  "visible": true,
  "meta": {
    "layout": {
      // Layout and styling metadata
    },
    "alignment": {
      "horizontal": "left|center|right",
      "vertical": "top|center|bottom"
    },
    "spacing": {
      "margin": { "top": 0, "right": 0, "bottom": 16, "left": 0 },
      "padding": { "top": 0, "right": 0, "bottom": 0, "left": 0 }
    },
    "styles": {
      "backgroundColor": "",
      "textColor": "",
      "borderColor": "",
      "borderWidth": 0,
      "borderStyle": "solid",
      "borderRadius": 0
    }
  }
}
```

## SUPPORTED BLOCK TYPES

### 1. PARAGRAPH BLOCK
**Purpose**: Standard text content with rich formatting support
```json
{
  "type": "paragraph",
  "content": {
    "text": "Your paragraph content here. Supports <strong>bold</strong>, <em>italic</em>, and <u>underline</u> formatting.",
    "fontSize": 16,
    "lineHeight": 1.6,
    "textAlign": "left"
  },
  "sort_index": 0,
  "visible": true,
  "meta": {
    "spacing": {
      "margin": { "top": 0, "right": 0, "bottom": 16, "left": 0 }
    }
  }
}
```

### 2. HEADING BLOCK
**Purpose**: Section titles and hierarchy
```json
{
  "type": "heading",
  "content": {
    "text": "Section Title",
    "level": 2,
    "fontSize": 24,
    "fontWeight": "600",
    "textAlign": "left"
  },
  "sort_index": 1,
  "visible": true,
  "meta": {
    "spacing": {
      "margin": { "top": 32, "right": 0, "bottom": 16, "left": 0 }
    }
  }
}
```

### 3. LIST BLOCK
**Purpose**: Ordered or unordered lists
```json
{
  "type": "list",
  "content": {
    "listType": "unordered",
    "items": [
      "First item",
      "Second item with <strong>formatting</strong>",
      "Third item"
    ],
    "style": "bullet",
    "indent": 0
  },
  "sort_index": 2,
  "visible": true,
  "meta": {
    "spacing": {
      "margin": { "top": 0, "right": 0, "bottom": 16, "left": 20 }
    }
  }
}
```

### 4. QUOTE BLOCK
**Purpose**: Highlighted quotations or citations
```json
{
  "type": "quote",
  "content": {
    "text": "This is a quoted text that needs emphasis.",
    "author": "Study Author et al.",
    "source": "Journal Name, 2024",
    "style": "blockquote"
  },
  "sort_index": 3,
  "visible": true,
  "meta": {
    "styles": {
      "backgroundColor": "#1a1a1a",
      "borderColor": "#3b82f6",
      "borderWidth": 2,
      "borderStyle": "solid"
    },
    "spacing": {
      "margin": { "top": 24, "right": 0, "bottom": 24, "left": 0 },
      "padding": { "top": 16, "right": 20, "bottom": 16, "left": 20 }
    }
  }
}
```

### 5. FIGURE BLOCK
**Purpose**: Images with captions and metadata
```json
{
  "type": "figure",
  "content": {
    "imageUrl": "https://example.com/image.jpg",
    "caption": "Figure 1: Description of the image content",
    "altText": "Descriptive alt text for accessibility",
    "width": "100%",
    "height": "auto",
    "aspectRatio": "16:9"
  },
  "sort_index": 4,
  "visible": true,
  "meta": {
    "alignment": {
      "horizontal": "center"
    },
    "spacing": {
      "margin": { "top": 24, "right": 0, "bottom": 24, "left": 0 }
    }
  }
}
```

### 6. TABLE BLOCK
**Purpose**: Structured tabular data
```json
{
  "type": "table",
  "content": {
    "headers": ["Study", "Sample Size", "Outcome", "Effect Size"],
    "rows": [
      ["Smith et al. 2023", "150", "Positive", "0.65"],
      ["Jones et al. 2024", "200", "Negative", "-0.23"]
    ],
    "caption": "Table 1: Study outcomes summary",
    "striped": true,
    "bordered": true
  },
  "sort_index": 5,
  "visible": true,
  "meta": {
    "spacing": {
      "margin": { "top": 24, "right": 0, "bottom": 24, "left": 0 }
    }
  }
}
```

### 7. CALLOUT BLOCK
**Purpose**: Highlighted information boxes
```json
{
  "type": "callout",
  "content": {
    "title": "Important Note",
    "text": "This is critical information that readers should pay attention to.",
    "variant": "info",
    "icon": "info-circle"
  },
  "sort_index": 6,
  "visible": true,
  "meta": {
    "styles": {
      "backgroundColor": "#1e40af",
      "textColor": "#ffffff",
      "borderRadius": 8
    },
    "spacing": {
      "margin": { "top": 24, "right": 0, "bottom": 24, "left": 0 },
      "padding": { "top": 16, "right": 16, "bottom": 16, "left": 16 }
    }
  }
}
```

### 8. SNAPSHOT_CARD BLOCK
**Purpose**: Evidence summary cards for clinical reviews
```json
{
  "type": "snapshot_card",
  "content": {
    "title": "Intervention Effectiveness",
    "subtitle": "Primary Outcome Analysis",
    "value": "Moderate Effect",
    "change": "+15%",
    "trend": "up",
    "evidence_level": "moderate",
    "recommendation_strength": "conditional",
    "population": "Adults with Type 2 Diabetes",
    "intervention": "Metformin 500mg BID",
    "comparison": "Placebo",
    "outcome": "HbA1c reduction",
    "design": "Randomized Controlled Trial",
    "key_findings": [
      "Significant reduction in HbA1c (p<0.05)",
      "No serious adverse events",
      "High patient compliance (94%)"
    ]
  },
  "sort_index": 7,
  "visible": true,
  "meta": {
    "styles": {
      "backgroundColor": "#1a1a1a",
      "borderColor": "#22c55e",
      "borderWidth": 1,
      "borderRadius": 12
    },
    "spacing": {
      "margin": { "top": 24, "right": 0, "bottom": 24, "left": 0 },
      "padding": { "top": 20, "right": 20, "bottom": 20, "left": 20 }
    }
  }
}
```

### 9. NUMBER_CARD BLOCK
**Purpose**: Statistical highlights and key metrics
```json
{
  "type": "number_card",
  "content": {
    "title": "Sample Size",
    "number": "1,247",
    "unit": "participants",
    "description": "Total enrolled across 12 centers",
    "trend": "up",
    "change": "+23%",
    "color": "blue"
  },
  "sort_index": 8,
  "visible": true,
  "meta": {
    "alignment": {
      "horizontal": "center"
    },
    "spacing": {
      "margin": { "top": 16, "right": 0, "bottom": 16, "left": 0 }
    }
  }
}
```

### 10. CITATION_LIST BLOCK
**Purpose**: Reference lists and bibliographies
```json
{
  "type": "citation_list",
  "content": {
    "title": "References",
    "citations": [
      {
        "id": "ref1",
        "authors": "Smith, J., Doe, A., & Johnson, M.",
        "title": "Efficacy of intervention in clinical populations",
        "journal": "Journal of Medical Research",
        "year": "2024",
        "volume": "45",
        "issue": "3",
        "pages": "123-145",
        "doi": "10.1000/xyz123"
      }
    ],
    "style": "apa"
  },
  "sort_index": 9,
  "visible": true,
  "meta": {
    "spacing": {
      "margin": { "top": 32, "right": 0, "bottom": 0, "left": 0 }
    }
  }
}
```

### 11. POLL BLOCK
**Purpose**: Interactive voting elements
```json
{
  "type": "poll",
  "content": {
    "question": "What is your assessment of this intervention?",
    "options": [
      "Highly effective",
      "Moderately effective", 
      "Minimally effective",
      "Not effective"
    ],
    "poll_type": "single_choice",
    "allow_multiple": false
  },
  "sort_index": 10,
  "visible": true,
  "meta": {
    "styles": {
      "backgroundColor": "#1a1a1a",
      "borderColor": "#374151",
      "borderWidth": 1,
      "borderRadius": 8
    },
    "spacing": {
      "margin": { "top": 24, "right": 0, "bottom": 24, "left": 0 },
      "padding": { "top": 16, "right": 16, "bottom": 16, "left": 16 }
    }
  }
}
```

### 12. REVIEWER_QUOTE BLOCK
**Purpose**: Expert commentary and reviewer insights
```json
{
  "type": "reviewer_quote",
  "content": {
    "quote": "This study represents a significant advancement in the field with robust methodology and clear clinical implications.",
    "reviewer_name": "Dr. Sarah Wilson",
    "reviewer_title": "Professor of Clinical Medicine",
    "reviewer_affiliation": "Harvard Medical School",
    "reviewer_avatar": "https://example.com/avatar.jpg",
    "rating": 4,
    "specialty": "Endocrinology"
  },
  "sort_index": 11,
  "visible": true,
  "meta": {
    "styles": {
      "backgroundColor": "#0f172a",
      "borderColor": "#1e40af",
      "borderWidth": 2,
      "borderRadius": 12
    },
    "spacing": {
      "margin": { "top": 32, "right": 0, "bottom": 32, "left": 0 },
      "padding": { "top": 20, "right": 20, "bottom": 20, "left": 20 }
    }
  }
}
```

### 13. DIAGRAM BLOCK
**Purpose**: Scientific diagrams and flowcharts
```json
{
  "type": "diagram",
  "content": {
    "title": "Study Selection Process",
    "description": "CONSORT flow diagram showing participant selection",
    "canvas": {
      "width": 800,
      "height": 600,
      "backgroundColor": "#ffffff",
      "gridEnabled": true,
      "gridSize": 20,
      "gridColor": "#e5e7eb",
      "snapToGrid": true
    },
    "nodes": [
      {
        "id": "node1",
        "type": "rectangle",
        "position": { "x": 100, "y": 50 },
        "size": { "width": 200, "height": 80 },
        "text": "Initial Assessment\n(n=1,500)",
        "style": {
          "backgroundColor": "#3b82f6",
          "borderColor": "#1e40af",
          "textColor": "#ffffff",
          "borderWidth": 2,
          "borderStyle": "solid",
          "borderRadius": 8,
          "fontSize": 14,
          "fontWeight": "normal",
          "textAlign": "center",
          "opacity": 1
        }
      }
    ],
    "connections": [
      {
        "id": "conn1",
        "sourceNodeId": "node1",
        "targetNodeId": "node2",
        "sourcePoint": "bottom",
        "targetPoint": "top",
        "style": {
          "strokeColor": "#374151",
          "strokeWidth": 2,
          "strokeStyle": "solid",
          "arrowType": "arrow",
          "curved": false,
          "opacity": 1
        }
      }
    ],
    "exportSettings": {
      "format": "svg",
      "quality": 1,
      "transparentBackground": false
    },
    "accessibility": {
      "altText": "Study selection flowchart showing progression from initial assessment to final analysis",
      "longDescription": "Detailed description of the study selection process..."
    }
  },
  "sort_index": 12,
  "visible": true,
  "meta": {
    "alignment": {
      "horizontal": "center"
    },
    "spacing": {
      "margin": { "top": 32, "right": 0, "bottom": 32, "left": 0 }
    }
  }
}
```

### 14. DIVIDER BLOCK
**Purpose**: Visual separation between sections
```json
{
  "type": "divider",
  "content": {
    "style": "solid",
    "width": "100%",
    "thickness": 1,
    "color": "#374151",
    "spacing": "normal"
  },
  "sort_index": 13,
  "visible": true,
  "meta": {
    "spacing": {
      "margin": { "top": 24, "right": 0, "bottom": 24, "left": 0 }
    }
  }
}
```

### 15. CODE BLOCK
**Purpose**: Code snippets and technical content
```json
{
  "type": "code",
  "content": {
    "code": "SELECT * FROM studies WHERE methodology = 'RCT';",
    "language": "sql",
    "theme": "dark",
    "showLineNumbers": true,
    "highlightLines": [1],
    "caption": "SQL query for selecting randomized controlled trials"
  },
  "sort_index": 14,
  "visible": true,
  "meta": {
    "styles": {
      "backgroundColor": "#0f172a",
      "borderColor": "#374151",
      "borderWidth": 1,
      "borderRadius": 6
    },
    "spacing": {
      "margin": { "top": 16, "right": 0, "bottom": 16, "left": 0 },
      "padding": { "top": 12, "right": 12, "bottom": 12, "left": 12 }
    }
  }
}
```

## COMPLETE JSON IMPORT STRUCTURE

When importing a complete review, use this outer structure:

```json
{
  "issue": {
    "title": "Review Title",
    "description": "Brief description of the review content",
    "authors": "Author Name(s)",
    "specialty": "Medical Specialty",
    "year": 2024,
    "review_type": "native"
  },
  "blocks": [
    // Array of block objects following the schemas above
    // Each block must have incremental sort_index values
  ]
}
```

## FORMATTING GUIDELINES FOR AI

1. **Sort Index**: Always increment by 1 for each block (0, 1, 2, 3...)
2. **Spacing**: Use consistent 16px bottom margins for most blocks, 24-32px for major sections
3. **Colors**: Use the design system colors defined in the CSS variables
4. **Text Formatting**: Use HTML tags (`<strong>`, `<em>`, `<u>`) within text content
5. **Visibility**: Set `visible: true` for all blocks unless specifically hidden
6. **Meta Properties**: Only include meta properties when they differ from defaults

## DIAGRAM INTEGRATION STATUS
✅ **FULLY INTEGRATED** - The diagram block is completely implemented with:
- Interactive canvas editor
- Multiple node shapes (rectangle, circle, diamond, etc.)
- Connection system with arrows
- Grid and snap functionality  
- Export capabilities (SVG, PNG)
- Template system for common diagram types
- Accessibility features
- Real-time editing and preview

The diagram block supports scientific flowcharts, decision trees, process diagrams, and custom visualizations commonly needed in systematic reviews and clinical studies.

## IMPLEMENTATION CHECKLIST
- ✅ All 15 block types are implemented and functional
- ✅ Rich text formatting with HTML rendering
- ✅ Interactive elements (polls, diagrams)
- ✅ Complete styling and layout system
- ✅ Import/export functionality
- ✅ Accessibility features
- ✅ Responsive design support

This system provides comprehensive functionality for creating professional medical and scientific reviews with rich interactive content.
