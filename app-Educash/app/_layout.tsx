import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { FinanceProvider } from '../context/FinanceContext';

function RootNavigation() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (loading || !ready) return;
    const inAuth = segments[0] === 'login' || segments[0] === 'register';
    if (!user && !inAuth) router.replace('/login');
    else if (user && inAuth) router.replace('/dashboard');
  }, [user, loading, segments, ready]);

  if (loading || !ready) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0f', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#7c3aed" size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a0f' }}>
      <View style={{
        position: 'absolute', width: '100%', zIndex: 10,
        backgroundColor: '#0a0a0f', paddingTop: 50, paddingBottom: 12,
        alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#1e1e2e',
      }}>
        <Text style={{ fontSize: 20, color: '#e2e2ff', fontWeight: '900', letterSpacing: 3 }}>
          💜 EDUCASH
        </Text>
      </View>
      <View style={{ flex: 1, paddingTop: 95 }}>
        <Slot />
      </View>
      <StatusBar style="light" />
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <RootNavigation />
      </FinanceProvider>
    </AuthProvider>
  );
}