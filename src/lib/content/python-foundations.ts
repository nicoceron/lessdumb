import { pythonFoundationsCatalog } from '../courses/python-foundations';
import { withKnowledgePoints } from '../knowledge-points';
import { knowledgePoints as pythonFoundations } from '../knowledge-points/python-foundations.kp';

/** Python foundations: every lesson, point, exercise, and card. Loaded on demand. */
export default withKnowledgePoints(pythonFoundationsCatalog, {
  'python-foundations.kp.ts': pythonFoundations,
});
