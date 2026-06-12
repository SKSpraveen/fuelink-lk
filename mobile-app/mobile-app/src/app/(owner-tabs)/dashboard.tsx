import API from '@/api/api';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OwnerDashboardScreen() {
  const [sheds, setSheds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchMySheds = async () => {
    try {
      const response = await API.get('/sheds/my-sheds');
      setSheds(response.data);
    } catch (err) {
      console.error('Failed to load my sheds', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMySheds();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMySheds();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Owner Dashboard 📊</Text>
        <Text style={styles.title}>My Fuel Sheds</Text>
      </View>

      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#208AEF" />
          </View>
        ) : (
          <FlatList
            data={sheds}
            keyExtractor={(item) => item.shedId || item._id}
            renderItem={({ item }) => (
              <Pressable 
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                onPress={() => router.push(`/shed/${item.shedId || item._id}`)}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.shedName}>{item.name}</Text>
                  <View style={[styles.queueBadge, { backgroundColor: item.queueStatus === 'LOW' ? '#064E3B' : item.queueStatus === 'MEDIUM' ? '#78350F' : '#7F1D1D' }]}>
                    <Text style={[styles.queueText, { color: item.queueStatus === 'LOW' ? '#10B981' : item.queueStatus === 'MEDIUM' ? '#F59E0B' : '#EF4444' }]}>
                      {item.queueStatus || 'UNKNOWN'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.address}>{item.address}</Text>
                
                <View style={styles.fuels}>
                  {Object.entries(item.fuelTypes || {}).map(([fuel, available]) => (
                    available ? (
                      <View key={fuel} style={styles.fuelPill}>
                        <Text style={styles.fuelPillText}>{fuel.replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase())}</Text>
                      </View>
                    ) : null
                  ))}
                </View>
              </Pressable>
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#208AEF" />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>🏢</Text>
                <Text style={styles.emptyText}>You haven't registered any sheds yet.</Text>
                <Text style={styles.emptySubText}>Go to the "Add Shed" tab to create one.</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0A0E1A' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 },
  greeting: { color: '#6B7280', fontSize: 14 },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', marginTop: 2 },
  container: { flex: 1, paddingHorizontal: 20 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingTop: 10, paddingBottom: 20 },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
    marginBottom: 12,
  },
  cardPressed: { backgroundColor: '#1F2937' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  shedName: { color: '#F9FAFB', fontSize: 18, fontWeight: '700', flex: 1 },
  queueBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  queueText: { fontSize: 10, fontWeight: '700' },
  address: { color: '#9CA3AF', fontSize: 13, marginBottom: 12 },
  fuels: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  fuelPill: { backgroundColor: '#1A2640', borderWidth: 1, borderColor: '#208AEF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  fuelPillText: { color: '#93C5FD', fontSize: 11, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: '#F9FAFB', fontSize: 16, marginBottom: 8, fontWeight: '600' },
  emptySubText: { color: '#9CA3AF', fontSize: 14 },
});
