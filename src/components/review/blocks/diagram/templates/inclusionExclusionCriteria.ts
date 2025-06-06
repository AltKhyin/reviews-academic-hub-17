
// ABOUTME: Inclusion/exclusion criteria template for study participant selection
// Visual funnel showing screening process with clear criteria

import { DiagramNode, DiagramConnection } from '@/types/review';

export const inclusionExclusionCriteriaTemplate = {
  id: 'inclusion-exclusion-criteria',
  name: 'Critérios de Inclusão/Exclusão',
  description: 'Visualiza critérios do estudo em forma de triagem',
  category: 'study-design',
  nodes: [
    {
      id: 'population',
      type: 'rectangle',
      position: { x: 350, y: 50 },
      size: { width: 200, height: 70 },
      text: 'População Alvo\n(N = ___)',
      style: {
        backgroundColor: '#6b7280',
        borderColor: '#4b5563',
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
      id: 'inclusion-1',
      type: 'diamond',
      position: { x: 300, y: 170 },
      size: { width: 300, height: 80 },
      text: 'Critério de Inclusão 1:\nIdade ≥ 18 anos',
      style: {
        backgroundColor: '#10b981',
        borderColor: '#059669',
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
      id: 'excluded-age',
      type: 'rectangle',
      position: { x: 700, y: 180 },
      size: { width: 150, height: 60 },
      text: 'Excluídos:\nIdade < 18\n(n = ___)',
      style: {
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
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
      id: 'inclusion-2',
      type: 'diamond',
      position: { x: 300, y: 300 },
      size: { width: 300, height: 80 },
      text: 'Critério de Inclusão 2:\nDiagnóstico confirmado',
      style: {
        backgroundColor: '#10b981',
        borderColor: '#059669',
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
      id: 'excluded-diagnosis',
      type: 'rectangle',
      position: { x: 700, y: 310 },
      size: { width: 150, height: 60 },
      text: 'Excluídos:\nSem diagnóstico\n(n = ___)',
      style: {
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
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
      id: 'exclusion-1',
      type: 'diamond',
      position: { x: 300, y: 430 },
      size: { width: 300, height: 80 },
      text: 'Critério de Exclusão:\nGravidez ou comorbidade grave',
      style: {
        backgroundColor: '#f59e0b',
        borderColor: '#d97706',
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
      id: 'excluded-comorbidity',
      type: 'rectangle',
      position: { x: 700, y: 440 },
      size: { width: 150, height: 60 },
      text: 'Excluídos:\nComorbidades\n(n = ___)',
      style: {
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
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
      id: 'consent',
      type: 'diamond',
      position: { x: 300, y: 560 },
      size: { width: 300, height: 80 },
      text: 'Consentimento Informado\nAssinado',
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
      id: 'refused-consent',
      type: 'rectangle',
      position: { x: 700, y: 570 },
      size: { width: 150, height: 60 },
      text: 'Recusaram:\nNão consentiram\n(n = ___)',
      style: {
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
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
      id: 'final-sample',
      type: 'rectangle',
      position: { x: 350, y: 700 },
      size: { width: 200, height: 70 },
      text: 'Amostra Final\nElegível\n(n = ___)',
      style: {
        backgroundColor: '#059669',
        borderColor: '#047857',
        textColor: '#ffffff',
        borderWidth: 3,
        borderStyle: 'solid',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        opacity: 1
      }
    }
  ] as DiagramNode[],
  connections: [
    {
      id: 'conn1',
      sourceNodeId: 'population',
      targetNodeId: 'inclusion-1',
      sourcePoint: 'bottom',
      targetPoint: 'top',
      style: {
        strokeColor: '#6b7280',
        strokeWidth: 3,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: false,
        opacity: 1
      }
    },
    {
      id: 'conn2',
      sourceNodeId: 'inclusion-1',
      targetNodeId: 'excluded-age',
      sourcePoint: 'right',
      targetPoint: 'left',
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
      id: 'conn3',
      sourceNodeId: 'inclusion-1',
      targetNodeId: 'inclusion-2',
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
      id: 'conn4',
      sourceNodeId: 'inclusion-2',
      targetNodeId: 'excluded-diagnosis',
      sourcePoint: 'right',
      targetPoint: 'left',
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
      id: 'conn5',
      sourceNodeId: 'inclusion-2',
      targetNodeId: 'exclusion-1',
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
      id: 'conn6',
      sourceNodeId: 'exclusion-1',
      targetNodeId: 'excluded-comorbidity',
      sourcePoint: 'right',
      targetPoint: 'left',
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
      id: 'conn7',
      sourceNodeId: 'exclusion-1',
      targetNodeId: 'consent',
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
      id: 'conn8',
      sourceNodeId: 'consent',
      targetNodeId: 'refused-consent',
      sourcePoint: 'right',
      targetPoint: 'left',
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
      id: 'conn9',
      sourceNodeId: 'consent',
      targetNodeId: 'final-sample',
      sourcePoint: 'bottom',
      targetPoint: 'top',
      style: {
        strokeColor: '#059669',
        strokeWidth: 3,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: false,
        opacity: 1
      }
    }
  ] as DiagramConnection[]
};
