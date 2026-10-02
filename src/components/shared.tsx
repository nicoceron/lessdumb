import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Btn({
  children,
  onClick,
  secondary = false,
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Button
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
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <>
      <div className="page-eyebrow">
        <span className="eyebrow-line" />
        {eyebrow}
      </div>
      <div className="page-heading compact">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>
    </>
  );
}
