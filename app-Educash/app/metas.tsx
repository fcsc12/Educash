import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, Modal, Alert, StyleSheet, Platform
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useFinance } from '@/hooks/useFinance';
import { globalStyles } from '@/styles/globalStyles';
import { Colors } from '@/constants/theme';
import ThemeText from '@/components/ThemeText';

const EMOJIS = ['🎯','✈️','🏠','📱','🎓','🚗','💻','👟','🎸','💍'];

export default function Metas() {
  const { goals, savings, addGoal, depositToGoal, deleteGoal } = useFinance();
  const router = useRouter();
  const [newModal,      setNewModal]      = useState(false);
  const [depositModal,  setDepositModal]  = useState(false);
  const [selectedGoal,  setSelectedGoal]  = useState<any>(null);
  const [title,         setTitle]         = useState('');
  const [target,        setTarget]        = useState('');
  const [emoji,         setEmoji]         = useState('🎯');
  const [depositAmt,    setDepositAmt]    = useState('');

  const fmt = (v: string) =>
    v.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  const handleAdd = async () => {
    const num = Number(target.replace(/\D/g, ''));
    if (!title.trim() || !num) return Alert.alert('Error', 'Completa todos los campos');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addGoal({ title: title.trim(), target: num, emoji });
    setTitle(''); setTarget(''); setEmoji('🎯'); setNewModal(false);
  };

  const handleDeposit = async () => {
    const num = Number(depositAmt.replace(/\D/g, ''));
    if (!num || num <= 0) return Alert.alert('Error', 'Monto inválido');
    if (num > savings)    return Alert.alert('Sin saldo', 'No tienes suficiente saldo');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await depositToGoal(selectedGoal.id, num);
    setDepositAmt(''); setDepositModal(false); setSelectedGoal(null);
  };

  return (
    <View style={globalStyles.background}>
      <ScrollView contentContainerStyle={[globalStyles.screen, { paddingBottom: 80 }]}
        showsVerticalScrollIndicator={false}>

        <TouchableOpacity onPress={() => router.back()}
          style={{ paddingVertical: 14, alignSelf: 'flex-start' }}>
          <Text style={{ color: Colors.primary, fontWeight: '900', fontSize: 13 }}>← Volver</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
          <View>
            <ThemeText variant="title">Mis Metas</ThemeText>
            <ThemeText variant="sub">Ahorra para lo que importa</ThemeText>
          </View>
          <TouchableOpacity style={[globalStyles.button, { paddingHorizontal: 18, paddingVertical: 12 }]}
            onPress={() => { Haptics.selectionAsync(); setNewModal(true); }}>
            <Text style={globalStyles.buttonText}>+ Nueva</Text>
          </TouchableOpacity>
        </View>

        {/* Saldo disponible */}
        <View style={[globalStyles.card, { backgroundColor: '#13082d', borderColor: Colors.primaryLight }]}>
          <Text style={globalStyles.label}>💰 SALDO PARA AHORRAR</Text>
          <Text style={{ fontSize: 40, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -1.5 }}>
            ${savings.toLocaleString('es-CO')}
          </Text>
        </View>

        {goals.length === 0 ? (
          <View style={[globalStyles.card, { alignItems: 'center', paddingVertical: 60 }]}>
            <Text style={{ fontSize: 44, marginBottom: 12 }}>🎯</Text>
            <ThemeText variant="sub">Sin metas aún · toca "+ Nueva"</ThemeText>
          </View>
        ) : goals.map(g => {
          const progress = Math.min((g.current / g.target) * 100, 100);
          const done     = progress >= 100;
          return (
            <View key={g.id} style={[globalStyles.card, done && { borderColor: Colors.income }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 18 }}>
                <View style={s.goalEmoji}>
                  <Text style={{ fontSize: 28 }}>{g.emoji}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={{ fontSize: 16, fontWeight: '900', color: Colors.textPrimary }}>{g.title}</Text>
                  <Text style={[globalStyles.label, { marginBottom: 0, marginTop: 3 }]}>
                    META: ${g.target.toLocaleString('es-CO')}
                  </Text>
                </View>
                <TouchableOpacity onPress={() =>
                  Alert.alert('¿Eliminar?', '', [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Eliminar', style: 'destructive', onPress: () => deleteGoal(g.id) }
                  ])} style={{ padding: 6 }}>
                  <Text style={{ fontSize: 16 }}>🗑️</Text>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <View>
                  <Text style={globalStyles.label}>ACUMULADO</Text>
                  <Text style={{ fontSize: 28, fontWeight: '900', letterSpacing: -1,
                    color: done ? Colors.income : Colors.textPrimary }}>
                    ${g.current.toLocaleString('es-CO')}
                  </Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '900',
                  color: done ? Colors.income : Colors.primary, alignSelf: 'flex-end' }}>
                  {done ? '✅ Completada' : `${progress.toFixed(0)}%`}
                </Text>
              </View>

              <View style={globalStyles.barBg}>
                <View style={[globalStyles.barFill, {
                  width: `${progress}%`,
                  backgroundColor: done ? Colors.income : Colors.primary
                }]} />
              </View>

              {!done && (
                <TouchableOpacity style={s.depositBtn}
                  onPress={() => { Haptics.selectionAsync(); setSelectedGoal(g); setDepositModal(true); }}>
                  <Text style={{ color: Colors.primary, fontWeight: '900', fontSize: 12, letterSpacing: 1.5 }}>
                    🐷 ABONAR A ESTA META
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Modal nueva meta */}
      {[{ visible: newModal, close: () => setNewModal(false), title: 'Nueva Meta', content: (
        <>
          <Text style={globalStyles.label}>ELIGE UN EMOJI</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            {EMOJIS.map(e => (
              <TouchableOpacity key={e} onPress={() => setEmoji(e)}
                style={[s.emojiBtn, emoji === e && s.emojiBtnActive]}>
                <Text style={{ fontSize: 24 }}>{e}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={globalStyles.label}>¿QUÉ QUIERES LOGRAR?</Text>
          <TextInput style={globalStyles.input} value={title} onChangeText={setTitle}
            placeholder="Ej: Viaje a Japón" placeholderTextColor={Colors.textMuted} />
          <Text style={globalStyles.label}>MONTO OBJETIVO ($)</Text>
          <TextInput style={globalStyles.input} value={target}
            onChangeText={v => setTarget(fmt(v))}
            placeholder="0" placeholderTextColor={Colors.textMuted} keyboardType="numeric" />
          <TouchableOpacity style={globalStyles.button} onPress={handleAdd}>
            <Text style={globalStyles.buttonText}>CREAR OBJETIVO</Text>
          </TouchableOpacity>
        </>
      )},
      { visible: depositModal, close: () => setDepositModal(false), title: `Abonar a "${selectedGoal?.title}"`, content: (
        <>
          <Text style={{ color: Colors.textMuted, fontSize: 12, marginBottom: 20, fontWeight: '600' }}>
            Saldo disponible: ${savings.toLocaleString('es-CO')}
          </Text>
          <Text style={globalStyles.label}>MONTO A ABONAR ($)</Text>
          <TextInput style={globalStyles.input} value={depositAmt}
            onChangeText={v => setDepositAmt(fmt(v))}
            placeholder="0" placeholderTextColor={Colors.textMuted}
            keyboardType="numeric" autoFocus />
          <TouchableOpacity style={[globalStyles.button, { backgroundColor: Colors.income }]}
            onPress={handleDeposit}>
            <Text style={globalStyles.buttonText}>CONFIRMAR ABONO</Text>
          </TouchableOpacity>
        </>
      )}].map((m, i) => (
        <Modal key={i} visible={m.visible} transparent animationType="slide"
          onRequestClose={m.close}>
          <View style={s.overlay}>
            <View style={s.sheet}>
              <View style={s.handle} />
              <Text style={s.sheetTitle}>{m.title}</Text>
              {m.content}
              <TouchableOpacity onPress={m.close} style={{ alignItems: 'center', marginTop: 14 }}>
                <Text style={{ color: Colors.textSecondary, fontWeight: '700', fontSize: 12 }}>
                  CANCELAR
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  goalEmoji:    { width: 56, height: 56, backgroundColor: Colors.primaryLight, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  depositBtn:   { backgroundColor: Colors.primaryLight, borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.primary, marginTop: 16 },
  emojiBtn:     { width: 52, height: 52, borderRadius: 16, backgroundColor: Colors.background, marginRight: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  emojiBtnActive:{ backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet:        { backgroundColor: Colors.card, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 28, paddingBottom: Platform.OS === 'ios' ? 44 : 32, borderWidth: 1, borderColor: Colors.border },
  handle:       { width: 40, height: 4, backgroundColor: Colors.lightGray, borderRadius: 99, alignSelf: 'center', marginBottom: 24 },
  sheetTitle:   { fontSize: 20, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.5, marginBottom: 20 },
});