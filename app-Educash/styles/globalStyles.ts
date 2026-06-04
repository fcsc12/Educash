import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

export const globalStyles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // pantallas con scroll
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
  },
  // tarjeta genérica
  card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  // título de página
  pageTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -1.5,
    marginBottom: 4,
  },
  pageSub: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '700',
    marginBottom: 20,
  },
  // label tipo el profe
  label: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 2.5,
    marginBottom: 8,
  },
  // input genérico
  input: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 16,
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  // botón principal
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center' as const,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 2.5,
  },
  // fila de stats
  row: {
    flexDirection: 'row' as const,
    gap: 10,
    marginBottom: 14,
  },
  // barra de progreso
  barBg: {
    height: 6,
    backgroundColor: Colors.darkGray,
    borderRadius: 99,
    overflow: 'hidden' as const,
  },
  barFill: {
    height: '100%' as any,
    borderRadius: 99,
  },
});