import { competitiveProgrammingCatalog } from '../courses/competitive-programming';
import { withKnowledgePoints } from '../knowledge-points';
import { knowledgePoints as competitive0 } from '../knowledge-points/competitive-0.kp';
import { knowledgePoints as competitive1 } from '../knowledge-points/competitive-1.kp';
import { knowledgePoints as competitive2 } from '../knowledge-points/competitive-2.kp';
import { knowledgePoints as competitive3 } from '../knowledge-points/competitive-3.kp';

/** Competitive Programming: every lesson, point, exercise, and card. Loaded on demand. */
export default withKnowledgePoints(competitiveProgrammingCatalog, {
  'competitive-0.kp.ts': competitive0,
  'competitive-1.kp.ts': competitive1,
  'competitive-2.kp.ts': competitive2,
  'competitive-3.kp.ts': competitive3,
});
