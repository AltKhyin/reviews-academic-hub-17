
// ABOUTME: PICOD map template for research question structure visualization
// Organizes Population, Intervention, Comparison, Outcome, Design elements

import { DiagramTemplateNode, DiagramTemplateConnection } from '@/types/review';

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
      width: 160,
      height: 80,
      label: 'Pergunta de\nPesquisa',
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
      width: 180,
      height: 120,
      label: 'POPULAÇÃO (P)\n• Idade: ___\n• Sexo: ___\n• Condição: ___\n• Critérios: ___',
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
      width: 180,
      height: 120,
      label: 'INTERVENÇÃO (I)\n• Tipo: ___\n• Dose/Intensidade: ___\n• Duração: ___\n• Via/Método: ___',
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
      width: 180,
      height: 120,
      label: 'COMPARAÇÃO (C)\n• Controle: ___\n• Placebo: ___\n• Tratamento padrão: ___\n• Sem intervenção: ___',
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
      width: 180,
      height: 120,
      label: 'DESFECHOS (O)\n• Primário: ___\n• Secundários: ___\n• Tempo de medida: ___\n• Instrumentos: ___',
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
      width: 180,
      height: 120,
      label: 'DESENHO (D)\n• Tipo: ___\n• Randomização: ___\n• Cegamento: ___\n• Follow-up: ___',
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
      width: 180,
      height: 120,
      label: 'CONTEXTO\n• Setting: ___\n• País/Região: ___\n• Sistema de saúde: ___\n• Recursos: ___',
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
  ] as DiagramTemplateNode[],
  connections: [
    {
      source: 'research-question',
      target: 'population',
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
      source: 'research-question',
      target: 'intervention',
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
      source: 'research-question',
      target: 'comparison',
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
      source: 'population',
      target: 'outcomes',
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
      source: 'intervention',
      target: 'design',
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
      source: 'comparison',
      target: 'context',
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
      source: 'outcomes',
      target: 'design',
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
      source: 'design',
      target: 'context',
      style: {
        strokeColor: '#6b7280',
        strokeWidth: 1,
        strokeStyle: 'dashed',
        arrowType: 'none',
        curved: false,
        opacity: 0.7
      }
    }
  ] as DiagramTemplateConnection[]
};
