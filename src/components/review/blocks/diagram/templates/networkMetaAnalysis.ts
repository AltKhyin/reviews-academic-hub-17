
// ABOUTME: Network meta-analysis diagram template for comparing multiple interventions
// Shows interconnected treatment comparisons in systematic reviews

import { DiagramTemplateNode, DiagramTemplateConnection } from '@/types/review';

export const networkMetaAnalysisTemplate = {
  id: 'network-meta-analysis',
  name: 'Rede de Meta-Análise',
  description: 'Comparações diretas e indiretas entre múltiplas intervenções',
  category: 'evidence',
  nodes: [
    {
      id: 'placebo',
      type: 'circle',
      position: { x: 400, y: 300 },
      width: 100,
      height: 100,
      label: 'Placebo',
      style: {
        backgroundColor: '#6b7280',
        borderColor: '#4b5563',
        textColor: '#ffffff',
        borderWidth: 3,
        borderStyle: 'solid',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        opacity: 1
      }
    },
    {
      id: 'treatment-a',
      type: 'circle',
      position: { x: 200, y: 150 },
      width: 120,
      height: 120,
      label: 'Tratamento A',
      style: {
        backgroundColor: '#dc2626',
        borderColor: '#991b1b',
        textColor: '#ffffff',
        borderWidth: 3,
        borderStyle: 'solid',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        opacity: 1
      }
    },
    {
      id: 'treatment-b',
      type: 'circle',
      position: { x: 600, y: 150 },
      width: 120,
      height: 120,
      label: 'Tratamento B',
      style: {
        backgroundColor: '#059669',
        borderColor: '#047857',
        textColor: '#ffffff',
        borderWidth: 3,
        borderStyle: 'solid',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        opacity: 1
      }
    },
    {
      id: 'treatment-c',
      type: 'circle',
      position: { x: 200, y: 450 },
      width: 120,
      height: 120,
      label: 'Tratamento C',
      style: {
        backgroundColor: '#7c3aed',
        borderColor: '#6d28d9',
        textColor: '#ffffff',
        borderWidth: 3,
        borderStyle: 'solid',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        opacity: 1
      }
    },
    {
      id: 'treatment-d',
      type: 'circle',
      position: { x: 600, y: 450 },
      width: 120,
      height: 120,
      label: 'Tratamento D',
      style: {
        backgroundColor: '#f59e0b',
        borderColor: '#d97706',
        textColor: '#ffffff',
        borderWidth: 3,
        borderStyle: 'solid',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        opacity: 1
      }
    }
  ] as DiagramTemplateNode[],
  connections: [
    {
      source: 'placebo',
      target: 'treatment-a',
      style: {
        strokeColor: '#1d4ed8',
        strokeWidth: 4,
        strokeStyle: 'solid',
        arrowType: 'none',
        curved: false,
        opacity: 1
      }
    },
    {
      source: 'placebo',
      target: 'treatment-b',
      style: {
        strokeColor: '#1d4ed8',
        strokeWidth: 4,
        strokeStyle: 'solid',
        arrowType: 'none',
        curved: false,
        opacity: 1
      }
    },
    {
      source: 'treatment-a',
      target: 'treatment-c',
      style: {
        strokeColor: '#dc2626',
        strokeWidth: 2,
        strokeStyle: 'solid',
        arrowType: 'none',
        curved: false,
        opacity: 1
      }
    },
    {
      source: 'treatment-b',
      target: 'treatment-d',
      style: {
        strokeColor: '#059669',
        strokeWidth: 2,
        strokeStyle: 'solid',
        arrowType: 'none',
        curved: false,
        opacity: 1
      }
    },
    {
      source: 'treatment-a',
      target: 'treatment-b',
      style: {
        strokeColor: '#6b7280',
        strokeWidth: 1,
        strokeStyle: 'dashed',
        arrowType: 'none',
        curved: true,
        opacity: 0.7
      }
    },
    {
      source: 'treatment-c',
      target: 'treatment-d',
      style: {
        strokeColor: '#6b7280',
        strokeWidth: 1,
        strokeStyle: 'dashed',
        arrowType: 'none',
        curved: true,
        opacity: 0.7
      }
    }
  ] as DiagramTemplateConnection[]
};
