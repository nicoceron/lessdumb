import { quantitativeCatalog } from '../courses/quantitative';
import { withKnowledgePoints, withMultistep } from '../knowledge-points';
import { knowledgePoints as quantitativeFoundations } from '../knowledge-points/quantitative-foundations.kp';
import { generators as quantitativeGenerators } from '../knowledge-points/quantitative-foundations.gen';
import { multistepProblems as quantitativeMultistep } from '../knowledge-points/quantitative-foundations.multistep';

/** Quantitative foundations: every lesson, point, exercise, and card. Loaded on demand. */
export default withMultistep(
  withKnowledgePoints(
    quantitativeCatalog,
    { 'quantitative-foundations.kp.ts': quantitativeFoundations },
    { 'quantitative-foundations.gen.ts': quantitativeGenerators },
  ),
  { 'quantitative-foundations.multistep.ts': quantitativeMultistep },
);
