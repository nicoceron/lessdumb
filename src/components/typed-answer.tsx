import { useId, type KeyboardEvent } from 'react';
import { Check, X } from 'lucide-react';
import type { TypedQuestion } from '../lib/curriculum';
import {
  acceptedAnswer,
  isExactText,
  normalizeText,
  parseNumber,
  TYPED_RESPONSE_MAX_LENGTH,
  typedLines,
  unitSuffix,
} from '../lib/typed-answer';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// The answer field of a numeric or text question, shared by lessons, reviews,
// quizzes, and placement. Enter submits a one-line answer; a multi-line output
// takes Ctrl+Enter (⌘+Enter on a Mac), since Enter starts a new line there.

function hintFor(question: TypedQuestion, multiline: boolean): string {
  const submit = multiline
    ? 'Press Ctrl+Enter or ⌘+Enter to submit.'
    : 'Press Enter to submit.';
  if (question.type === 'numeric')
    return `Type a number, such as 42, -3.5, 3/4, or 1e-3. ${submit}`;
  if (question.checksOutput)
    return multiline
      ? `Type exactly what it prints, one printed line per line. ${submit}`
      : `Type exactly what it prints. ${submit}`;
  const caseFree = isExactText(question)
    ? question.ignoreCase
    : !question.caseSensitive;
  return caseFree ? `Capitalization does not matter. ${submit}` : submit;
}

/** A typed number with its unit, unless the learner already typed it. */
function withUnit(response: string, unit?: string): string {
  if (!unit) return response;
  const suffix = unitSuffix(unit);
  return suffix && response.trim().endsWith(suffix)
    ? response
    : `${response} ${unit}`;
}

export function TypedAnswerInput({
  question,
  value,
  error,
  disabled = false,
  onChange,
  onSubmit,
}: {
  question: TypedQuestion;
  value: string;
  /** Why the last submission could not be graded, such as "not a number". */
  error: string | null;
  disabled?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  const id = useId();
  const lines = typedLines(question);
  const multiline = lines > 1;
  const code = question.type === 'text';
  const unit = question.type === 'numeric' ? question.unit : undefined;
  const describedBy = [`${id}-hint`, unit && `${id}-unit`, `${id}-error`]
    .filter(Boolean)
    .join(' ');
  function keyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
    if (multiline && !event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    if (value.trim()) onSubmit();
  }
  const shared = {
    id,
    value,
    disabled,
    maxLength: TYPED_RESPONSE_MAX_LENGTH,
    autoComplete: 'off',
    autoCorrect: 'off',
    autoCapitalize: 'off',
    spellCheck: false,
    'aria-describedby': describedBy,
    'aria-invalid': error ? true : undefined,
    onKeyDown: keyDown,
  } as const;
  return (
    <div className="typed-answer">
      <label htmlFor={id} className="typed-answer-label">
        Your answer
      </label>
      <div className="typed-answer-field">
        {multiline ? (
          <Textarea
            {...shared}
            rows={lines}
            className="typed-answer-input min-h-11 font-mono text-base md:text-base"
            onChange={(event) => onChange(event.target.value)}
          />
        ) : (
          <Input
            {...shared}
            type="text"
            inputMode={question.type === 'numeric' ? 'decimal' : 'text'}
            enterKeyHint="done"
            className={`typed-answer-input h-11 text-base md:text-base${code ? ' font-mono' : ''}`}
            onChange={(event) => onChange(event.target.value)}
          />
        )}
        {unit && (
          <span id={`${id}-unit`} className="typed-answer-unit">
            {unit}
          </span>
        )}
      </div>
      <p id={`${id}-hint`} className="typed-answer-hint">
        {hintFor(question, multiline)}
      </p>
      <p
        id={`${id}-error`}
        className="typed-answer-error"
        role="status"
        aria-live="polite"
      >
        {error}
      </p>
    </div>
  );
}

/** Whether a correct response reads differently from the accepted answer. */
function differs(question: TypedQuestion, response: string): boolean {
  if (question.type === 'numeric')
    return (
      parseNumber(response, question.unit) !== question.answer ||
      !!question.tolerance
    );
  // Show the canonical spelling when the learner typed an equivalent form.
  const fold = isExactText(question) && !!question.ignoreCase;
  return (
    normalizeText(response, fold) !== normalizeText(question.answers[0], fold)
  );
}

/**
 * An answered typed question, frozen: what the learner typed, whether it was
 * right, and the accepted answer when it was wrong or reads differently.
 */
export function TypedAnswerResult({
  question,
  response,
  correct,
}: {
  question: TypedQuestion;
  response: string;
  correct: boolean;
}) {
  const unit = question.type === 'numeric' ? question.unit : undefined;
  const others =
    question.type === 'text' && !question.checksOutput
      ? question.answers.slice(1)
      : [];
  return (
    <div className="typed-answer is-answered">
      <div
        className={`typed-response ${correct ? 'is-correct' : 'is-incorrect'}`}
      >
        <span className="answer-tag">Your answer</span>
        <pre>{withUnit(response, unit)}</pre>
        {correct ? (
          <Check size={18} aria-hidden="true" />
        ) : (
          <X size={18} aria-hidden="true" />
        )}
        <span className="sr-only">{correct ? 'Correct' : 'Incorrect'}</span>
      </div>
      {(!correct || differs(question, response)) && (
        <div className="typed-response is-accepted">
          <span className="answer-tag">Accepted answer</span>
          <pre>
            {acceptedAnswer(question)}
            {unit ? ` ${unit}` : ''}
          </pre>
          <Check size={18} aria-hidden="true" />
        </div>
      )}
      {others.length > 0 && (
        <p className="typed-answer-hint">Also accepted: {others.join(', ')}</p>
      )}
    </div>
  );
}
