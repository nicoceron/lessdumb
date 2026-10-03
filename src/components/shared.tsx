import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Btn({
  children,
  id,
  onClick,
  secondary = false,
  disabled = false,
}: {
  children: ReactNode;
  id?: string;
  onClick?: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Button
      id={id}
      variant={secondary ? 'outline' : 'default'}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  );
}
export function Pill({ children }: { children: ReactNode }) {
  return <Badge variant="secondary">{children}</Badge>;
}

export function download(
  name: string,
  data: string,
  type = 'application/json',
) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function PageTitle({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="page-heading">
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  );
}

/** Shown while a course's lesson content downloads, or after it failed to. */
export function ContentLoading({
  error,
  retry,
}: {
  error: string | null;
  retry: () => void;
}) {
  return error ? (
    <div className="empty-state" role="alert">
      <p>{error}</p>
      <Button onClick={retry}>Retry</Button>
    </div>
  ) : (
    <div className="loading-space" role="status">
      Loading the lesson…
    </div>
  );
}
