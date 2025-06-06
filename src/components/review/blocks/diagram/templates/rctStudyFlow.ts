
// ABOUTME: RCT study flow template with randomization and group allocation
// Standard CONSORT-style flow diagram for clinical trials

import { DiagramNode, DiagramConnection } from '@/types/review';

export const rctStudyFlowTemplate = {
  id: 'rct-study-flow',
  name: 'Fluxo de Estudo (RCT)',
  description: 'Randomização → Intervenção → Perdas → Análise',
  category: 'study-design',
  nodes: [
    {
      id: 'assessed',
      type: 'rectangle',
      position: { x: 350, y: 50 },
      size: { width: 220, height: 70 },
      text: 'Avaliados para elegibilidade\n(n = ___)',
      style: {
        backgroundColor: '#3b82f6',
        borderColor: '#1d4ed8',
        textColor: '#ffffff',
        borderWidth: 2,
        borderStyle: 'solid',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        opacity: 1
      }
    },
    {
      id: 'excluded',
      type: 'rectangle',
      position: { x: 620, y: 180 },
      size: { width: 200, height: 100 },
      text: 'Excluídos (n = ___)\n• Não atenderam critérios (n = ___)\n• Recusaram participar (n = ___)\n• Outras razões (n = ___)',
      style: {
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        textColor: '#ffffff',
        borderWidth: 2,
        borderStyle: 'solid',
        fontSize: 12,
        fontWeight: 'normal',
        textAlign: 'left',
        opacity: 1
      }
    },
    {
      id: 'randomized',
      type: 'rectangle',
      position: { x: 350, y: 220 },
      size: { width: 220, height: 70 },
      text: 'Randomizados\n(n = ___)',
      style: {
        backgroundColor: '#10b981',
        borderColor: '#059669',
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
      id: 'intervention-group',
      type: 'rectangle',
      position: { x: 200, y: 360 },
      size: { width: 180, height: 90 },
      text: 'Alocados para Intervenção\n(n = ___)\n• Receberam intervenção (n = ___)\n• Não receberam (n = ___)',
      style: {
        backgroundColor: '#8b5cf6',
        borderColor: '#7c3aed',
        textColor: '#ffffff',
        borderWidth: 2,
        borderStyle: 'solid',
        fontSize: 12,
        fontWeight: 'normal',
        textAlign: 'left',
        opacity: 1
      }
    },
    {
      id: 'control-group',
      type: 'rectangle',
      position: { x: 520, y: 360 },
      size: { width: 180, height: 90 },
      text: 'Alocados para Controle\n(n = ___)\n• Receberam controle (n = ___)\n• Não receberam (n = ___)',
      style: {
        backgroundColor: '#f59e0b',
        borderColor: '#d97706',
        textColor: '#ffffff',
        borderWidth: 2,
        borderStyle: 'solid',
        fontSize: 12,
        fontWeight: 'normal',
        textAlign: 'left',
        opacity: 1
      }
    },
    {
      id: 'lost-intervention',
      type: 'rectangle',
      position: { x: 80, y: 500 },
      size: { width: 160, height: 70 },
      text: 'Perdas de seguimento\n(n = ___)\nMotivos: ___',
      style: {
        backgroundColor: '#dc2626',
        borderColor: '#991b1b',
        textColor: '#ffffff',
        borderWidth: 2,
        borderStyle: 'dashed',
        fontSize: 11,
        fontWeight: 'normal',
        textAlign: 'left',
        opacity: 1
      }
    },
    {
      id: 'lost-control',
      type: 'rectangle',
      position: { x: 660, y: 500 },
      size: { width: 160, height: 70 },
      text: 'Perdas de seguimento\n(n = ___)\nMotivos: ___',
      style: {
        backgroundColor: '#dc2626',
        borderColor: '#991b1b',
        textColor: '#ffffff',
        borderWidth: 2,
        borderStyle: 'dashed',
        fontSize: 11,
        fontWeight: 'normal',
        textAlign: 'left',
        opacity: 1
      }
    },
    {
      id: 'analyzed-intervention',
      type: 'rectangle',
      position: { x: 200, y: 620 },
      size: { width: 180, height: 80 },
      text: 'Analisados\n(n = ___)\n• ITT: (n = ___)\n• Per protocol: (n = ___)',
      style: {
        backgroundColor: '#059669',
        borderColor: '#047857',
        textColor: '#ffffff',
        borderWidth: 2,
        borderStyle: 'solid',
        fontSize: 12,
        fontWeight: 'normal',
        textAlign: 'left',
        opacity: 1
      }
    },
    {
      id: 'analyzed-control',
      type: 'rectangle',
      position: { x: 520, y: 620 },
      size: { width: 180, height: 80 },
      text: 'Analisados\n(n = ___)\n• ITT: (n = ___)\n• Per protocol: (n = ___)',
      style: {
        backgroundColor: '#059669',
        borderColor: '#047857',
        textColor: '#ffffff',
        borderWidth: 2,
        borderStyle: 'solid',
        fontSize: 12,
        fontWeight: 'normal',
        textAlign: 'left',
        opacity: 1
      }
    }
  ] as DiagramNode[],
  connections: [
    {
      id: 'conn1',
      sourceNodeId: 'assessed',
      targetNodeId: 'excluded',
      sourcePoint: 'right',
      targetPoint: 'top',
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
      id: 'conn2',
      sourceNodeId: 'assessed',
      targetNodeId: 'randomized',
      sourcePoint: 'bottom',
      targetPoint: 'top',
      style: {
        strokeColor: '#10b981',
        strokeWidth: 3,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: false,
        opacity: 1
      }
    },
    {
      id: 'conn3',
      sourceNodeId: 'randomized',
      targetNodeId: 'intervention-group',
      sourcePoint: 'bottom',
      targetPoint: 'top',
      style: {
        strokeColor: '#8b5cf6',
        strokeWidth: 2,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: true,
        opacity: 1
      }
    },
    {
      id: 'conn4',
      sourceNodeId: 'randomized',
      targetNodeId: 'control-group',
      sourcePoint: 'bottom',
      targetPoint: 'top',
      style: {
        strokeColor: '#f59e0b',
        strokeWidth: 2,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: true,
        opacity: 1
      }
    },
    {
      id: 'conn5',
      sourceNodeId: 'intervention-group',
      targetNodeId: 'lost-intervention',
      sourcePoint: 'left',
      targetPoint: 'top',
      style: {
        strokeColor: '#dc2626',
        strokeWidth: 2,
        strokeStyle: 'dashed',
        arrowType: 'arrow',
        curved: true,
        opacity: 1
      }
    },
    {
      id: 'conn6',
      sourceNodeId: 'control-group',
      targetNodeId: 'lost-control',
      sourcePoint: 'right',
      targetPoint: 'top',
      style: {
        strokeColor: '#dc2626',
        strokeWidth: 2,
        strokeStyle: 'dashed',
        arrowType: 'arrow',
        curved: true,
        opacity: 1
      }
    },
    {
      id: 'conn7',
      sourceNodeId: 'intervention-group',
      targetNodeId: 'analyzed-intervention',
      sourcePoint: 'bottom',
      targetPoint: 'top',
      style: {
        strokeColor: '#059669',
        strokeWidth: 2,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: false,
        opacity: 1
      }
    },
    {
      id: 'conn8',
      sourceNodeId: 'control-group',
      targetNodeId: 'analyzed-control',
      sourcePoint: 'bottom',
      targetPoint: 'top',
      style: {
        strokeColor: '#059669',
        strokeWidth: 2,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: false,
        opacity: 1
      }
    }
  ] as DiagramConnection[]
};
