import { quantitativeCatalog } from '../courses/quantitative';
import { withKnowledgePoints } from '../knowledge-points';
import { knowledgePoints as quantitativeFoundations } from '../knowledge-points/quantitative-foundations.kp';
import { generators as quantitativeGenerators } from '../knowledge-points/quantitative-foundations.gen';

/** Quantitative foundations: every lesson, point, exercise, and card. Loaded on demand. */
export default withKnowledgePoints(
  quantitativeCatalog,
  { 'quantitative-foundations.kp.ts': quantitativeFoundations },
  { 'quantitative-foundations.gen.ts': quantitativeGenerators },
);
