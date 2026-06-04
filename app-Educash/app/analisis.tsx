import { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useFinance } from '@/hooks/useFinance';
import { globalStyles } from '@/styles/globalStyles';
import { Colors } from '@/constants/theme';
import ThemeText from '@/components/ThemeText';

export default function Analisis() {
  const { transactions, totalIncome, totalExpense } = useFinance();
  const router = useRouter();

  const byCategory = useMemo(() =>
    transactions.filter(t => t.type === 'expense')
      .reduce((acc: any[], t) => {
        const ex = acc.find(i => i.name === t.category);
        ex ? (ex.value += t.amount) : acc.push({ name: t.category, value: t.amount });
        return acc;
      }, []).sort((a, b) => b.value - a.value),
    [transactions]
  );

  const peakDay = useMemo(() => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const counts: Record<number, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const d = new Date(t.date).getDay();
      counts[d] = (counts[d] || 0) + t.amount;
    });
    if (!Object.keys(counts).length) return '---';
    return days[+Object.keys(counts).reduce((a, b) => counts[+a] > counts[+b] ? a : b, '0')];
  }, [transactions]);

  const pct       = totalIncome ? Math.min(Math.round((totalExpense / totalIncome) * 100), 100) : 0;
  const scoreGood = totalExpense < totalIncome * 0.7;

  return (
    <View style={globalStyles.background}>
      <ScrollView contentContainerStyle={[globalStyles.screen, { paddingBottom: 60 }]}
        showsVerticalScrollIndicator={false}>

        <TouchableOpacity onPress={() => router.back()}
          style={{ paddingVertical: 14, alignSelf: 'flex-start' }}>
          <Text style={{ color: Colors.primary, fontWeight: '900', fontSize: 13 }}>← Volver</Text>
        </TouchableOpacity>

        <ThemeText variant="title">Análisis</ThemeText>
        <ThemeText variant="sub" style={{ marginBottom: 20 }}>Patrones de gasto</ThemeText>

        {/* Score */}
        <View style={[globalStyles.card, { backgroundColor: scoreGood ? '#0d1f0d' : '#2d0a14' }]}>
          <Text style={globalStyles.label}>SCORE FINANCIERO</Text>
          <Text style={{ fontSize: 72, fontWeight: '900', letterSpacing: -3, marginBottom: 8,
            color: scoreGood ? Colors.income : Colors.expense }}>
            {scoreGood ? 'A+' : 'C-'}
          </Text>
          <Text style={{ fontSize: 13, color: Colors.textSecondary, lineHeight: 20, marginBottom: 20 }}>
            {scoreGood
              ? '¡Estás ahorrando más del 30% de tus ingresos!'
              : 'Tus gastos superan el 70% de tus ingresos.'}
          </Text>
          <View style={globalStyles.barBg}>
            <View style={[globalStyles.barFill, {
              width: `${pct}%`,
              backgroundColor: scoreGood ? Colors.income : Colors.expense
            }]} />
          </View>
          <Text style={[globalStyles.label, { marginTop: 8 }]}>RATIO DE GASTO: {pct}%</Text>
        </View>

        {/* Stats rápidas */}
        <View style={globalStyles.row}>
          {[
            { label: 'BURN RATE',   val: `$${totalExpense.toLocaleString('es-CO')}`, emoji: '🔥' },
            { label: 'MAYOR FUGA',  val: byCategory[0]?.name || '---',               emoji: '⚠️' },
            { label: 'DÍA CRÍTICO', val: peakDay,                                    emoji: '📅' },
          ].map((st, i) => (
            <View key={i} style={[globalStyles.card, { flex: 1, alignItems: 'center', marginBottom: 0 }]}>
              <Text style={{ fontSize: 22, marginBottom: 6 }}>{st.emoji}</Text>
              <Text style={globalStyles.label}>{st.label}</Text>
              <Text style={{ fontSize: 12, fontWeight: '900', color: Colors.textPrimary }}>{st.val}</Text>
            </View>
          ))}
        </View>

        {/* Barras de categorías */}
        <View style={globalStyles.card}>
          <Text style={[globalStyles.label, { marginBottom: 20 }]}>DISTRIBUCIÓN DE GASTOS</Text>
          {byCategory.length === 0 ? (
            <ThemeText variant="sub" style={{ textAlign: 'center', paddingVertical: 32 }}>
              Sin datos aún
            </ThemeText>
          ) : byCategory.map(item => {
            const p    = totalExpense > 0 ? (item.value / totalExpense) * 100 : 0;
            const crit = p > 30;
            return (
              <View key={item.name} style={{ marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 }}>
                  <Text style={{ color: Colors.textPrimary, fontWeight: '700', fontSize: 13 }}>{item.name}</Text>
                  <Text style={{ fontWeight: '900', fontSize: 13,
                    color: crit ? Colors.expense : Colors.primary }}>{p.toFixed(0)}%</Text>
                </View>
                <View style={globalStyles.barBg}>
                  <View style={[globalStyles.barFill, {
                    width: `${p}%`,
                    backgroundColor: crit ? Colors.expense : Colors.primary
                  }]} />
                </View>
                <Text style={[globalStyles.label, { marginTop: 4 }]}>
                  ${item.value.toLocaleString('es-CO')}
                </Text>
              </View>
            );
          })}
        </View>

      </ScrollView>
    </View>
  );
}