import { dataAnalysisCatalog } from '../courses/data-analysis';
import { withKnowledgePoints } from '../knowledge-points';
import { knowledgePoints as dataAnalysis } from '../knowledge-points/data-analysis.kp';
import { generators as dataAnalysisGenerators } from '../knowledge-points/data-analysis.gen';

/** Python for Data Analysis: every lesson, point, exercise, and card. Loaded on demand. */
export default withKnowledgePoints(
  dataAnalysisCatalog,
  { 'data-analysis.kp.ts': dataAnalysis },
  { 'data-analysis.gen.ts': dataAnalysisGenerators },
);
