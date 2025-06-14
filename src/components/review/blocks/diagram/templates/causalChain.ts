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
      size: { width: 140, height: 80 },
      text: 'INTERVENÇÃO\n(O que fazemos)',
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
      size: { width: 120, height: 60 },
      text: 'Efeito\nImediato',
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
      size: { width: 160, height: 80 },
      text: 'MECANISMO\n(Como funciona)',
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
      size: { width: 120, height: 60 },
      text: 'Mediador\n(Processo)',
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
      size: { width: 120, height: 60 },
      text: 'Desfecho\nProximal',
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
      size: { width: 140, height: 80 },
      text: 'DESFECHO\nPRIMÁRIO\n(O que medimos)',
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
      size: { width: 120, height: 60 },
      text: 'Desfecho\nDistal',
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
      size: { width: 140, height: 60 },
      text: 'MODERADOR\n(Contexto)',
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
      id: 'conn1',
      sourceNodeId: 'intervention',
      targetNodeId: 'immediate-effect',
      sourcePoint: 'right',
      targetPoint: 'left',
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
      id: 'conn2',
      sourceNodeId: 'intervention',
      targetNodeId: 'mechanism',
      sourcePoint: 'right',
      targetPoint: 'left',
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
      id: 'conn3',
      sourceNodeId: 'intervention',
      targetNodeId: 'mediator',
      sourcePoint: 'right',
      targetPoint: 'left',
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
      id: 'conn4',
      sourceNodeId: 'mechanism',
      targetNodeId: 'proximal-outcome',
      sourcePoint: 'right',
      targetPoint: 'left',
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
      id: 'conn5',
      sourceNodeId: 'mechanism',
      targetNodeId: 'primary-outcome',
      sourcePoint: 'right',
      targetPoint: 'left',
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
      id: 'conn6',
      sourceNodeId: 'mechanism',
      targetNodeId: 'distal-outcome',
      sourcePoint: 'right',
      targetPoint: 'left',
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
      id: 'conn7',
      sourceNodeId: 'moderator',
      targetNodeId: 'mechanism',
      sourcePoint: 'bottom',
      targetPoint: 'top',
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
