import type { ReactNode } from 'react';
import type { CodeLanguage, MultistepProblem } from '../lib/curriculum';
import { codeLanguageLabels } from '../lib/code-language';
import { InlineText } from './inline-text';
import { Card } from '@/components/ui/card';
import {
  CodeBlock,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from '@/components/reui/code-block/code-block';

// A multistep problem (CEN-163) on the review page and in quizzes: one card
// with the problem's title and shared setup, shown once, then its parts in
// order. The parts are the pages' own question views, nested in the card.

/** A multistep problem's shared setup: prose, then its code, output, or data. */
export function ProblemSetup({
  problem,
  language,
}: {
  problem: MultistepProblem;
  language: CodeLanguage;
}) {
  const { setup } = problem;
  return (
    <div className="multistep-setup">
      {setup.text.map((paragraph, index) => (
        <p className="lesson-teaching-text" key={index}>
          <InlineText text={paragraph} />
        </p>
      ))}
      {setup.code && (
        <CodeBlock code={setup.code} language={language} defaultWrap>
          <CodeBlockHeader>
            <CodeBlockTitle>{codeLanguageLabels[language]}</CodeBlockTitle>
            <CodeBlockCopyButton className="ml-auto" />
          </CodeBlockHeader>
        </CodeBlock>
      )}
      {setup.output !== undefined && (
        <CodeBlock
          code={setup.output}
          language="text"
          highlight={false}
          defaultWrap
        >
          <CodeBlockHeader>
            <CodeBlockTitle>OUTPUT</CodeBlockTitle>
          </CodeBlockHeader>
        </CodeBlock>
      )}
      {setup.data !== undefined && (
        <CodeBlock
          code={setup.data}
          language="text"
          highlight={false}
          defaultWrap
        >
          <CodeBlockHeader>
            <CodeBlockTitle>DATA</CodeBlockTitle>
          </CodeBlockHeader>
        </CodeBlock>
      )}
    </div>
  );
}

/**
 * One card for a multistep problem: its title and setup, then its parts as
 * an ordered list. `children` are the parts reached so far, each an `li`.
 */
export function ProblemCard({
  id,
  eyebrow,
  problem,
  language,
  children,
}: {
  /** The heading's ID: the card is labelled by it, and focus can land on it. */
  id: string;
  eyebrow: string;
  problem: MultistepProblem;
  language: CodeLanguage;
  children: ReactNode;
}) {
  return (
    <Card
      className="lesson-paper multistep-problem gap-0"
      role="group"
      aria-labelledby={id}
    >
      <div className="multistep-head">
        <span className="lesson-point-eyebrow">{eyebrow}</span>
        <h3 id={id} tabIndex={-1}>
          {problem.title}
        </h3>
        <p className="lesson-plan-note">
          {problem.parts.length} parts, answered in order. Each part uses a
          different idea you have learned.
        </p>
      </div>
      <ProblemSetup problem={problem} language={language} />
      <ol className="multistep-parts" aria-label="Parts">
        {children}
      </ol>
    </Card>
  );
}
