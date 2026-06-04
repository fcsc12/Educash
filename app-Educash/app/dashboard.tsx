import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useFinance } from '@/hooks/useFinance';
import { globalStyles } from '@/styles/globalStyles';
import { Colors } from '@/constants/theme';
import ThemeText from '@/components/ThemeText';
import AddTransactionModal from '@/components/AddTransactionModal';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { transactions, totalIncome, totalExpense, savings, deleteTransaction } = useFinance();
  const router = useRouter();
  const [modal, setModal] = useState(false);

  const pct = totalIncome
    ? Math.min(Math.round((totalExpense / totalIncome) * 100), 100) : 0;
  const isCritical = pct > 80;

  const NAV = [
    { emoji: '📊', label: 'Movimientos', route: '/movimientos' },
    { emoji: '📈', label: 'Análisis',    route: '/analisis' },
    { emoji: '🎯', label: 'Metas',       route: '/metas' },
  ];

  return (
    <View style={globalStyles.background}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Saludo */}
        <View style={s.headerRow}>
          <View>
            <ThemeText variant="title">
              Hola, {user?.name?.split(' ')[0]} 👋
            </ThemeText>
            <ThemeText variant="sub">Tu resumen financiero</ThemeText>
          </View>
          <TouchableOpacity style={s.logoutBtn}
            onPress={async () => { Haptics.selectionAsync(); await logout(); }}>
            <Text style={{ color: Colors.expense, fontWeight: '900', fontSize: 11, letterSpacing: 1 }}>
              SALIR
            </Text>
          </TouchableOpacity>
        </View>

        {/* Balance */}
        <View style={globalStyles.card}>
          <Text style={globalStyles.label}>BALANCE DISPONIBLE</Text>
          <Text style={{
            fontSize: 48, fontWeight: '900', letterSpacing: -2.5,
            color: savings >= 0 ? Colors.textPrimary : Colors.expense,
            marginBottom: 24,
          }}>
            ${savings.toLocaleString('es-CO')}
          </Text>

          <View style={globalStyles.row}>
            <View style={{ flex: 1 }}>
              <View style={[s.dot, { backgroundColor: Colors.income }]} />
              <Text style={globalStyles.label}>INGRESOS</Text>
              <Text style={{ fontSize: 20, fontWeight: '900', color: Colors.income }}>
                ${totalIncome.toLocaleString('es-CO')}
              </Text>
            </View>
            <View style={{ flex: 1, borderLeftWidth: 1, borderLeftColor: Colors.border, paddingLeft: 20 }}>
              <View style={[s.dot, { backgroundColor: Colors.expense }]} />
              <Text style={globalStyles.label}>GASTOS</Text>
              <Text style={{ fontSize: 20, fontWeight: '900', color: Colors.expense }}>
                ${totalExpense.toLocaleString('es-CO')}
              </Text>
            </View>
          </View>
        </View>

        {/* Salud financiera */}
        <View style={[globalStyles.card, { backgroundColor: isCritical ? '#2d0a14' : '#13082d' }]}>
          <Text style={globalStyles.label}>SALUD FINANCIERA</Text>
          <Text style={{ fontSize: 44, fontWeight: '900', letterSpacing: -2,
            color: isCritical ? Colors.expense : Colors.primary, marginBottom: 4 }}>
            {pct}%
          </Text>
          <Text style={{ color: Colors.textSecondary, fontSize: 12, fontWeight: '700', marginBottom: 16 }}>
            {isCritical ? '⚠️ Gastos muy elevados' : '✅ Balance saludable'}
          </Text>
          <View style={globalStyles.barBg}>
            <View style={[globalStyles.barFill, {
              width: `${pct}%`,
              backgroundColor: isCritical ? Colors.expense : Colors.primary
            }]} />
          </View>
        </View>

        {/* Navegación */}
        <View style={globalStyles.row}>
          {NAV.map(n => (
            <TouchableOpacity key={n.route} style={[globalStyles.card, s.navCard]}
              onPress={() => { Haptics.selectionAsync(); router.push(n.route as any); }}>
              <Text style={{ fontSize: 26, marginBottom: 6 }}>{n.emoji}</Text>
              <Text style={globalStyles.label}>{n.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Últimos movimientos */}
        <Text style={[globalStyles.label, { fontSize: 12, marginBottom: 12 }]}>
          ÚLTIMOS MOVIMIENTOS
        </Text>

        {transactions.length === 0 ? (
          <View style={[globalStyles.card, { alignItems: 'center', paddingVertical: 48 }]}>
            <Text style={{ fontSize: 44, marginBottom: 12 }}>📭</Text>
            <ThemeText variant="sub">Sin registros aún · toca + para agregar</ThemeText>
          </View>
        ) : (
          transactions.slice(0, 10).map(t => (
            <View key={t.id} style={[globalStyles.card, s.txRow]}>
              <View style={[s.txIcon, {
                backgroundColor: t.type === 'income' ? Colors.incomeLight : Colors.expenseLight
              }]}>
                <Text style={{ fontSize: 20 }}>{t.type === 'income' ? '⬆️' : '⬇️'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginBottom: 3 }}>
                  {t.description}
                </Text>
                <Text style={{ fontSize: 10, color: Colors.textMuted, fontWeight: '700', textTransform: 'uppercase' }}>
                  {t.category} · {t.date}
                </Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '900',
                color: t.type === 'income' ? Colors.income : Colors.expense }}>
                {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString('es-CO')}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={s.fab}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setModal(true); }}>
        <Text style={{ color: Colors.background, fontSize: 32, lineHeight: 36, fontWeight: '300' }}>+</Text>
      </TouchableOpacity>

      <AddTransactionModal visible={modal} onClose={() => setModal(false)} />
    </View>
  );
}

const s = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20 },
  logoutBtn: { backgroundColor: Colors.expenseLight, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: Colors.expense },
  dot: { width: 6, height: 6, borderRadius: 3, marginBottom: 6 },
  navCard: { flex: 1, alignItems: 'center', marginBottom: 0 },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 0, padding: 16 },
  txIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  fab: {
    position: 'absolute', bottom: Platform.OS === 'ios' ? 36 : 24, right: 24,
    width: 62, height: 62, borderRadius: 22,
    backgroundColor: Colors.textPrimary,
    alignItems: 'center', justifyContent: 'center',
    elevation: 10,
  },
});