
// ABOUTME: Study timeline template for temporal visualization of interventions and measurements
// Horizontal timeline showing when events occur during study period

import { DiagramTemplateNode, DiagramTemplateConnection } from '@/types/review';

export const studyTimelineTemplate = {
  id: 'study-timeline',
  name: 'Linha do Tempo do Estudo',
  description: 'Quando ocorrem medidas, intervenções e análises',
  category: 'study-design',
  nodes: [
    {
      id: 'baseline',
      type: 'circle',
      position: { x: 100, y: 200 },
      width: 80,
      height: 80,
      label: 'Baseline\nT0',
      style: {
        backgroundColor: '#3b82f6',
        borderColor: '#1d4ed8',
        textColor: '#ffffff',
        borderWidth: 3,
        borderStyle: 'solid',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        opacity: 1
      }
    },
    {
      id: 'baseline-measures',
      type: 'rectangle',
      position: { x: 50, y: 320 },
      width: 180,
      height: 80,
      label: 'Medidas Baseline:\n• Demografia\n• Critérios elegibilidade\n• Desfechos primários',
      style: {
        backgroundColor: '#6b7280',
        borderColor: '#4b5563',
        textColor: '#ffffff',
        borderWidth: 2,
        borderStyle: 'solid',
        fontSize: 11,
        fontWeight: 'normal',
        textAlign: 'left',
        opacity: 1
      }
    },
    {
      id: 'intervention-start',
      type: 'circle',
      position: { x: 300, y: 200 },
      width: 80,
      height: 80,
      label: 'Início\nT1',
      style: {
        backgroundColor: '#10b981',
        borderColor: '#059669',
        textColor: '#ffffff',
        borderWidth: 3,
        borderStyle: 'solid',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        opacity: 1
      }
    },
    {
      id: 'intervention-details',
      type: 'rectangle',
      position: { x: 250, y: 320 },
      width: 180,
      height: 80,
      label: 'Início da Intervenção:\n• Randomização\n• Alocação para grupos\n• Início do tratamento',
      style: {
        backgroundColor: '#059669',
        borderColor: '#047857',
        textColor: '#ffffff',
        borderWidth: 2,
        borderStyle: 'solid',
        fontSize: 11,
        fontWeight: 'normal',
        textAlign: 'left',
        opacity: 1
      }
    },
    {
      id: 'follow-up-1',
      type: 'circle',
      position: { x: 500, y: 200 },
      width: 80,
      height: 80,
      label: '1º Follow\nT2',
      style: {
        backgroundColor: '#f59e0b',
        borderColor: '#d97706',
        textColor: '#ffffff',
        borderWidth: 3,
        borderStyle: 'solid',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        opacity: 1
      }
    },
    {
      id: 'follow-up-1-measures',
      type: 'rectangle',
      position: { x: 450, y: 80 },
      width: 180,
      height: 80,
      label: 'Medidas (4 semanas):\n• Desfechos primários\n• Eventos adversos\n• Adesão ao tratamento',
      style: {
        backgroundColor: '#d97706',
        borderColor: '#b45309',
        textColor: '#ffffff',
        borderWidth: 2,
        borderStyle: 'solid',
        fontSize: 11,
        fontWeight: 'normal',
        textAlign: 'left',
        opacity: 1
      }
    },
    {
      id: 'follow-up-2',
      type: 'circle',
      position: { x: 700, y: 200 },
      width: 80,
      height: 80,
      label: '2º Follow\nT3',
      style: {
        backgroundColor: '#f59e0b',
        borderColor: '#d97706',
        textColor: '#ffffff',
        borderWidth: 3,
        borderStyle: 'solid',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        opacity: 1
      }
    },
    {
      id: 'follow-up-2-measures',
      type: 'rectangle',
      position: { x: 650, y: 320 },
      width: 180,
      height: 80,
      label: 'Medidas (12 semanas):\n• Desfechos primários\n• Qualidade de vida\n• Biomarcadores',
      style: {
        backgroundColor: '#d97706',
        borderColor: '#b45309',
        textColor: '#ffffff',
        borderWidth: 2,
        borderStyle: 'solid',
        fontSize: 11,
        fontWeight: 'normal',
        textAlign: 'left',
        opacity: 1
      }
    },
    {
      id: 'endpoint',
      type: 'circle',
      position: { x: 900, y: 200 },
      width: 80,
      height: 80,
      label: 'Final\nT4',
      style: {
        backgroundColor: '#dc2626',
        borderColor: '#991b1b',
        textColor: '#ffffff',
        borderWidth: 3,
        borderStyle: 'solid',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        opacity: 1
      }
    },
    {
      id: 'final-measures',
      type: 'rectangle',
      position: { x: 850, y: 80 },
      width: 180,
      height: 80,
      label: 'Medidas Finais (24 sem):\n• Desfechos primários\n• Análise final\n• Seguimento longo prazo',
      style: {
        backgroundColor: '#991b1b',
        borderColor: '#7f1d1d',
        textColor: '#ffffff',
        borderWidth: 2,
        borderStyle: 'solid',
        fontSize: 11,
        fontWeight: 'normal',
        textAlign: 'left',
        opacity: 1
      }
    },
    {
      id: 'timeline-line',
      type: 'rectangle',
      position: { x: 90, y: 235 },
      width: 820,
      height: 10,
      label: '',
      style: {
        backgroundColor: '#4b5563',
        borderColor: '#374151',
        textColor: '#ffffff',
        borderWidth: 1,
        borderStyle: 'solid',
        fontSize: 12,
        fontWeight: 'normal',
        textAlign: 'center',
        opacity: 1
      }
    }
  ] as DiagramTemplateNode[],
  connections: [
    {
      source: 'baseline',
      target: 'baseline-measures',
      style: {
        strokeColor: '#3b82f6',
        strokeWidth: 2,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: false,
        opacity: 1
      }
    },
    {
      source: 'intervention-start',
      target: 'intervention-details',
      style: {
        strokeColor: '#10b981',
        strokeWidth: 2,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: false,
        opacity: 1
      }
    },
    {
      source: 'follow-up-1',
      target: 'follow-up-1-measures',
      style: {
        strokeColor: '#f59e0b',
        strokeWidth: 2,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: false,
        opacity: 1
      }
    },
    {
      source: 'follow-up-2',
      target: 'follow-up-2-measures',
      style: {
        strokeColor: '#f59e0b',
        strokeWidth: 2,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: false,
        opacity: 1
      }
    },
    {
      source: 'endpoint',
      target: 'final-measures',
      style: {
        strokeColor: '#dc2626',
        strokeWidth: 2,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: false,
        opacity: 1
      }
    }
  ] as DiagramTemplateConnection[]
};
