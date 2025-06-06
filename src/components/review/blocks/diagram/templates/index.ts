
// ABOUTME: Central export for all diagram templates
// Aggregates all available templates for easy import

import { clinicalDecisionTreeTemplate } from './clinicalDecisionTree';
import { rctStudyFlowTemplate } from './rctStudyFlow';
import { inclusionExclusionCriteriaTemplate } from './inclusionExclusionCriteria';
import { gradeRecommendationTemplate } from './gradeRecommendation';
import { studyTimelineTemplate } from './studyTimeline';
import { picodMapTemplate } from './picodMap';
import { barriersAndFacilitatorsTemplate } from './barriersAndFacilitators';
import { networkMetaAnalysisTemplate } from './networkMetaAnalysis';
import { causalChainTemplate } from './causalChain';
import { prismaFlowTemplate } from './prismaFlow';

export const diagramTemplates = [
  clinicalDecisionTreeTemplate,
  rctStudyFlowTemplate,
  inclusionExclusionCriteriaTemplate,
  gradeRecommendationTemplate,
  studyTimelineTemplate,
  picodMapTemplate,
  barriersAndFacilitatorsTemplate,
  networkMetaAnalysisTemplate,
  causalChainTemplate,
  prismaFlowTemplate
];

export {
  clinicalDecisionTreeTemplate,
  rctStudyFlowTemplate,
  inclusionExclusionCriteriaTemplate,
  gradeRecommendationTemplate,
  studyTimelineTemplate,
  picodMapTemplate,
  barriersAndFacilitatorsTemplate,
  networkMetaAnalysisTemplate,
  causalChainTemplate,
  prismaFlowTemplate
};
