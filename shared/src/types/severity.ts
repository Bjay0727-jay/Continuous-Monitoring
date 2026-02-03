export enum Severity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFO = 'INFO',
}

export const SEVERITY_ORDER: Record<Severity, number> = {
  [Severity.CRITICAL]: 0,
  [Severity.HIGH]: 1,
  [Severity.MEDIUM]: 2,
  [Severity.LOW]: 3,
  [Severity.INFO]: 4,
};

export const SEVERITY_COLORS: Record<Severity, string> = {
  [Severity.CRITICAL]: '#dc2626',
  [Severity.HIGH]: '#ea580c',
  [Severity.MEDIUM]: '#ca8a04',
  [Severity.LOW]: '#2563eb',
  [Severity.INFO]: '#6b7280',
};
