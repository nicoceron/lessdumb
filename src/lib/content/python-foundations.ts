import { pythonFoundationsCatalog } from '../courses/python-foundations';
import { withKnowledgePoints } from '../knowledge-points';
import { knowledgePoints as pythonFoundations } from '../knowledge-points/python-foundations.kp';
import { generators as pythonGenerators } from '../knowledge-points/python-foundations.gen';

/** Python foundations: every lesson, point, exercise, and card. Loaded on demand. */
export default withKnowledgePoints(
  pythonFoundationsCatalog,
  { 'python-foundations.kp.ts': pythonFoundations },
  { 'python-foundations.gen.ts': pythonGenerators },
);
