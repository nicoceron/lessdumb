/** Circular percentage badge, as on Math Academy's course cards. */
export function ProgressRing({
  value,
  label,
  size = 56,
}: {
  value: number;
  label: string;
  size?: number;
}) {
  const percent = Math.max(0, Math.min(100, Math.round(value)));
  const radius = 15.5;
  const circumference = 2 * Math.PI * radius;
  return (
    <div
      className="progress-ring"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 36 36" aria-hidden="true">
        <circle className="progress-ring-track" cx="18" cy="18" r={radius} />
        <circle
          className="progress-ring-value"
          cx="18"
          cy="18"
          r={radius}
          strokeDasharray={`${(percent / 100) * circumference} ${circumference}`}
        />
      </svg>
      <span aria-hidden="true">{percent}%</span>
    </div>
  );
}
