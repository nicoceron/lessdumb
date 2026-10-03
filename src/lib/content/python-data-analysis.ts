import { dataAnalysisCatalog } from '../courses/data-analysis';
import { withKnowledgePoints } from '../knowledge-points';
import { knowledgePoints as dataAnalysis } from '../knowledge-points/data-analysis.kp';

/** Python for Data Analysis: every lesson, point, exercise, and card. Loaded on demand. */
export default withKnowledgePoints(dataAnalysisCatalog, {
  'data-analysis.kp.ts': dataAnalysis,
});
