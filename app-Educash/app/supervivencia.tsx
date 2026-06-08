import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSupervivencia } from '@/context/SupervivenciaContext'; 
import { useFinance } from '@/context/FinanceContext'; 
import { globalStyles } from '@/styles/globalStyles';
import { Colors } from '@/constants/theme';

export default function SupervivenciaScreen() {
  const router = useRouter();
  const { estado, activarModo, desactivarModo, obtenerTopeDiario } = useSupervivencia();
  const { transactions } = useFinance(); 
  
  const [monto, setMonto] = useState('');
  const [dias, setDias] = useState('');

  const triggerHaptic = (type: 'medium' | 'warning') => {
    if (Platform.OS !== 'web') {
      if (type === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      if (type === 'warning') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    }
  };

  const handleActivar = () => {
    const parsedMonto = parseFloat(monto.replace(/[^0-9]/g, ''));
    const parsedDias = parseInt(dias, 10);

    if (!parsedMonto || !parsedDias || parsedMonto <= 0 || parsedDias <= 0) {
      alert('Por favor, ingresa valores válidos.');
      return;
    }

    triggerHaptic('medium');
    activarModo(parsedMonto, parsedDias);
    setMonto('');
    setDias('');
  };

  const handleDesactivar = () => {
    triggerHaptic('warning');
    desactivarModo();
  };

 
  const topeDiario = obtenerTopeDiario();
  
 
  const hoyStr = new Date().toISOString().split('T')[0];
  
  
  const gastadoHoy = transactions
    .filter(t => t.date === hoyStr && t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  
  const disponibleHoy = Math.max(0, topeDiario - gastadoHoy);
  

  const porcentajeConsumido = topeDiario > 0 
    ? Math.min(Math.round((gastadoHoy / topeDiario) * 100), 100) 
    : 0;

  const hoySuperado = gastadoHoy > topeDiario;

  return (
    <View style={[globalStyles.background, { flex: 1 }]}>
      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} 
        showsVerticalScrollIndicator={false}
      >
        
        <TouchableOpacity 
          onPress={() => { if(Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {}); router.back(); }} 
          style={{ marginBottom: 15, marginTop: 10 }}
        >
          <Text style={{ color: Colors.primary || '#7c3aed', fontWeight: '700', fontSize: 14 }}>← Volver</Text>
        </TouchableOpacity>

        
        <Text style={{ fontSize: 32, fontWeight: '900', color: '#fff', marginBottom: 6 }}>
          Modo Supervivencia
        </Text>
        <Text style={{ color: Colors.textSecondary || '#aaa', fontSize: 14, fontWeight: '600', marginBottom: 24 }}>
          ¡Controla tu tope diario para no quedarte limpio!
        </Text>

        {!estado.activo ? (
          
          <View style={globalStyles.card}>
            <Text style={[globalStyles.label, { marginBottom: 12 }]}>CONFIGURAR MODO</Text>
            
            <Text style={s.inputLabel}>¿Con cuánta plata vas a sobrevivir?</Text>
            <TextInput
              style={s.input}
              placeholder="$ Ej: 200000"
              placeholderTextColor="#555"
              keyboardType="numeric"
              value={monto}
              onChangeText={setMonto}
            />

            <Text style={s.inputLabel}>¿Por cuántos días?</Text>
            <TextInput
              style={s.input}
              placeholder="Ej: 15"
              placeholderTextColor="#555"
              keyboardType="numeric"
              value={dias}
              onChangeText={setDias}
            />

            <TouchableOpacity style={s.btnActivar} onPress={handleActivar}>
              <Text style={s.btnText}>ACTIVAR MODO CRÍTICO 🚨</Text>
            </TouchableOpacity>
          </View>
        ) : (
          
          <View style={{ width: '100%' }}>
            
            
            <View style={[globalStyles.card, { backgroundColor: '#2d0a14', borderColor: Colors.expense || '#ff4a4a', borderWidth: 1, marginBottom: 16 }]}>
              <Text style={[globalStyles.label, { color: Colors.expense || '#ff4a4a' }]}>ESTADO: MODO SUPERVIVENCIA ACTIVO</Text>
              <Text style={{ fontSize: 14, color: '#ffb3b3', marginTop: 4, fontWeight: '600' }}>
                Tu pozo de emergencia se irá reduciendo con cada gasto diario que confirmes.
              </Text>
            </View>

            
            <View style={[globalStyles.card, { marginBottom: 16, borderColor: hoySuperado ? Colors.expense : Colors.border, borderWidth: hoySuperado ? 1 : 0 }]}>
              <Text style={globalStyles.label}>CUPO DISPONIBLE PARA HOY</Text>
              <Text style={{ fontSize: 44, fontWeight: '900', color: hoySuperado ? Colors.expense : Colors.income, letterSpacing: -1.5, marginVertical: 4 }}>
                ${disponibleHoy.toLocaleString('es-CO')}
              </Text>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, marginBottom: 12 }}>
                <Text style={{ color: Colors.textSecondary, fontSize: 12, fontWeight: '700' }}>
                  Límite diario: ${topeDiario.toLocaleString('es-CO')}
                </Text>
                <Text style={{ color: hoySuperado ? Colors.expense : Colors.textSecondary, fontSize: 12, fontWeight: '700' }}>
                  Gastado hoy: ${gastadoHoy.toLocaleString('es-CO')}
                </Text>
              </View>

              
              <View style={[globalStyles.barBg, { height: 8 }]}>
                <View style={[globalStyles.barFill, {
                  width: `${porcentajeConsumido}%`,
                  backgroundColor: hoySuperado ? Colors.expense : Colors.primary || '#7c3aed'
                }]} />
              </View>
              
              {hoySuperado && (
                <Text style={{ color: Colors.expense, fontSize: 11, fontWeight: '800', marginTop: 10, textAlign: 'center', letterSpacing: 0.5 }}>
                  ⚠️ ¡CUIDADO! HAS SUPERADO EL TOPE PERMITIDO PARA HOY
                </Text>
              )}
            </View>

            
            <View style={[globalStyles.card, { marginBottom: 16 }]}>
              <View style={globalStyles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={globalStyles.label}>POZO RESTANTE</Text>
                  <Text style={{ fontSize: 22, fontWeight: '900', color: '#fff', marginTop: 4 }}>
                    ${estado.saldoRestante.toLocaleString('es-CO')}
                  </Text>
                </View>
                <View style={{ flex: 1, borderLeftWidth: 1, borderLeftColor: Colors.border || '#1e1e2e', paddingLeft: 20 }}>
                  <Text style={globalStyles.label}>DÍAS RESTANTES</Text>
                  <Text style={{ fontSize: 22, fontWeight: '900', color: '#fff', marginTop: 4 }}>
                    {estado.duracionDias} días
                  </Text>
                </View>
              </View>
            </View>

            
            <TouchableOpacity style={s.btnDesactivar} onPress={handleDesactivar}>
              <Text style={[s.btnText, { color: Colors.expense || '#ff4a4a' }]}>DESACTIVAR MODO SUPERVIVENCIA</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  inputLabel: { color: '#e2e2ff', fontSize: 13, fontWeight: '700', marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: '#13131a', borderWidth: 1, borderColor: '#1e1e2e', borderRadius: 12, padding: 14, color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 8 },
  btnActivar: { backgroundColor: '#7c3aed', paddingVertical: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  btnDesactivar: { backgroundColor: '#2d0a14', borderWidth: 1, borderColor: '#ff4a4a', paddingVertical: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
});