import { dataSystemsCatalog } from '../courses/data-systems';
import { withKnowledgePoints, withMultistep } from '../knowledge-points';
import { knowledgePoints as dataSystems } from '../knowledge-points/data-systems.kp';
import { multistepProblems as dataSystemsMultistep } from '../knowledge-points/data-systems.multistep';

/** Data Systems: every lesson, point, exercise, and card. Loaded on demand. */
export default withMultistep(
  withKnowledgePoints(dataSystemsCatalog, {
    'data-systems.kp.ts': dataSystems,
  }),
  { 'data-systems.multistep.ts': dataSystemsMultistep },
);
