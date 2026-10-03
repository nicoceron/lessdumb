import { cppCatalog } from '../courses/cpp';
import { withKnowledgePoints, withMultistep } from '../knowledge-points';
import { knowledgePoints as cpp1 } from '../knowledge-points/cpp-1.kp';
import { knowledgePoints as cpp2 } from '../knowledge-points/cpp-2.kp';
import { knowledgePoints as cpp3 } from '../knowledge-points/cpp-3.kp';
import { generators as cppGenerators } from '../knowledge-points/cpp.gen';
import { multistepProblems as cppMultistep } from '../knowledge-points/cpp.multistep';

/** C++: every lesson, point, exercise, and card. Loaded on demand. */
export default withMultistep(
  withKnowledgePoints(
    cppCatalog,
    {
      'cpp-1.kp.ts': cpp1,
      'cpp-2.kp.ts': cpp2,
      'cpp-3.kp.ts': cpp3,
    },
    { 'cpp.gen.ts': cppGenerators },
  ),
  { 'cpp.multistep.ts': cppMultistep },
);
