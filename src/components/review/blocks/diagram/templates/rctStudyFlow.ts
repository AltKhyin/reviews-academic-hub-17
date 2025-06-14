
// ABOUTME: RCT study flow template with randomization and group allocation
// Standard CONSORT-style flow diagram for clinical trials

import { DiagramTemplateNode, DiagramTemplateConnection } from '@/types/review';

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
      width: 220,
      height: 70,
      label: 'Avaliados para elegibilidade\n(n = ___)',
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
      width: 200,
      height: 100,
      label: 'Excluídos (n = ___)\n• Não atenderam critérios (n = ___)\n• Recusaram participar (n = ___)\n• Outras razões (n = ___)',
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
      width: 220,
      height: 70,
      label: 'Randomizados\n(n = ___)',
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
      width: 180,
      height: 90,
      label: 'Alocados para Intervenção\n(n = ___)\n• Receberam intervenção (n = ___)\n• Não receberam (n = ___)',
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
      width: 180,
      height: 90,
      label: 'Alocados para Controle\n(n = ___)\n• Receberam controle (n = ___)\n• Não receberam (n = ___)',
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
      width: 160,
      height: 70,
      label: 'Perdas de seguimento\n(n = ___)\nMotivos: ___',
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
      width: 160,
      height: 70,
      label: 'Perdas de seguimento\n(n = ___)\nMotivos: ___',
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
      width: 180,
      height: 80,
      label: 'Analisados\n(n = ___)\n• ITT: (n = ___)\n• Per protocol: (n = ___)',
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
      width: 180,
      height: 80,
      label: 'Analisados\n(n = ___)\n• ITT: (n = ___)\n• Per protocol: (n = ___)',
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
  ] as DiagramTemplateNode[],
  connections: [
    {
      source: 'assessed',
      target: 'excluded',
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
      source: 'assessed',
      target: 'randomized',
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
      source: 'randomized',
      target: 'intervention-group',
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
      source: 'randomized',
      target: 'control-group',
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
      source: 'intervention-group',
      target: 'lost-intervention',
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
      source: 'control-group',
      target: 'lost-control',
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
      source: 'intervention-group',
      target: 'analyzed-intervention',
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
      source: 'control-group',
      target: 'analyzed-control',
      style: {
        strokeColor: '#059669',
        strokeWidth: 2,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: false,
        opacity: 1
      }
    }
  ] as DiagramTemplateConnection[]
};
