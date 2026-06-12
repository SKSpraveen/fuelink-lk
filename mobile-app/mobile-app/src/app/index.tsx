import API from '@/api/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const { setUserAuth } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const response = await API.post('/auth/login', { email: email.trim(), password });
      await setUserAuth(response.data.token, response.data.user.role);
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.response?.data?.message || 'Invalid credentials. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        enabled={Platform.OS === 'ios'}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>⛽</Text>
            </View>
            <Text style={styles.appName}>Fuelink LK</Text>
            <Text style={styles.tagline}>Your smart fuel companion</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardSubtitle}>Sign in to your account</Text>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>📧</Text>
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor="#6B7280"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#6B7280"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            {/* Login Button */}
            <Pressable
              style={({ pressed }) => [styles.loginBtn, pressed && styles.loginBtnPressed]}
              onPress={handleLogin}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginBtnText}>Sign In</Text>
              )}
            </Pressable>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Register Link */}
            <Pressable
              style={({ pressed }) => [styles.registerBtn, pressed && styles.registerBtnPressed]}
              onPress={() => router.push('/register')}>
              <Text style={styles.registerBtnText}>Create New Account</Text>
            </Pressable>
          </View>

          <Text style={styles.footer}>© 2025 Fuelink LK. All rights reserved.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#1A2640',
    borderWidth: 2,
    borderColor: '#208AEF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#208AEF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  logoEmoji: {
    fontSize: 40,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 14,
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 28,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#374151',
    paddingHorizontal: 14,
    paddingVertical: 2,
  },
  inputFocused: {
    borderColor: '#208AEF',
    shadowColor: '#208AEF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#F9FAFB',
    fontSize: 15,
    paddingVertical: 14,
  },
  loginBtn: {
    backgroundColor: '#208AEF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#208AEF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  loginBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#374151',
  },
  dividerText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
  },
  registerBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#374151',
    backgroundColor: 'transparent',
  },
  registerBtnPressed: {
    backgroundColor: '#1F2937',
  },
  registerBtnText: {
    color: '#9CA3AF',
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    color: '#374151',
    fontSize: 12,
    marginTop: 24,
  },
});
