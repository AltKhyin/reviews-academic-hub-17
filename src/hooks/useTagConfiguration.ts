
// Hook for managing tag configuration in the admin panel
import { useState } from 'react';
import { TagHierarchy } from '@/types/archive';

export const useTagConfiguration = () => {
  const [isEditing, setIsEditing] = useState(false);

  // Temporary hardcoded active configuration until migration is run
  const activeConfig = {
    id: 'temp-config',
    tag_data: {
      "Cardiologia": [
        "Dislipidemia",
        "Estatinas",
        "Hipertensão",
        "Risco cardiovascular"
      ],
      "Endocrinologia": [
        "Diabetes tipo 2",
        "Remissão",
        "Controle glicêmico",
        "Obesidade"
      ],
      "Fisioterapia": [],
      "Fonoaudiologia": [],
      "Psicologia": [
        "Depressão",
        "Psicoterapia",
        "Suporte psicossocial"
      ],
      "Psiquiatria": [
        "Depressão",
        "Psicoterapia",
        "Suporte psicossocial"
      ],
      "Saúde mental": [
        "Escuta ativa",
        "Psicoeducação"
      ],
      "Nutrição": [
        "Educação alimentar",
        "Nutrição clínica",
        "Suplementação"
      ],
      "Atividade física": [
        "Adesão"
      ],
      "Clínica médica": [
        "Nefrologia",
        "Gastroenterologia",
        "Reumatologia",
        "Infectologia",
        "Pneumologia"
      ],
      "Geriatria": [],
      "Pediatria": [
        "Nutrição infantil",
        "Prevenção pediátrica",
        "Rastreios pediátricos"
      ],
      "Medicina de família": [
        "Atenção primária",
        "Seguimento longitudinal"
      ],
      "Decisão compartilhada": [
        "Comunicação clínica"
      ],
      "Saúde pública": [
        "Políticas públicas",
        "Programas populacionais",
        "Ações coletivas",
        "Vacinação"
      ],
      "Farmacologia": [
        "Desprescrição"
      ],
      "Enfermagem": [],
      "Real world evidence": [
        "Estudos pragmáticos",
        "Aplicação clínica",
        "Barreiras de implementação"
      ],
      "Bioestatística": [],
      "Inferência causal": [],
      "Rastreio clínico": [],
      "Testes diagnósticos": [],
      "Odontologia": [],
      "Educação em saúde": [],
      "Hospital": [],
      "Cirurgia": [
        "Ortopedia",
        "Urologia",
        "Cirurgia geral",
        "Indicação cirúrgica",
        "Otorrinologia"
      ]
    } as TagHierarchy,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'temp-user',
    is_active: true,
    version: 1
  };

  // Mock function for creating configuration (will be replaced after migration)
  const createConfiguration = {
    mutateAsync: async (tagData: TagHierarchy) => {
      console.log('Tag configuration would be saved:', tagData);
      // Temporary implementation - just log the data
      return Promise.resolve(tagData);
    },
    isPending: false
  };

  // Validate JSON structure
  const validateTagData = (jsonString: string): { valid: boolean; data?: TagHierarchy; error?: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      
      // Validate structure
      if (typeof parsed !== 'object' || parsed === null) {
        return { valid: false, error: 'Root deve ser um objeto' };
      }

      for (const [key, value] of Object.entries(parsed)) {
        if (typeof key !== 'string') {
          return { valid: false, error: 'Chaves devem ser strings' };
        }
        if (!Array.isArray(value)) {
          return { valid: false, error: `Valor para "${key}" deve ser um array` };
        }
        for (const item of value) {
          if (typeof item !== 'string') {
            return { valid: false, error: `Itens em "${key}" devem ser strings` };
          }
        }
      }

      return { valid: true, data: parsed };
    } catch (e) {
      return { valid: false, error: 'JSON inválido' };
    }
  };

  // Get tag statistics
  const getTagStatistics = async (tagData: TagHierarchy) => {
    const stats = {
      totalCategories: Object.keys(tagData).length,
      totalSubtags: Object.values(tagData).flat().length,
      emptyCategories: Object.entries(tagData).filter(([, subtags]) => subtags.length === 0).length,
      mostPopulatedCategory: '',
      maxSubtags: 0
    };

    Object.entries(tagData).forEach(([category, subtags]) => {
      if (subtags.length > stats.maxSubtags) {
        stats.maxSubtags = subtags.length;
        stats.mostPopulatedCategory = category;
      }
    });

    return stats;
  };

  return {
    configurations: [activeConfig],
    activeConfig,
    isLoading: false,
    isEditing,
    setIsEditing,
    createConfiguration,
    validateTagData,
    getTagStatistics
  };
};
