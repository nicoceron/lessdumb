import { dataAnalysisCatalog } from '../courses/data-analysis';
import { withKnowledgePoints, withMultistep } from '../knowledge-points';
import { knowledgePoints as dataAnalysis } from '../knowledge-points/data-analysis.kp';
import { multistepProblems as dataAnalysisMultistep } from '../knowledge-points/data-analysis.multistep';

/** Python for Data Analysis: every lesson, point, exercise, and card. Loaded on demand. */
export default withMultistep(
  withKnowledgePoints(dataAnalysisCatalog, {
    'data-analysis.kp.ts': dataAnalysis,
  }),
  { 'data-analysis.multistep.ts': dataAnalysisMultistep },
);
