import { rustCatalog } from '../courses/rust';
import { withKnowledgePoints, withMultistep } from '../knowledge-points';
import { knowledgePoints as rust1 } from '../knowledge-points/rust-1.kp';
import { knowledgePoints as rust2 } from '../knowledge-points/rust-2.kp';
import { generators as rustGenerators } from '../knowledge-points/rust.gen';
import { multistepProblems as rustMultistep } from '../knowledge-points/rust.multistep';

/** Rust: every lesson, point, exercise, and card. Loaded on demand. */
export default withMultistep(
  withKnowledgePoints(
    rustCatalog,
    {
      'rust-1.kp.ts': rust1,
      'rust-2.kp.ts': rust2,
    },
    { 'rust.gen.ts': rustGenerators },
  ),
  { 'rust.multistep.ts': rustMultistep },
);
