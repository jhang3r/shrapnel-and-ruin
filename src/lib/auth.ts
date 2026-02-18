export function generateGuestUsername(): string {
  const suffix = Math.random().toString(36).slice(2, 6).padEnd(4, '0').toUpperCase();
  return `Pilot-${suffix}`;
}
