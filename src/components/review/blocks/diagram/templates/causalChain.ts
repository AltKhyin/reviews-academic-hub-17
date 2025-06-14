
// ABOUTME: Causal chain template for intervention mechanism visualization
// Shows logical progression from intervention to outcomes

import { DiagramTemplateNode, DiagramTemplateConnection } from '@/types/review';

export const causalChainTemplate = {
  id: 'causal-chain',
  name: 'Cadeia Causal da Intervenção',
  description: 'Intervenção → Mecanismo → Desfecho com mediadores',
  category: 'conceptual',
  nodes: [
    {
      id: 'intervention',
      type: 'rectangle',
      position: { x: 50, y: 200 },
      width: 140,
      height: 80,
      label: 'INTERVENÇÃO\n(O que fazemos)',
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
      id: 'immediate-effect',
      type: 'rectangle',
      position: { x: 250, y: 120 },
      width: 120,
      height: 60,
      label: 'Efeito\nImediato',
      style: {
        backgroundColor: '#f59e0b',
        borderColor: '#d97706',
        textColor: '#ffffff',
        borderWidth: 2,
        borderStyle: 'solid',
        fontSize: 12,
        fontWeight: 'normal',
        textAlign: 'center',
        opacity: 1
      }
    },
    {
      id: 'mechanism',
      type: 'diamond',
      position: { x: 250, y: 200 },
      width: 160,
      height: 80,
      label: 'MECANISMO\n(Como funciona)',
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
      id: 'mediator',
      type: 'rectangle',
      position: { x: 250, y: 280 },
      width: 120,
      height: 60,
      label: 'Mediador\n(Processo)',
      style: {
        backgroundColor: '#7c3aed',
        borderColor: '#6d28d9',
        textColor: '#ffffff',
        borderWidth: 2,
        borderStyle: 'solid',
        fontSize: 12,
        fontWeight: 'normal',
        textAlign: 'center',
        opacity: 1
      }
    },
    {
      id: 'proximal-outcome',
      type: 'rectangle',
      position: { x: 450, y: 120 },
      width: 120,
      height: 60,
      label: 'Desfecho\nProximal',
      style: {
        backgroundColor: '#3b82f6',
        borderColor: '#1d4ed8',
        textColor: '#ffffff',
        borderWidth: 2,
        borderStyle: 'solid',
        fontSize: 12,
        fontWeight: 'normal',
        textAlign: 'center',
        opacity: 1
      }
    },
    {
      id: 'primary-outcome',
      type: 'rectangle',
      position: { x: 450, y: 200 },
      width: 140,
      height: 80,
      label: 'DESFECHO\nPRIMÁRIO\n(O que medimos)',
      style: {
        backgroundColor: '#1d4ed8',
        borderColor: '#1e40af',
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
      id: 'distal-outcome',
      type: 'rectangle',
      position: { x: 450, y: 280 },
      width: 120,
      height: 60,
      label: 'Desfecho\nDistal',
      style: {
        backgroundColor: '#0891b2',
        borderColor: '#0e7490',
        textColor: '#ffffff',
        borderWidth: 2,
        borderStyle: 'solid',
        fontSize: 12,
        fontWeight: 'normal',
        textAlign: 'center',
        opacity: 1
      }
    },
    {
      id: 'moderator',
      type: 'ellipse',
      position: { x: 320, y: 50 },
      width: 140,
      height: 60,
      label: 'MODERADOR\n(Contexto)',
      style: {
        backgroundColor: '#6b7280',
        borderColor: '#4b5563',
        textColor: '#ffffff',
        borderWidth: 2,
        borderStyle: 'dashed',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        opacity: 1
      }
    }
  ] as DiagramTemplateNode[],
  connections: [
    {
      source: 'intervention',
      target: 'immediate-effect',
      style: {
        strokeColor: '#dc2626',
        strokeWidth: 3,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: true,
        opacity: 1
      }
    },
    {
      source: 'intervention',
      target: 'mechanism',
      style: {
        strokeColor: '#dc2626',
        strokeWidth: 4,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: false,
        opacity: 1
      }
    },
    {
      source: 'intervention',
      target: 'mediator',
      style: {
        strokeColor: '#dc2626',
        strokeWidth: 3,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: true,
        opacity: 1
      }
    },
    {
      source: 'mechanism',
      target: 'proximal-outcome',
      style: {
        strokeColor: '#059669',
        strokeWidth: 3,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: true,
        opacity: 1
      }
    },
    {
      source: 'mechanism',
      target: 'primary-outcome',
      style: {
        strokeColor: '#059669',
        strokeWidth: 4,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: false,
        opacity: 1
      }
    },
    {
      source: 'mechanism',
      target: 'distal-outcome',
      style: {
        strokeColor: '#059669',
        strokeWidth: 3,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: true,
        opacity: 1
      }
    },
    {
      source: 'moderator',
      target: 'mechanism',
      style: {
        strokeColor: '#6b7280',
        strokeWidth: 2,
        strokeStyle: 'dashed',
        arrowType: 'arrow',
        curved: false,
        opacity: 0.8
      }
    }
  ] as DiagramTemplateConnection[]
};
