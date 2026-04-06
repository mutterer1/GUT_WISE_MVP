import { useTheme } from '../../contexts/ThemeContext';

type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface GutWiseStackedLogoProps {
  size?: LogoSize;
  className?: string;
}

const sizeMap: Record<LogoSize, { height: number; width: number }> = {
  xs: { height: 40, width: 32 },
  sm: { height: 48, width: 40 },
  md: { height: 64, width: 52 },
  lg: { height: 80, width: 64 },
  xl: { height: 96, width: 80 },
  '2xl': { height: 128, width: 104 },
};

export default function GutWiseStackedLogo({
  size = 'md',
  className = '',
}: GutWiseStackedLogoProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { height, width } = sizeMap[size];

  const src = isDark
    ? '/logos/gutwise-stacked-dark.svg'
    : '/logos/gutwise-stacked-light.svg';

  return (
    <img
      src={src}
      alt="GutWise"
      width={width}
      height={height}
      className={`object-contain ${className}`}
      style={{ height, width: 'auto' }}
    />
  );
}
