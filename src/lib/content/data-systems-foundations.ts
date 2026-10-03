import { dataSystemsCatalog } from '../courses/data-systems';
import { withKnowledgePoints } from '../knowledge-points';
import { knowledgePoints as dataSystems } from '../knowledge-points/data-systems.kp';

/** Data Systems: every lesson, point, exercise, and card. Loaded on demand. */
export default withKnowledgePoints(dataSystemsCatalog, {
  'data-systems.kp.ts': dataSystems,
});
