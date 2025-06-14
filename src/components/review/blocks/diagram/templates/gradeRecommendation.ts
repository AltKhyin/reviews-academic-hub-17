
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
      size: { width: 180, height: 80 },
      text: 'Base de Evidência\n• RCTs: ___\n• Estudos observacionais: ___\n• Outros: ___',
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
      size: { width: 160, height: 80 },
      text: 'Risco de Viés\nBaixo?',
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
      size: { width: 160, height: 80 },
      text: 'Consistência\nEntre Estudos?',
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
      size: { width: 160, height: 80 },
      text: 'Evidência\nDireta?',
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
      size: { width: 160, height: 80 },
      text: 'Precisão\nAdequada?',
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
      size: { width: 120, height: 60 },
      text: 'Qualidade\nALTA\n⊕⊕⊕⊕',
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
      size: { width: 120, height: 60 },
      text: 'Qualidade\nMODERADA\n⊕⊕⊕⊝',
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
      size: { width: 120, height: 60 },
      text: 'Qualidade\nBAIXA\n⊕⊕⊝⊝',
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
      size: { width: 120, height: 60 },
      text: 'Qualidade\nMUITO BAIXA\n⊕⊝⊝⊝',
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
      size: { width: 160, height: 80 },
      text: 'Recomendação\nFORTE\n"Recomendamos"',
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
      size: { width: 160, height: 80 },
      text: 'Recomendação\nFRACA\n"Sugerimos"',
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
      id: 'conn1',
      sourceNodeId: 'evidence-base',
      targetNodeId: 'risk-bias',
      sourcePoint: 'right',
      targetPoint: 'left',
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
      id: 'conn2',
      sourceNodeId: 'risk-bias',
      targetNodeId: 'inconsistency',
      sourcePoint: 'right',
      targetPoint: 'left',
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
      id: 'conn3',
      sourceNodeId: 'risk-bias',
      targetNodeId: 'directness',
      sourcePoint: 'bottom',
      targetPoint: 'top',
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
      id: 'conn4',
      sourceNodeId: 'inconsistency',
      targetNodeId: 'precision',
      sourcePoint: 'bottom',
      targetPoint: 'top',
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
      id: 'conn5',
      sourceNodeId: 'directness',
      targetNodeId: 'quality-high',
      sourcePoint: 'bottom',
      targetPoint: 'top',
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
      id: 'conn6',
      sourceNodeId: 'directness',
      targetNodeId: 'quality-moderate',
      sourcePoint: 'bottom',
      targetPoint: 'top',
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
      id: 'conn7',
      sourceNodeId: 'precision',
      targetNodeId: 'quality-low',
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
      id: 'conn8',
      sourceNodeId: 'precision',
      targetNodeId: 'quality-very-low',
      sourcePoint: 'bottom',
      targetPoint: 'top',
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
      id: 'conn9',
      sourceNodeId: 'quality-high',
      targetNodeId: 'recommendation-strong',
      sourcePoint: 'bottom',
      targetPoint: 'top',
      style: {
        strokeColor: '#1d4ed8',
        strokeWidth: 3,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: true,
        opacity: 1
      }
    },
    {
      id: 'conn10',
      sourceNodeId: 'quality-moderate',
      targetNodeId: 'recommendation-strong',
      sourcePoint: 'bottom',
      targetPoint: 'top',
      style: {
        strokeColor: '#1d4ed8',
        strokeWidth: 2,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: false,
        opacity: 1
      }
    },
    {
      id: 'conn11',
      sourceNodeId: 'quality-low',
      targetNodeId: 'recommendation-weak',
      sourcePoint: 'bottom',
      targetPoint: 'top',
      style: {
        strokeColor: '#7c3aed',
        strokeWidth: 2,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: false,
        opacity: 1
      }
    },
    {
      id: 'conn12',
      sourceNodeId: 'quality-very-low',
      targetNodeId: 'recommendation-weak',
      sourcePoint: 'bottom',
      targetPoint: 'top',
      style: {
        strokeColor: '#7c3aed',
        strokeWidth: 2,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: true,
        opacity: 1
      }
    }
  ] as DiagramTemplateConnection[]
};
