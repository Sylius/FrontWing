interface PasswordStrengthProps {
  value: string;
}

export function PasswordStrength({ value }: PasswordStrengthProps) {
  if (!value) return null;

  const checks = [
    value.length >= 8,
    /[A-Z]/.test(value),
    /[0-9]/.test(value),
    /[^a-zA-Z0-9]/.test(value),
  ];
  const score = checks.filter(Boolean).length; // 0–4

  const segmentColor = [
    "bg-muted",
    "bg-destructive",
    "bg-orange-400",
    "bg-yellow-400",
    "bg-green-500",
  ][score];

  const label = ["", "Too weak", "Weak", "Good", "Strong"][score];

  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${i < score ? segmentColor : "bg-muted"}`}
          />
        ))}
      </div>
      {label && (
        <p className="text-muted-foreground text-xs" data-testid="password-strength-label">
          {label}
        </p>
      )}
    </div>
  );
}
