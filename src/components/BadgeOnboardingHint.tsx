interface BadgeOnboardingHintProps {
  visible: boolean;
}

export default function BadgeOnboardingHint({ visible }: BadgeOnboardingHintProps) {
  if (!visible) return null;

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none select-none"
      style={{ top: 'calc(100% + 6px)', zIndex: 10 }}
      aria-hidden="true"
    >
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderBottom: '6px solid rgba(124, 92, 255, 0.35)',
        }}
      />
      <div
        className="hint-pulse mt-0.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap"
        style={{
          background: 'rgba(124, 92, 255, 0.1)',
          border: '1px solid rgba(124, 92, 255, 0.28)',
          color: 'rgba(184, 168, 255, 0.9)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          letterSpacing: '0.01em',
        }}
      >
        New Here? Click Me!
      </div>
    </div>
  );
}
