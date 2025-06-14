
// ABOUTME: PRISMA flow diagram template for systematic review study selection
// Standard flowchart for documenting search and selection process

import { DiagramTemplateNode, DiagramTemplateConnection } from '@/types/review';

export const prismaFlowTemplate = {
  id: 'prisma-flow',
  name: 'Fluxo PRISMA',
  description: 'Seleção de estudos em revisão sistemática (padrão PRISMA)',
  category: 'study-design',
  nodes: [
    {
      id: 'identification',
      type: 'rectangle',
      position: { x: 350, y: 50 },
      width: 200,
      height: 60,
      label: 'IDENTIFICAÇÃO\nRegistros identificados\nn = ___',
      style: {
        backgroundColor: '#1e40af',
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
      id: 'additional-records',
      type: 'rectangle',
      position: { x: 600, y: 50 },
      width: 160,
      height: 60,
      label: 'Registros adicionais\n(outras fontes)\nn = ___',
      style: {
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        textColor: '#ffffff',
        borderWidth: 2,
        borderStyle: 'solid',
        fontSize: 11,
        fontWeight: 'normal',
        textAlign: 'center',
        opacity: 1
      }
    },
    {
      id: 'after-duplicates',
      type: 'rectangle',
      position: { x: 350, y: 150 },
      width: 200,
      height: 60,
      label: 'TRIAGEM\nApós remoção duplicatas\nn = ___',
      style: {
        backgroundColor: '#059669',
        borderColor: '#047857',
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
      id: 'excluded-screening',
      type: 'rectangle',
      position: { x: 600, y: 150 },
      width: 160,
      height: 60,
      label: 'Excluídos na triagem\nn = ___\nMotivo: ___',
      style: {
        backgroundColor: '#dc2626',
        borderColor: '#991b1b',
        textColor: '#ffffff',
        borderWidth: 2,
        borderStyle: 'solid',
        fontSize: 11,
        fontWeight: 'normal',
        textAlign: 'center',
        opacity: 1
      }
    },
    {
      id: 'full-text-assessed',
      type: 'rectangle',
      position: { x: 350, y: 250 },
      width: 200,
      height: 60,
      label: 'ELEGIBILIDADE\nTexto completo avaliado\nn = ___',
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
      id: 'excluded-full-text',
      type: 'rectangle',
      position: { x: 600, y: 250 },
      width: 160,
      height: 80,
      label: 'Excluídos texto completo\nn = ___\nMotivos:\n• ___\n• ___',
      style: {
        backgroundColor: '#dc2626',
        borderColor: '#991b1b',
        textColor: '#ffffff',
        borderWidth: 2,
        borderStyle: 'solid',
        fontSize: 10,
        fontWeight: 'normal',
        textAlign: 'left',
        opacity: 1
      }
    },
    {
      id: 'included',
      type: 'rectangle',
      position: { x: 350, y: 370 },
      width: 200,
      height: 80,
      label: 'INCLUÍDOS\nEstudos na síntese\nqualitativa\nn = ___',
      style: {
        backgroundColor: '#7c3aed',
        borderColor: '#6d28d9',
        textColor: '#ffffff',
        borderWidth: 4,
        borderStyle: 'solid',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        opacity: 1
      }
    },
    {
      id: 'meta-analysis',
      type: 'rectangle',
      position: { x: 350, y: 480 },
      width: 200,
      height: 60,
      label: 'Estudos na síntese\nquantitativa\n(meta-análise)\nn = ___',
      style: {
        backgroundColor: '#0891b2',
        borderColor: '#0e7490',
        textColor: '#ffffff',
        borderWidth: 3,
        borderStyle: 'solid',
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'center',
        opacity: 1
      }
    }
  ] as DiagramTemplateNode[],
  connections: [
    {
      source: 'identification',
      target: 'after-duplicates',
      style: {
        strokeColor: '#1e40af',
        strokeWidth: 3,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: false,
        opacity: 1
      }
    },
    {
      source: 'additional-records',
      target: 'after-duplicates',
      style: {
        strokeColor: '#3b82f6',
        strokeWidth: 2,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: true,
        opacity: 1
      }
    },
    {
      source: 'after-duplicates',
      target: 'full-text-assessed',
      style: {
        strokeColor: '#059669',
        strokeWidth: 3,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: false,
        opacity: 1
      }
    },
    {
      source: 'after-duplicates',
      target: 'excluded-screening',
      style: {
        strokeColor: '#dc2626',
        strokeWidth: 2,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: false,
        opacity: 1
      }
    },
    {
      source: 'full-text-assessed',
      target: 'included',
      style: {
        strokeColor: '#f59e0b',
        strokeWidth: 3,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: false,
        opacity: 1
      }
    },
    {
      source: 'full-text-assessed',
      target: 'excluded-full-text',
      style: {
        strokeColor: '#dc2626',
        strokeWidth: 2,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: false,
        opacity: 1
      }
    },
    {
      source: 'included',
      target: 'meta-analysis',
      style: {
        strokeColor: '#7c3aed',
        strokeWidth: 2,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: false,
        opacity: 1
      }
    }
  ] as DiagramTemplateConnection[]
};
