import { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useFinance } from '@/hooks/useFinance';
import { globalStyles } from '@/styles/globalStyles';
import { Colors } from '@/constants/theme';
import ThemeText from '@/components/ThemeText';

type Filter = 'all' | 'income' | 'expense';

export default function Movimientos() {
  const { transactions, deleteTransaction } = useFinance();
  const router = useRouter();
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState<Filter>('all');

  const filtered = useMemo(() =>
    transactions.filter(t => {
      const text = `${t.description} ${t.category}`.toLowerCase();
      return text.includes(search.toLowerCase()) &&
        (filter === 'all' || t.type === filter);
    }),
    [transactions, search, filter]
  );

  const confirmDelete = (id: string) =>
    Alert.alert('¿Eliminar?', 'Esta acción no se puede deshacer', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive',
        onPress: () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); deleteTransaction(id); }
      },
    ]);

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all',     label: 'TODOS' },
    { key: 'income',  label: 'INGRESOS' },
    { key: 'expense', label: 'GASTOS' },
  ];

  return (
    <View style={globalStyles.background}>
      <ScrollView contentContainerStyle={[globalStyles.screen, { paddingBottom: 60 }]}
        showsVerticalScrollIndicator={false}>

        <TouchableOpacity onPress={() => router.back()} style={{ paddingVertical: 14, alignSelf: 'flex-start' }}>
          <Text style={{ color: Colors.primary, fontWeight: '900', fontSize: 13 }}>← Volver</Text>
        </TouchableOpacity>

        <ThemeText variant="title">Movimientos</ThemeText>
        <ThemeText variant="sub" style={{ marginBottom: 20 }}>
          {transactions.length} registros en total
        </ThemeText>

        <TextInput style={globalStyles.input} placeholder="Buscar descripción o categoría..."
          placeholderTextColor={Colors.textMuted} value={search} onChangeText={setSearch} />

        <View style={[globalStyles.row, { marginBottom: 20 }]}>
          {FILTERS.map(f => (
            <TouchableOpacity key={f.key}
              style={[s.filterBtn, filter === f.key && s.filterActive]}
              onPress={() => { Haptics.selectionAsync(); setFilter(f.key); }}>
              <Text style={[s.filterText, filter === f.key && { color: Colors.primary }]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {filtered.length === 0 ? (
          <View style={[globalStyles.card, { alignItems: 'center', paddingVertical: 60 }]}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>📭</Text>
            <ThemeText variant="sub">Sin resultados</ThemeText>
          </View>
        ) : filtered.map(t => (
          <View key={t.id} style={[globalStyles.card, s.txRow]}>
            <View style={[s.txIcon, {
              backgroundColor: t.type === 'income' ? Colors.incomeLight : Colors.expenseLight
            }]}>
              <Text style={{ fontSize: 18 }}>{t.type === 'income' ? '⬆️' : '⬇️'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 }}>
                {t.description}
              </Text>
              <Text style={{ fontSize: 10, color: Colors.textMuted, fontWeight: '700', textTransform: 'uppercase' }}>
                {t.category} · {t.date}
              </Text>
            </View>
            <Text style={{ fontSize: 13, fontWeight: '900',
              color: t.type === 'income' ? Colors.income : Colors.expense }}>
              {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString('es-CO')}
            </Text>
            <TouchableOpacity onPress={() => confirmDelete(t.id)}
              style={{ marginLeft: 10, padding: 6 }}>
              <Text style={{ fontSize: 16 }}>🗑️</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  filterBtn:    { flex: 1, paddingVertical: 11, borderRadius: 14, backgroundColor: Colors.card, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  filterActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  filterText:   { fontSize: 9, fontWeight: '900', color: Colors.textSecondary, letterSpacing: 1.5 },
  txRow:        { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, marginBottom: 0 },
  txIcon:       { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});