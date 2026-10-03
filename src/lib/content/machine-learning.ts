import { machineLearningCatalog } from '../courses/machine-learning';
import { withKnowledgePoints } from '../knowledge-points';
import { knowledgePoints as machineLearning } from '../knowledge-points/machine-learning.kp';

/** Machine Learning: every lesson, point, exercise, and card. Loaded on demand. */
export default withKnowledgePoints(machineLearningCatalog, {
  'machine-learning.kp.ts': machineLearning,
});
