import { useTheme } from '../../contexts/ThemeContext';

type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface GutWiseIconLogoProps {
  size?: LogoSize;
  className?: string;
}

const sizeMap: Record<LogoSize, number> = {
  xs: 20,
  sm: 24,
  md: 32,
  lg: 40,
  xl: 48,
  '2xl': 64,
};

export default function GutWiseIconLogo({
  size = 'md',
  className = '',
}: GutWiseIconLogoProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const pixelSize = sizeMap[size];

  const src = isDark
    ? '/logos/gutwise-icon-dark.svg'
    : '/logos/gutwise-icon-light.svg';

  return (
    <img
      src={src}
      alt="GutWise"
      width={pixelSize}
      height={pixelSize}
      className={`object-contain ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
    />
  );
}
