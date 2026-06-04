import { useState } from 'react';
import {
  View, TextInput, TouchableOpacity, Text,
  KeyboardAvoidingView, Platform, ScrollView, Alert
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { globalStyles } from '@/styles/globalStyles';
import { Colors } from '@/constants/theme';
import ThemeText from '@/components/ThemeText';

export default function Register() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password)
      return Alert.alert('Error', 'Completa todos los campos');
    if (password !== confirm)
      return Alert.alert('Error', 'Las contraseñas no coinciden');
    if (password.length < 6)
      return Alert.alert('Error', 'Mínimo 6 caracteres');
    try {
      setLoading(true);
      Haptics.selectionAsync();
      await register(name.trim(), email.trim().toLowerCase(), password);
    } catch (e: any) {
      Alert.alert('Error al registrarse', e.message);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: 'NOMBRE COMPLETO',  value: name,     set: setName,     placeholder: 'Tu nombre' },
    { label: 'CORREO',           value: email,    set: setEmail,    placeholder: 'usuario@mail.com', keyboard: 'email-address' as const },
    { label: 'CONTRASEÑA',       value: password, set: setPassword, placeholder: 'Mínimo 6 caracteres', secure: true },
    { label: 'CONFIRMAR',        value: confirm,  set: setConfirm,  placeholder: 'Repite tu contraseña', secure: true },
  ];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[globalStyles.screen, { justifyContent: 'center', paddingVertical: 40 }]}
        keyboardShouldPersistTaps="handled">

        <ThemeText variant="title" style={{ textAlign: 'center', marginBottom: 4 }}>
          Crear cuenta
        </ThemeText>
        <ThemeText variant="sub" style={{ textAlign: 'center', marginBottom: 36 }}>
          Regístrate para continuar
        </ThemeText>

        <View style={globalStyles.card}>
          {fields.map((f, i) => (
            <View key={i}>
              <Text style={globalStyles.label}>{f.label}</Text>
              <TextInput style={globalStyles.input} value={f.value} onChangeText={f.set}
                placeholder={f.placeholder} placeholderTextColor={Colors.textMuted}
                secureTextEntry={f.secure} keyboardType={f.keyboard} autoCapitalize="none" />
            </View>
          ))}

          <TouchableOpacity
            style={[globalStyles.button, loading && { opacity: 0.6 }]}
            onPress={handleRegister} disabled={loading}>
            <Text style={globalStyles.buttonText}>
              {loading ? 'Creando cuenta...' : 'CREAR CUENTA'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()}
            style={{ marginTop: 20, alignItems: 'center' }}>
            <Text style={{ color: Colors.textSecondary, fontSize: 12, fontWeight: '700' }}>
              ¿Ya tienes cuenta?{' '}
              <Text style={{ color: Colors.primary }}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}