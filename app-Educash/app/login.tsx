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

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim())
      return Alert.alert('Campos vacíos', 'Completa todos los campos');
    try {
      setLoading(true);
      Haptics.selectionAsync();
      await login(email.trim().toLowerCase(), password);
    } catch (e: any) {
      Alert.alert('Error al iniciar sesión', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[globalStyles.screen, { justifyContent: 'center', paddingVertical: 40 }]}
        keyboardShouldPersistTaps="handled">

        <ThemeText variant="title" style={{ textAlign: 'center', marginBottom: 4 }}>
          Bienvenido
        </ThemeText>
        <ThemeText variant="sub" style={{ textAlign: 'center', marginBottom: 36 }}>
          Inicia sesión en tu cuenta
        </ThemeText>

        <View style={globalStyles.card}>
          <Text style={globalStyles.label}>CORREO ELECTRÓNICO</Text>
          <TextInput style={globalStyles.input} value={email} onChangeText={setEmail}
            placeholder="usuario@mail.com" placeholderTextColor={Colors.textMuted}
            keyboardType="email-address" autoCapitalize="none" />

          <Text style={globalStyles.label}>CONTRASEÑA</Text>
          <TextInput style={globalStyles.input} value={password} onChangeText={setPassword}
            placeholder="••••••••" placeholderTextColor={Colors.textMuted} secureTextEntry />

          <TouchableOpacity
            style={[globalStyles.button, loading && { opacity: 0.6 }]}
            onPress={handleLogin} disabled={loading}>
            <Text style={globalStyles.buttonText}>
              {loading ? 'Entrando...' : 'INICIAR SESIÓN'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/register')}
            style={{ marginTop: 20, alignItems: 'center' }}>
            <Text style={{ color: Colors.textSecondary, fontSize: 12, fontWeight: '700' }}>
              ¿No tienes cuenta?{' '}
              <Text style={{ color: Colors.primary }}>Regístrate</Text>
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}