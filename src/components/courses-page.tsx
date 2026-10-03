import { useMemo, useState } from 'react';
import { ArrowUpRight, Check, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { courses } from '../lib/curriculum';
import {
  courseMastery,
  courseOutline,
  courseSequence,
  skillStatusLabels,
  type SkillStatus,
} from '../lib/dashboard';
import { type LearnerState } from '../lib/state';
import { ProgressRing } from './progress-ring';

const count = (n: number, noun: string) => `${n} ${noun}${n === 1 ? '' : 's'}`;

function StatusCircle({ status }: { status: SkillStatus }) {
  return (
    <span
      className={`status-circle ${status}`}
      title={skillStatusLabels[status]}
    >
      {status === 'mastered' ? (
        <Check size={12} strokeWidth={3} aria-hidden="true" />
      ) : status === 'locked' ? (
        <LockKeyhole size={10} aria-hidden="true" />
      ) : null}
      <span className="sr-only">{skillStatusLabels[status]}</span>
    </span>
  );
}

export function Courses({
  state,
  update,
}: {
  state: LearnerState;
  update: (fn: (s: LearnerState) => LearnerState) => void;
}) {
  const activeId = courses.some((c) => c.id === state.activeCourseId)
    ? state.activeCourseId!
    : courses[0].id;
  const [viewId, setViewId] = useState(() => {
    const requested = new URLSearchParams(window.location.search).get('course');
    return courses.some((c) => c.id === requested) ? requested! : activeId;
  });
  const course = courses.find((c) => c.id === viewId) ?? courses[0];
  const { progress } = state;
  const view = useMemo(
    () => ({
      sequence: courseSequence(course.id),
      outline: courseOutline(progress, course.id),
      mastery: courseMastery(progress, course),
      percents: Object.fromEntries(
        courses.map((c) => [c.id, courseMastery(progress, c).percent]),
      ),
    }),
    [progress, course],
  );
  const firstOpen = view.outline.find((unit) => unit.mastered < unit.total);
  function select(id: string) {
    setViewId(id);
    window.history.replaceState(
      window.history.state,
      '',
      `/courses?course=${encodeURIComponent(id)}`,
    );
  }
  return (
    <div className="ma-page">
      <div className="page-heading">
        <h1>Courses</h1>
      </div>
      <div className="ma-courses">
        <aside className="ma-courses-side">
          <section className="ma-panel" aria-labelledby="course-list-heading">
            <h2 id="course-list-heading" className="ma-label ma-panel-label">
              All courses
            </h2>
            <ul className="ma-course-list">
              {courses.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    aria-current={c.id === course.id ? 'true' : undefined}
                    onClick={() => select(c.id)}
                  >
                    <span className="ma-course-list-title">{c.title}</span>
                    {c.id === activeId && (
                      <span className="ma-active-tag">Active</span>
                    )}
                    <span className="ma-course-list-percent">
                      {view.percents[c.id]}%
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
          <section className="ma-panel" aria-labelledby="sequence-heading">
            <h2 id="sequence-heading" className="ma-label ma-panel-label">
              Course sequence
            </h2>
            <ol className="ma-sequence">
              {view.sequence.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    aria-current={c.id === course.id ? 'true' : undefined}
                    onClick={() => select(c.id)}
                  >
                    {c.title}
                  </button>
                </li>
              ))}
            </ol>
          </section>
        </aside>
        <section className="ma-course-main" aria-labelledby="course-title">
          <div className="ma-panel ma-course-header">
            <div className="ma-course-header-text">
              <h2 id="course-title">{course.title}</h2>
              <p>
                {view.mastery.mastered} of {view.mastery.total} skills mastered
                · {count(view.outline.length, 'unit')}
              </p>
              {course.resources?.length ? (
                <p className="ma-resources">
                  <span className="ma-label">References</span>
                  {course.resources.map((resource) => (
                    <a
                      key={resource.url}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {resource.label}
                      <ArrowUpRight size={13} aria-hidden="true" />
                    </a>
                  ))}
                </p>
              ) : null}
            </div>
            <div className="ma-course-header-side">
              <ProgressRing
                value={view.mastery.percent}
                label={`${course.title} progress`}
              />
              {course.id === activeId ? (
                <span className="ma-active-course">
                  <Check size={14} aria-hidden="true" /> Active course
                </span>
              ) : (
                <Button
                  size="sm"
                  onClick={() =>
                    update((s) => ({ ...s, activeCourseId: course.id }))
                  }
                >
                  Set as active course
                </Button>
              )}
              {/* Optional: skipping starts from the beginning as usual. */}
              {course.id === activeId &&
                view.mastery.mastered < view.mastery.total && (
                  <Button asChild size="sm" variant="outline">
                    <a href={`/learn?placement=${course.id}`}>
                      Take the placement test
                    </a>
                  </Button>
                )}
            </div>
          </div>
          <Accordion
            key={course.id}
            type="multiple"
            defaultValue={firstOpen ? [firstOpen.unit.id] : []}
            className="ma-units"
          >
            {view.outline.map((entry) => (
              <AccordionItem
                key={entry.unit.id}
                value={entry.unit.id}
                className="ma-panel ma-unit"
              >
                <AccordionTrigger className="items-center gap-3 rounded-md px-4 py-3 hover:no-underline">
                  <span className="ma-unit-number">{entry.number}</span>
                  <span className="ma-unit-body">
                    <span className="ma-unit-title">{entry.unit.title}</span>
                    <span className="ma-unit-meta">
                      {[
                        entry.topics[0]?.title !== null &&
                          count(entry.topics.length, 'topic'),
                        count(entry.total, 'skill'),
                        entry.mastered > 0 && `${entry.mastered} mastered`,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                    <span className="ma-thin-bar" aria-hidden="true">
                      <span
                        style={{
                          width: `${(entry.mastered / Math.max(1, entry.total)) * 100}%`,
                        }}
                      />
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-2 pb-3 [&_a]:no-underline">
                  {entry.topics.map((topic) => (
                    <div key={topic.id} className="ma-topic">
                      {topic.title && (
                        <h3 className="ma-topic-title">
                          <span>{topic.number}</span>
                          {topic.title}
                        </h3>
                      )}
                      <ol className="ma-skill-list">
                        {topic.skills.map((item) => (
                          <li key={item.skill.id}>
                            <a
                              className="ma-skill-row"
                              href={`/graph?skill=${item.skill.id}`}
                            >
                              <StatusCircle status={item.status} />
                              <span className="ma-skill-number">
                                {item.number}
                              </span>
                              <span className="ma-skill-title">
                                {item.skill.title}
                              </span>
                            </a>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </div>
  );
}
