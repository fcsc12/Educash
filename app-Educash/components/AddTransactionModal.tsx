import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Modal, StyleSheet, ScrollView, Platform
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useFinance, Category } from '@/context/FinanceContext';
import { Colors } from '@/constants/theme';
import { globalStyles } from '@/styles/globalStyles';

const CATS: Category[] = [
  'Transporte','Comida','Utilidades','Educación',
  'Salud','Ocio','Recibos','Arriendo','Compras','Otros'
];

interface Props { visible: boolean; onClose: () => void; }

export default function AddTransactionModal({ visible, onClose }: Props) {
  const { addTransaction } = useFinance();
  const [type, setType]             = useState<'income' | 'expense'>('expense');
  const [amount, setAmount]         = useState('');
  const [category, setCategory]     = useState<Category>('Comida');
  const [description, setDescription] = useState('');

  const fmt = (v: string) =>
    v.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  const handleAdd = async () => {
    const num = Number(amount.replace(/\./g, ''));
    if (!num || num <= 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addTransaction({
      amount: num, type,
      category: type === 'income' ? 'Otros' : category,
      description: description.trim() || (type === 'income' ? 'Ingreso' : 'Gasto'),
      date: new Date().toISOString().split('T')[0],
    });
    setAmount(''); setDescription(''); setCategory('Comida'); setType('expense');
    onClose();
  };

  const isIncome = type === 'income';
  const accentColor = isIncome ? Colors.income : Colors.expense;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.handle} />

          <View style={s.headerRow}>
            <Text style={s.sheetTitle}>Nuevo Registro</Text>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <Text style={{ color: Colors.textSecondary, fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Toggle tipo */}
          <View style={s.toggle}>
            {(['expense', 'income'] as const).map(t => (
              <TouchableOpacity
                key={t}
                style={[s.toggleBtn, type === t && {
                  backgroundColor: t === 'income' ? Colors.incomeLight : Colors.expenseLight,
                  borderWidth: 1,
                  borderColor: t === 'income' ? Colors.income : Colors.expense,
                }]}
                onPress={() => { Haptics.selectionAsync(); setType(t); }}
              >
                <Text style={[s.toggleText, type === t && {
                  color: t === 'income' ? Colors.income : Colors.expense
                }]}>
                  {t === 'income' ? '⬆ INGRESO' : '⬇ EGRESO'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Monto */}
          <View style={[s.amountBox, { borderColor: accentColor }]}>
            <Text style={{ ...s.currency, color: accentColor }}>$</Text>
            <TextInput
              style={[s.amountInput, { color: accentColor }]}
              placeholder="0" placeholderTextColor={Colors.textMuted}
              value={amount} onChangeText={v => setAmount(fmt(v))}
              keyboardType="numeric" autoFocus
            />
          </View>

          {/* Categorías */}
          {!isIncome && (
            <>
              <Text style={globalStyles.label}>CATEGORÍA</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                {CATS.map(c => (
                  <TouchableOpacity key={c}
                    onPress={() => { Haptics.selectionAsync(); setCategory(c); }}
                    style={[s.chip, category === c && s.chipActive]}>
                    <Text style={[s.chipText, category === c && { color: Colors.primary }]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          {/* Descripción */}
          <Text style={globalStyles.label}>CONCEPTO</Text>
          <TextInput
            style={globalStyles.input}
            value={description} onChangeText={setDescription}
            placeholder={isIncome ? '¿De dónde viene?' : '¿En qué gastaste?'}
            placeholderTextColor={Colors.textMuted}
          />

          <TouchableOpacity
            style={[globalStyles.button, { backgroundColor: accentColor }]}
            onPress={handleAdd}
          >
            <Text style={globalStyles.buttonText}>CONFIRMAR REGISTRO</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet:      { backgroundColor: Colors.card, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: Platform.OS === 'ios' ? 44 : 32, borderWidth: 1, borderColor: Colors.border },
  handle:     { width: 40, height: 4, backgroundColor: Colors.lightGray, borderRadius: 99, alignSelf: 'center', marginBottom: 20 },
  headerRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  sheetTitle: { fontSize: 20, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.5 },
  closeBtn:   { width: 36, height: 36, borderRadius: 12, backgroundColor: Colors.darkGray, alignItems: 'center', justifyContent: 'center' },
  toggle:     { flexDirection: 'row', backgroundColor: Colors.background, borderRadius: 16, padding: 4, marginBottom: 24, gap: 4 },
  toggleBtn:  { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  toggleText: { fontSize: 11, fontWeight: '900', color: Colors.textSecondary, letterSpacing: 1.5 },
  amountBox:  { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: 16, paddingHorizontal: 18, marginBottom: 24, borderWidth: 1.5 },
  currency:   { fontSize: 28, fontWeight: '900', marginRight: 8 },
  amountInput:{ flex: 1, fontSize: 36, fontWeight: '900', paddingVertical: 14, letterSpacing: -1, color: Colors.textPrimary },
  chip:       { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, backgroundColor: Colors.background, marginRight: 8, borderWidth: 1, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  chipText:   { color: Colors.textSecondary, fontWeight: '800', fontSize: 12 },
});