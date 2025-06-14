
// ABOUTME: Clinical decision tree template for diagnostic and therapeutic algorithms
// Provides structured decision flow with yes/no branches

import { DiagramTemplateNode, DiagramTemplateConnection } from '@/types/review';

export const clinicalDecisionTreeTemplate = {
  id: 'clinical-decision-tree',
  name: 'Árvore de Decisão Clínica',
  description: 'Algoritmo "se/então" para decisões diagnósticas ou terapêuticas',
  category: 'clinical',
  nodes: [
    {
      id: 'patient-presents',
      type: 'circle',
      position: { x: 400, y: 50 },
      width: 140,
      height: 80,
      label: 'Paciente\nApresenta',
      style: {
        backgroundColor: '#10b981',
        borderColor: '#059669',
        textColor: '#ffffff',
        borderWidth: 3,
        borderStyle: 'solid',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        opacity: 1
      }
    },
    {
      id: 'symptom-check',
      type: 'diamond',
      position: { x: 350, y: 180 },
      width: 240,
      height: 100,
      label: 'Sintoma A\npresente?',
      style: {
        backgroundColor: '#f59e0b',
        borderColor: '#d97706',
        textColor: '#ffffff',
        borderWidth: 2,
        borderStyle: 'solid',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        opacity: 1
      }
    },
    {
      id: 'exclude-diagnosis',
      type: 'rectangle',
      position: { x: 120, y: 320 },
      width: 160,
      height: 80,
      label: 'Excluir\nDiagnóstico X',
      style: {
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        textColor: '#ffffff',
        borderWidth: 2,
        borderStyle: 'solid',
        fontSize: 14,
        fontWeight: 'normal',
        textAlign: 'center',
        opacity: 1
      }
    },
    {
      id: 'secondary-check',
      type: 'diamond',
      position: { x: 580, y: 320 },
      width: 240,
      height: 100,
      label: 'Critério B\natendido?',
      style: {
        backgroundColor: '#f59e0b',
        borderColor: '#d97706',
        textColor: '#ffffff',
        borderWidth: 2,
        borderStyle: 'solid',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        opacity: 1
      }
    },
    {
      id: 'treatment-a',
      type: 'rectangle',
      position: { x: 460, y: 480 },
      width: 160,
      height: 80,
      label: 'Tratamento A\n(Primeira linha)',
      style: {
        backgroundColor: '#3b82f6',
        borderColor: '#1d4ed8',
        textColor: '#ffffff',
        borderWidth: 2,
        borderStyle: 'solid',
        fontSize: 14,
        fontWeight: 'normal',
        textAlign: 'center',
        opacity: 1
      }
    },
    {
      id: 'treatment-b',
      type: 'rectangle',
      position: { x: 720, y: 480 },
      width: 160,
      height: 80,
      label: 'Tratamento B\n(Alternativo)',
      style: {
        backgroundColor: '#8b5cf6',
        borderColor: '#7c3aed',
        textColor: '#ffffff',
        borderWidth: 2,
        borderStyle: 'solid',
        fontSize: 14,
        fontWeight: 'normal',
        textAlign: 'center',
        opacity: 1
      }
    }
  ] as DiagramTemplateNode[],
  connections: [
    {
      source: 'patient-presents',
      target: 'symptom-check',
      style: {
        strokeColor: '#6b7280',
        strokeWidth: 2,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: false,
        opacity: 1
      }
    },
    {
      source: 'symptom-check',
      target: 'exclude-diagnosis',
      style: {
        strokeColor: '#ef4444',
        strokeWidth: 2,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: true,
        opacity: 1
      }
    },
    {
      source: 'symptom-check',
      target: 'secondary-check',
      style: {
        strokeColor: '#10b981',
        strokeWidth: 2,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: true,
        opacity: 1
      }
    },
    {
      source: 'secondary-check',
      target: 'treatment-a',
      style: {
        strokeColor: '#10b981',
        strokeWidth: 2,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: true,
        opacity: 1
      }
    },
    {
      source: 'secondary-check',
      target: 'treatment-b',
      style: {
        strokeColor: '#f59e0b',
        strokeWidth: 2,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: true,
        opacity: 1
      }
    }
  ] as DiagramTemplateConnection[]
};
