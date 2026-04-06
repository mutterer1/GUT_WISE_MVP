import { useTheme } from '../../contexts/ThemeContext';

type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface GutWiseHorizontalLogoProps {
  size?: LogoSize;
  className?: string;
}

const sizeMap: Record<LogoSize, { height: number; width: number }> = {
  xs: { height: 20, width: 80 },
  sm: { height: 24, width: 96 },
  md: { height: 32, width: 128 },
  lg: { height: 40, width: 160 },
  xl: { height: 48, width: 192 },
  '2xl': { height: 64, width: 256 },
};

export default function GutWiseHorizontalLogo({
  size = 'md',
  className = '',
}: GutWiseHorizontalLogoProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { height, width } = sizeMap[size];

  const src = isDark
    ? '/logos/gutwise-horizontal-dark.svg'
    : '/logos/gutwise-horizontal-light.svg';

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
