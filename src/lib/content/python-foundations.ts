import { pythonFoundationsCatalog } from '../courses/python-foundations';
import { withKnowledgePoints, withMultistep } from '../knowledge-points';
import { knowledgePoints as pythonFoundations } from '../knowledge-points/python-foundations.kp';
import { generators as pythonGenerators } from '../knowledge-points/python-foundations.gen';
import { multistepProblems as pythonMultistep } from '../knowledge-points/python-foundations.multistep';

/** Python foundations: every lesson, point, exercise, and card. Loaded on demand. */
export default withMultistep(
  withKnowledgePoints(
    pythonFoundationsCatalog,
    { 'python-foundations.kp.ts': pythonFoundations },
    { 'python-foundations.gen.ts': pythonGenerators },
  ),
  { 'python-foundations.multistep.ts': pythonMultistep },
);
