import { machineLearningCatalog } from '../courses/machine-learning';
import { withKnowledgePoints, withMultistep } from '../knowledge-points';
import { knowledgePoints as machineLearning } from '../knowledge-points/machine-learning.kp';
import { multistepProblems as machineLearningMultistep } from '../knowledge-points/machine-learning.multistep';

/** Machine Learning: every lesson, point, exercise, and card. Loaded on demand. */
export default withMultistep(
  withKnowledgePoints(machineLearningCatalog, {
    'machine-learning.kp.ts': machineLearning,
  }),
  { 'machine-learning.multistep.ts': machineLearningMultistep },
);
