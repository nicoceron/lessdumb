import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Lightbulb,
} from 'lucide-react';
import type { Skill } from '../lib/curriculum';
import { workedExampleSteps } from '../lib/lesson-content';
import { codeLanguage, codeLanguageLabels } from '../lib/code-language';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockTitle,
  CodeBlockCopyButton,
} from '@/components/reui/code-block/code-block';

export function lessonIntroductionCount(skill: Skill) {
  return Math.max(1, skill.lesson.paragraphs.length);
}

export default function LessonPlayer({
  skill,
  slideIndex,
  onSlideChange,
  onPractice,
  returningToPractice,
}: {
  skill: Skill;
  slideIndex: number;
  onSlideChange: (index: number) => void;
  onPractice: () => void;
  returningToPractice: boolean;
}) {
  const introCount = lessonIntroductionCount(skill);
  const steps = workedExampleSteps(skill);
  const total = introCount + steps.length;
  const index = Math.min(Math.max(0, slideIndex), total - 1);
  const isIntroduction = index < introCount;
  const exampleIndex = index - introCount;
  const step = steps[exampleIndex];
  const isScenario = skill.lesson.example.kind === 'text';
  const language = codeLanguage(skill.lesson.example.language);
  const last = index === total - 1;

  return (
    <Card className="lesson-paper lesson-player gap-0 py-0">
      <div
        className={`lesson-section-band ${isIntroduction ? 'is-introduction' : 'is-example'}`}
      >
        {isIntroduction ? <BookOpen size={18} /> : <Lightbulb size={18} />}
        <span>
          {isIntroduction
            ? 'Introduction'
            : isScenario
              ? 'Worked scenario'
              : 'Worked example'}
        </span>
        <span className="lesson-section-page">
          {isIntroduction ? index + 1 : exampleIndex + 1} /{' '}
          {isIntroduction ? introCount : steps.length}
        </span>
      </div>
      <section
        className="lesson-slide"
        aria-label="Instructional slide"
        aria-live="polite"
      >
        {isIntroduction ? (
          <>
            <Badge variant="outline">
              {index === 0 ? 'The idea' : 'How it works'}
            </Badge>
            <h1>{skill.title}</h1>
            <p className="lesson-teaching-text">
              {skill.lesson.paragraphs[index] ?? skill.summary}
            </p>
            <div className="lesson-takeaway">
              <Lightbulb size={20} />
              <div>
                <strong>What you’re learning</strong>
                <p>{skill.summary}</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="worked-step-label">
              <span>{exampleIndex + 1}</span> Follow the example
            </div>
            <h1>{step.title}</h1>
            <p className="lesson-teaching-text">{step.explanation}</p>
            {step.code !== undefined && (
              <CodeBlock
                code={step.code}
                language={isScenario ? 'text' : language}
                highlight={!isScenario}
                defaultWrap
                className="lesson-example-code"
              >
                <CodeBlockHeader>
                  <CodeBlockTitle>
                    {skill.lesson.example.label ??
                      (isScenario ? 'SCENARIO' : codeLanguageLabels[language])}
                  </CodeBlockTitle>
                  <CodeBlockCopyButton className="ml-auto" />
                </CodeBlockHeader>
              </CodeBlock>
            )}
            {step.output !== undefined && (
              <div className="worked-result">
                <div className="worked-result-label">
                  <Check size={16} /> {isScenario ? 'Decision' : 'Result'}
                </div>
                <CodeBlock
                  code={step.output}
                  language="text"
                  highlight={false}
                  defaultWrap
                />
              </div>
            )}
            <Accordion type="single" collapsible className="mt-5">
              <AccordionItem value="complete-example">
                <AccordionTrigger>
                  {isScenario
                    ? 'Read the complete scenario'
                    : 'Read the complete program'}
                </AccordionTrigger>
                <AccordionContent>
                  <CodeBlock
                    code={skill.lesson.example.code}
                    language={isScenario ? 'text' : language}
                    highlight={!isScenario}
                    defaultWrap
                  >
                    <CodeBlockHeader>
                      <CodeBlockTitle>
                        {skill.lesson.example.label ??
                          (isScenario
                            ? 'SCENARIO'
                            : codeLanguageLabels[language])}
                      </CodeBlockTitle>
                      <CodeBlockCopyButton className="ml-auto" />
                    </CodeBlockHeader>
                  </CodeBlock>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        )}
      </section>
      <div className="lesson-player-controls">
        <Button
          variant="outline"
          onClick={() => onSlideChange(index - 1)}
          disabled={index === 0}
        >
          <ArrowLeft size={16} /> Previous slide
        </Button>
        <span className="lesson-slide-count">
          Slide {index + 1} of {total}
        </span>
        {last ? (
          <Button onClick={onPractice}>
            Let’s try it <ArrowRight size={16} />
          </Button>
        ) : (
          <Button onClick={() => onSlideChange(index + 1)}>
            Next slide <ArrowRight size={16} />
          </Button>
        )}
      </div>
      {!last && (
        <div className="lesson-practice-shortcut">
          <span>
            {returningToPractice
              ? 'Your current question is waiting.'
              : 'Practice when you’re ready.'}
          </span>
          <Button variant="link" onClick={onPractice}>
            {returningToPractice ? 'Return to practice' : 'Let’s try it'}{' '}
            <ArrowRight size={15} />
          </Button>
        </div>
      )}
    </Card>
  );
}
