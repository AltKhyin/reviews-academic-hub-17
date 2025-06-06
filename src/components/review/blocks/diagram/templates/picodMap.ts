
// ABOUTME: PICOD map template for research question structure visualization
// Organizes Population, Intervention, Comparison, Outcome, Design elements

import { DiagramNode, DiagramConnection } from '@/types/review';

export const picodMapTemplate = {
  id: 'picod-map',
  name: 'Mapa PICOD',
  description: 'Representação gráfica dos 5 elementos centrais do estudo',
  category: 'research-structure',
  nodes: [
    {
      id: 'research-question',
      type: 'circle',
      position: { x: 400, y: 50 },
      size: { width: 160, height: 80 },
      text: 'Pergunta de\nPesquisa',
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
      id: 'population',
      type: 'rectangle',
      position: { x: 100, y: 200 },
      size: { width: 180, height: 120 },
      text: 'POPULAÇÃO (P)\n• Idade: ___\n• Sexo: ___\n• Condição: ___\n• Critérios: ___',
      style: {
        backgroundColor: '#059669',
        borderColor: '#047857',
        textColor: '#ffffff',
        borderWidth: 2,
        borderStyle: 'solid',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'left',
        opacity: 1
      }
    },
    {
      id: 'intervention',
      type: 'rectangle',
      position: { x: 320, y: 200 },
      size: { width: 180, height: 120 },
      text: 'INTERVENÇÃO (I)\n• Tipo: ___\n• Dose/Intensidade: ___\n• Duração: ___\n• Via/Método: ___',
      style: {
        backgroundColor: '#dc2626',
        borderColor: '#991b1b',
        textColor: '#ffffff',
        borderWidth: 2,
        borderStyle: 'solid',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'left',
        opacity: 1
      }
    },
    {
      id: 'comparison',
      type: 'rectangle',
      position: { x: 540, y: 200 },
      size: { width: 180, height: 120 },
      text: 'COMPARAÇÃO (C)\n• Controle: ___\n• Placebo: ___\n• Tratamento padrão: ___\n• Sem intervenção: ___',
      style: {
        backgroundColor: '#7c3aed',
        borderColor: '#6d28d9',
        textColor: '#ffffff',
        borderWidth: 2,
        borderStyle: 'solid',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'left',
        opacity: 1
      }
    },
    {
      id: 'outcomes',
      type: 'rectangle',
      position: { x: 100, y: 380 },
      size: { width: 180, height: 120 },
      text: 'DESFECHOS (O)\n• Primário: ___\n• Secundários: ___\n• Tempo de medida: ___\n• Instrumentos: ___',
      style: {
        backgroundColor: '#f59e0b',
        borderColor: '#d97706',
        textColor: '#ffffff',
        borderWidth: 2,
        borderStyle: 'solid',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'left',
        opacity: 1
      }
    },
    {
      id: 'design',
      type: 'rectangle',
      position: { x: 320, y: 380 },
      size: { width: 180, height: 120 },
      text: 'DESENHO (D)\n• Tipo: ___\n• Randomização: ___\n• Cegamento: ___\n• Follow-up: ___',
      style: {
        backgroundColor: '#0891b2',
        borderColor: '#0e7490',
        textColor: '#ffffff',
        borderWidth: 2,
        borderStyle: 'solid',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'left',
        opacity: 1
      }
    },
    {
      id: 'context',
      type: 'rectangle',
      position: { x: 540, y: 380 },
      size: { width: 180, height: 120 },
      text: 'CONTEXTO\n• Setting: ___\n• País/Região: ___\n• Sistema de saúde: ___\n• Recursos: ___',
      style: {
        backgroundColor: '#6b7280',
        borderColor: '#4b5563',
        textColor: '#ffffff',
        borderWidth: 2,
        borderStyle: 'solid',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'left',
        opacity: 1
      }
    }
  ] as DiagramNode[],
  connections: [
    {
      id: 'conn1',
      sourceNodeId: 'research-question',
      targetNodeId: 'population',
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
      id: 'conn2',
      sourceNodeId: 'research-question',
      targetNodeId: 'intervention',
      sourcePoint: 'bottom',
      targetPoint: 'top',
      style: {
        strokeColor: '#1d4ed8',
        strokeWidth: 3,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: false,
        opacity: 1
      }
    },
    {
      id: 'conn3',
      sourceNodeId: 'research-question',
      targetNodeId: 'comparison',
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
      id: 'conn4',
      sourceNodeId: 'population',
      targetNodeId: 'outcomes',
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
      id: 'conn5',
      sourceNodeId: 'intervention',
      targetNodeId: 'design',
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
      id: 'conn6',
      sourceNodeId: 'comparison',
      targetNodeId: 'context',
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
      id: 'conn7',
      sourceNodeId: 'outcomes',
      targetNodeId: 'design',
      sourcePoint: 'right',
      targetPoint: 'left',
      style: {
        strokeColor: '#6b7280',
        strokeWidth: 1,
        strokeStyle: 'dashed',
        arrowType: 'none',
        curved: false,
        opacity: 0.7
      }
    },
    {
      id: 'conn8',
      sourceNodeId: 'design',
      targetNodeId: 'context',
      sourcePoint: 'right',
      targetPoint: 'left',
      style: {
        strokeColor: '#6b7280',
        strokeWidth: 1,
        strokeStyle: 'dashed',
        arrowType: 'none',
        curved: false,
        opacity: 0.7
      }
    }
  ] as DiagramConnection[]
};
