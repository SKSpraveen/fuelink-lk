import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { userRole, logout } = useAuth();
  const router = useRouter();
  const { userToken, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Profile</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.roleText}> {user?.name || 'User'}</Text>
          <Text style={styles.subText}>Manage your account details and preferences.</Text>
        </View>

        <Pressable style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutBtnPressed]} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0A0E1A' },
  container: { flex: 1, padding: 20 },
  header: { marginBottom: 30, marginTop: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
  card: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1F2937',
    marginBottom: 40,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1A2640',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#208AEF',
  },
  avatarText: { fontSize: 40 },
  roleText: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8, textTransform: 'capitalize' },
  subText: { fontSize: 14, color: '#9CA3AF', textAlign: 'center' },
  logoutBtn: {
    backgroundColor: '#EF4444',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutBtnPressed: {
    opacity: 0.8,
  },
  logoutBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
