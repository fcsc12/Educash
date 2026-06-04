import { Text, type TextProps } from 'react-native';
import { Colors } from '@/constants/theme';

interface Props extends TextProps {
  variant?: 'title' | 'sub' | 'label' | 'body';
  color?: string;
}

const ThemeText = ({ children, variant = 'body', color, ...rest }: Props) => {
  const styles = {
    title: { fontSize: 32, fontWeight: '900' as const, color: Colors.textPrimary, letterSpacing: -1.5 },
    sub:   { fontSize: 13, fontWeight: '600' as const, color: Colors.textMuted },
    label: { fontSize: 9,  fontWeight: '800' as const, color: Colors.textSecondary, letterSpacing: 2.5 },
    body:  { fontSize: 14, fontWeight: '600' as const, color: Colors.textPrimary },
  };

  return (
    <Text
      style={[styles[variant], color ? { color } : null]}
      numberOfLines={1}
      adjustsFontSizeToFit
      {...rest}
    >
      {children}
    </Text>
  );
};

export default ThemeText;