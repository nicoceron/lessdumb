import { cppCatalog } from '../courses/cpp';
import { withKnowledgePoints } from '../knowledge-points';
import { knowledgePoints as cpp1 } from '../knowledge-points/cpp-1.kp';
import { knowledgePoints as cpp2 } from '../knowledge-points/cpp-2.kp';
import { knowledgePoints as cpp3 } from '../knowledge-points/cpp-3.kp';

/** C++: every lesson, point, exercise, and card. Loaded on demand. */
export default withKnowledgePoints(cppCatalog, {
  'cpp-1.kp.ts': cpp1,
  'cpp-2.kp.ts': cpp2,
  'cpp-3.kp.ts': cpp3,
});
