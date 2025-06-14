
// ABOUTME: Barriers and facilitators map template for implementation challenges
// Visual organization of obstacles vs solutions in implementation studies

import { DiagramTemplateNode, DiagramTemplateConnection } from '@/types/review';

export const barriersAndFacilitatorsTemplate = {
  id: 'barriers-facilitators',
  name: 'Mapa de Barreiras e Facilitadores',
  description: 'Obstáculos vs soluções organizados visualmente',
  category: 'implementation',
  nodes: [
    {
      id: 'implementation-goal',
      type: 'circle',
      position: { x: 400, y: 50 },
      width: 180,
      height: 80,
      label: 'Meta de\nImplementação',
      style: {
        backgroundColor: '#1d4ed8',
        borderColor: '#1e40af',
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
      id: 'barriers-header',
      type: 'rectangle',
      position: { x: 150, y: 180 },
      width: 200,
      height: 60,
      label: '⚠️ BARREIRAS',
      style: {
        backgroundColor: '#dc2626',
        borderColor: '#991b1b',
        textColor: '#ffffff',
        borderWidth: 3,
        borderStyle: 'solid',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        opacity: 1
      }
    },
    {
      id: 'facilitators-header',
      type: 'rectangle',
      position: { x: 550, y: 180 },
      width: 200,
      height: 60,
      label: '✅ FACILITADORES',
      style: {
        backgroundColor: '#059669',
        borderColor: '#047857',
        textColor: '#ffffff',
        borderWidth: 3,
        borderStyle: 'solid',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        opacity: 1
      }
    },
    {
      id: 'barrier-organizational',
      type: 'rectangle',
      position: { x: 50, y: 280 },
      width: 160,
      height: 80,
      label: 'Organizacionais:\n• Recursos limitados\n• Falta de tempo\n• Resistência à mudança',
      style: {
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
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
      id: 'barrier-individual',
      type: 'rectangle',
      position: { x: 250, y: 280 },
      width: 160,
      height: 80,
      label: 'Individuais:\n• Falta de conhecimento\n• Baixa motivação\n• Sobrecarga de trabalho',
      style: {
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
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
      id: 'facilitator-organizational',
      type: 'rectangle',
      position: { x: 490, y: 280 },
      width: 160,
      height: 80,
      label: 'Organizacionais:\n• Liderança engajada\n• Cultura de apoio\n• Recursos disponíveis',
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
      id: 'facilitator-individual',
      type: 'rectangle',
      position: { x: 690, y: 280 },
      width: 160,
      height: 80,
      label: 'Individuais:\n• Treinamento e capacitação\n• Feedback construtivo\n• Percepção de benefício',
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
      id: 'barrier-technical',
      type: 'rectangle',
      position: { x: 50, y: 400 },
      width: 160,
      height: 80,
      label: 'Técnicas:\n• Tecnologia inadequada\n• Complexidade alta\n• Falta de suporte técnico',
      style: {
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
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
      id: 'barrier-contextual',
      type: 'rectangle',
      position: { x: 250, y: 400 },
      width: 160,
      height: 80,
      label: 'Contextuais:\n• Políticas conflitantes\n• Financiamento instável\n• Mudanças frequentes',
      style: {
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
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
      id: 'facilitator-technical',
      type: 'rectangle',
      position: { x: 490, y: 400 },
      width: 160,
      height: 80,
      label: 'Técnicas:\n• Tecnologia amigável\n• Suporte técnico\n• Interface intuitiva',
      style: {
        backgroundColor: '#10b981',
        borderColor: '#059669',
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
      id: 'facilitator-contextual',
      type: 'rectangle',
      position: { x: 690, y: 400 },
      width: 160,
      height: 80,
      label: 'Contextuais:\n• Políticas favoráveis\n• Financiamento estável\n• Ambiente favorável',
      style: {
        backgroundColor: '#10b981',
        borderColor: '#059669',
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
      id: 'strategies',
      type: 'rectangle',
      position: { x: 350, y: 520 },
      width: 200,
      height: 80,
      label: 'ESTRATÉGIAS DE\nMITIGAÇÃO\n• Treinamento\n• Incentivos\n• Suporte contínuo',
      style: {
        backgroundColor: '#7c3aed',
        borderColor: '#6d28d9',
        textColor: '#ffffff',
        borderWidth: 3,
        borderStyle: 'solid',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'left',
        opacity: 1
      }
    }
  ] as DiagramTemplateNode[],
  connections: [
    {
      source: 'implementation-goal',
      target: 'barriers-header',
      style: {
        strokeColor: '#dc2626',
        strokeWidth: 2,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: true,
        opacity: 1
      }
    },
    {
      source: 'implementation-goal',
      target: 'facilitators-header',
      style: {
        strokeColor: '#059669',
        strokeWidth: 2,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: true,
        opacity: 1
      }
    },
    {
      source: 'barriers-header',
      target: 'barrier-organizational',
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
      source: 'barriers-header',
      target: 'barrier-individual',
      style: {
        strokeColor: '#ef4444',
        strokeWidth: 2,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: false,
        opacity: 1
      }
    },
    {
      source: 'facilitators-header',
      target: 'facilitator-organizational',
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
      source: 'facilitators-header',
      target: 'facilitator-individual',
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
      source: 'barrier-organizational',
      target: 'strategies',
      style: {
        strokeColor: '#7c3aed',
        strokeWidth: 2,
        strokeStyle: 'dashed',
        arrowType: 'arrow',
        curved: true,
        opacity: 1
      }
    },
    {
      source: 'facilitator-organizational',
      target: 'strategies',
      style: {
        strokeColor: '#7c3aed',
        strokeWidth: 2,
        strokeStyle: 'dashed',
        arrowType: 'arrow',
        curved: true,
        opacity: 1
      }
    }
  ] as DiagramTemplateConnection[]
};
