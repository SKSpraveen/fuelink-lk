import API from '@/api/api';
import { useAuth } from '@/context/AuthContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ShedDetailScreen() {
  const { id } = useLocalSearchParams();
  const { userRole } = useAuth();
  const router = useRouter();

  const [shed, setShed] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchShed = async () => {
    try {
      const response = await API.get(`/sheds/${id}`);
      setShed(response.data);
    } catch (err) {
      console.error('Failed to fetch shed details', err);
      Alert.alert('Error', 'Failed to load shed details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShed();
  }, [id]);

  const updateQueue = async (status: string) => {
    setUpdating(true);
    try {
      await API.post('/sheds/update-queue', { shedId: id, queueStatus: status });
      setShed({ ...shed, queueStatus: status });
      Alert.alert('Success', 'Queue status updated.');
    } catch (err) {
      Alert.alert('Error', 'Failed to update queue.');
    } finally {
      setUpdating(false);
    }
  };

  const startChat = () => {
    if (!shed?.ownerId) {
      Alert.alert('Error', 'Cannot start chat with this shed.');
      return;
    }
    router.push(`/messages/${shed.ownerId}`);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#208AEF" />
      </View>
    );
  }

  if (!shed) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: '#fff' }}>Shed not found.</Text>
      </View>
    );
  }

  const isOwner = userRole === 'SHED_OWNER';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{shed.name}</Text>
          <Text style={styles.address}>{shed.address}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Queue Status</Text>
          <View style={styles.queueContainer}>
            {['LOW', 'MEDIUM', 'HIGH'].map((status) => {
              const isActive = shed.queueStatus === status;
              return (
                <Pressable
                  key={status}
                  disabled={!isOwner || updating}
                  onPress={() => updateQueue(status)}
                  style={[
                    styles.queueBtn,
                    isActive && styles.queueBtnActive,
                    status === 'LOW' && isActive && { borderColor: '#10B981', backgroundColor: '#064E3B' },
                    status === 'MEDIUM' && isActive && { borderColor: '#F59E0B', backgroundColor: '#78350F' },
                    status === 'HIGH' && isActive && { borderColor: '#EF4444', backgroundColor: '#7F1D1D' },
                  ]}
                >
                  <Text style={[styles.queueBtnText, isActive && { fontWeight: 'bold' }]}>{status}</Text>
                </Pressable>
              );
            })}
          </View>
          {isOwner && <Text style={styles.hint}>Tap to update the queue status</Text>}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Fuel Availability</Text>
          <View style={styles.fuels}>
            {Object.entries(shed.fuelTypes || {}).map(([fuel, available]) => (
              <View key={fuel} style={[styles.fuelPill, !available && styles.fuelPillUnavailable]}>
                <Text style={[styles.fuelPillText, !available && styles.fuelPillTextUnavailable]}>
                  {fuel.replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase())}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {!isOwner && (
          <Pressable style={styles.chatBtn} onPress={startChat}>
            <Text style={styles.chatBtnText}>💬 Start Chat with Shed Owner</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0A0E1A' },
  container: { padding: 20 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0E1A' },
  header: { marginBottom: 20 },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
  address: { color: '#9CA3AF', fontSize: 14, marginTop: 4 },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
    marginBottom: 20,
  },
  sectionTitle: { color: '#F9FAFB', fontSize: 16, fontWeight: '600', marginBottom: 12 },
  queueContainer: { flexDirection: 'row', gap: 10 },
  queueBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#374151',
    backgroundColor: '#1F2937',
  },
  queueBtnActive: { borderWidth: 2 },
  queueBtnText: { color: '#D1D5DB', fontSize: 12 },
  hint: { color: '#6B7280', fontSize: 12, marginTop: 10, textAlign: 'center' },
  fuels: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fuelPill: {
    backgroundColor: '#1A2640',
    borderWidth: 1,
    borderColor: '#208AEF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  fuelPillUnavailable: { backgroundColor: '#1F2937', borderColor: '#374151' },
  fuelPillText: { color: '#93C5FD', fontSize: 12, fontWeight: '600' },
  fuelPillTextUnavailable: { color: '#6B7280' },
  chatBtn: {
    backgroundColor: '#208AEF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  chatBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
