
// ABOUTME: Central export for all diagram templates
// Aggregates all available templates for easy import

import { clinicalDecisionTreeTemplate } from './clinicalDecisionTree';
import { rctStudyFlowTemplate } from './rctStudyFlow';
import { inclusionExclusionCriteriaTemplate } from './inclusionExclusionCriteria';
import { gradeRecommendationTemplate } from './gradeRecommendation';
import { studyTimelineTemplate } from './studyTimeline';
import { picodMapTemplate } from './picodMap';
import { barriersAndFacilitatorsTemplate } from './barriersAndFacilitators';

export const diagramTemplates = [
  clinicalDecisionTreeTemplate,
  rctStudyFlowTemplate,
  inclusionExclusionCriteriaTemplate,
  gradeRecommendationTemplate,
  studyTimelineTemplate,
  picodMapTemplate,
  barriersAndFacilitatorsTemplate
];

export {
  clinicalDecisionTreeTemplate,
  rctStudyFlowTemplate,
  inclusionExclusionCriteriaTemplate,
  gradeRecommendationTemplate,
  studyTimelineTemplate,
  picodMapTemplate,
  barriersAndFacilitatorsTemplate
};
