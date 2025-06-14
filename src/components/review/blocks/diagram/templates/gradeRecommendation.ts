
// ABOUTME: GRADE recommendation pathway template for evidence-based recommendations
// Shows logical path from evidence quality to recommendation strength

import { DiagramTemplateNode, DiagramTemplateConnection } from '@/types/review';

export const gradeRecommendationTemplate = {
  id: 'grade-recommendation',
  name: 'GRADE - Caminho da Recomendação',
  description: 'Caminho lógico da força de recomendação (eficácia + confiança)',
  category: 'evidence',
  nodes: [
    {
      id: 'evidence-base',
      type: 'rectangle',
      position: { x: 100, y: 50 },
      width: 180,
      height: 80,
      label: 'Base de Evidência\n• RCTs: ___\n• Estudos observacionais: ___\n• Outros: ___',
      style: {
        backgroundColor: '#6b7280',
        borderColor: '#4b5563',
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
      id: 'risk-bias',
      type: 'diamond',
      position: { x: 350, y: 60 },
      width: 160,
      height: 80,
      label: 'Risco de Viés\nBaixo?',
      style: {
        backgroundColor: '#f59e0b',
        borderColor: '#d97706',
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
      id: 'inconsistency',
      type: 'diamond',
      position: { x: 580, y: 60 },
      width: 160,
      height: 80,
      label: 'Consistência\nEntre Estudos?',
      style: {
        backgroundColor: '#f59e0b',
        borderColor: '#d97706',
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
      id: 'directness',
      type: 'diamond',
      position: { x: 350, y: 200 },
      width: 160,
      height: 80,
      label: 'Evidência\nDireta?',
      style: {
        backgroundColor: '#f59e0b',
        borderColor: '#d97706',
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
      id: 'precision',
      type: 'diamond',
      position: { x: 580, y: 200 },
      width: 160,
      height: 80,
      label: 'Precisão\nAdequada?',
      style: {
        backgroundColor: '#f59e0b',
        borderColor: '#d97706',
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
      id: 'quality-high',
      type: 'rectangle',
      position: { x: 150, y: 340 },
      width: 120,
      height: 60,
      label: 'Qualidade\nALTA\n⊕⊕⊕⊕',
      style: {
        backgroundColor: '#059669',
        borderColor: '#047857',
        textColor: '#ffffff',
        borderWidth: 2,
        borderStyle: 'solid',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        opacity: 1
      }
    },
    {
      id: 'quality-moderate',
      type: 'rectangle',
      position: { x: 300, y: 340 },
      width: 120,
      height: 60,
      label: 'Qualidade\nMODERADA\n⊕⊕⊕⊝',
      style: {
        backgroundColor: '#10b981',
        borderColor: '#059669',
        textColor: '#ffffff',
        borderWidth: 2,
        borderStyle: 'solid',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        opacity: 1
      }
    },
    {
      id: 'quality-low',
      type: 'rectangle',
      position: { x: 450, y: 340 },
      width: 120,
      height: 60,
      label: 'Qualidade\nBAIXA\n⊕⊕⊝⊝',
      style: {
        backgroundColor: '#f59e0b',
        borderColor: '#d97706',
        textColor: '#ffffff',
        borderWidth: 2,
        borderStyle: 'solid',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        opacity: 1
      }
    },
    {
      id: 'quality-very-low',
      type: 'rectangle',
      position: { x: 600, y: 340 },
      width: 120,
      height: 60,
      label: 'Qualidade\nMUITO BAIXA\n⊕⊝⊝⊝',
      style: {
        backgroundColor: '#dc2626',
        borderColor: '#991b1b',
        textColor: '#ffffff',
        borderWidth: 2,
        borderStyle: 'solid',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        opacity: 1
      }
    },
    {
      id: 'recommendation-strong',
      type: 'rectangle',
      position: { x: 250, y: 480 },
      width: 160,
      height: 80,
      label: 'Recomendação\nFORTE\n"Recomendamos"',
      style: {
        backgroundColor: '#1d4ed8',
        borderColor: '#1e40af',
        textColor: '#ffffff',
        borderWidth: 3,
        borderStyle: 'solid',
        fontSize: 13,
        fontWeight: 'bold',
        textAlign: 'center',
        opacity: 1
      }
    },
    {
      id: 'recommendation-weak',
      type: 'rectangle',
      position: { x: 450, y: 480 },
      width: 160,
      height: 80,
      label: 'Recomendação\nFRACA\n"Sugerimos"',
      style: {
        backgroundColor: '#7c3aed',
        borderColor: '#6d28d9',
        textColor: '#ffffff',
        borderWidth: 3,
        borderStyle: 'solid',
        fontSize: 13,
        fontWeight: 'bold',
        textAlign: 'center',
        opacity: 1
      }
    }
  ] as DiagramTemplateNode[],
  connections: [
    {
      source: 'evidence-base',
      target: 'risk-bias',
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
      source: 'risk-bias',
      target: 'inconsistency',
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
      source: 'risk-bias',
      target: 'directness',
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
      source: 'inconsistency',
      target: 'precision',
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
      source: 'directness',
      target: 'precision',
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
      source: 'quality-high',
      target: 'recommendation-strong',
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
      source: 'quality-moderate',
      target: 'recommendation-strong',
      style: {
        strokeColor: '#10b981',
        strokeWidth: 2,
        strokeStyle: 'dashed',
        arrowType: 'arrow',
        curved: true,
        opacity: 1
      }
    },
    {
      source: 'quality-moderate',
      target: 'recommendation-weak',
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
      source: 'quality-low',
      target: 'recommendation-weak',
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
      source: 'quality-very-low',
      target: 'recommendation-weak',
      style: {
        strokeColor: '#dc2626',
        strokeWidth: 2,
        strokeStyle: 'dashed',
        arrowType: 'arrow',
        curved: true,
        opacity: 1
      }
    }
  ] as DiagramTemplateConnection[]
};
