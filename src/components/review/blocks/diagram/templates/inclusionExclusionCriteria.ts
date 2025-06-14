
// ABOUTME: Inclusion/exclusion criteria template for study participant selection
// Visual funnel showing screening process with clear criteria

import { DiagramTemplateNode, DiagramTemplateConnection } from '@/types/review';

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
      width: 200,
      height: 70,
      label: 'População Alvo\n(N = ___)',
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
      width: 300,
      height: 80,
      label: 'Critério de Inclusão 1:\nIdade ≥ 18 anos',
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
      width: 150,
      height: 60,
      label: 'Excluídos:\nIdade < 18\n(n = ___)',
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
      width: 300,
      height: 80,
      label: 'Critério de Inclusão 2:\nDiagnóstico confirmado',
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
      width: 150,
      height: 60,
      label: 'Excluídos:\nSem diagnóstico\n(n = ___)',
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
      width: 300,
      height: 80,
      label: 'Critério de Exclusão:\nGravidez ou comorbidade grave',
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
      width: 150,
      height: 60,
      label: 'Excluídos:\nComorbidades\n(n = ___)',
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
      width: 300,
      height: 80,
      label: 'Consentimento Informado\nAssinado',
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
      width: 150,
      height: 60,
      label: 'Recusaram:\nNão consentiram\n(n = ___)',
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
      width: 200,
      height: 70,
      label: 'Amostra Final\nElegível\n(n = ___)',
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
  ] as DiagramTemplateNode[],
  connections: [
    {
      source: 'population',
      target: 'inclusion-1',
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
      source: 'inclusion-1',
      target: 'excluded-age',
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
      source: 'inclusion-1',
      target: 'inclusion-2',
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
      source: 'inclusion-2',
      target: 'excluded-diagnosis',
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
      source: 'inclusion-2',
      target: 'exclusion-1',
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
      source: 'exclusion-1',
      target: 'excluded-comorbidity',
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
      source: 'exclusion-1',
      target: 'consent',
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
      source: 'consent',
      target: 'refused-consent',
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
      source: 'consent',
      target: 'final-sample',
      style: {
        strokeColor: '#059669',
        strokeWidth: 3,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: false,
        opacity: 1
      }
    }
  ] as DiagramTemplateConnection[]
};
