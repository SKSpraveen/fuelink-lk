import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const sheds = [
  { id: '1', name: 'Shell – Colombo 03', district: 'Colombo', fuelTypes: ['Petrol 92', 'Petrol 95', 'Diesel'], waitTime: '~15 min', status: 'Open', slots: 8 },
  { id: '2', name: 'Lanka IOC – Nugegoda', district: 'Colombo', fuelTypes: ['Petrol 92', 'Diesel'], waitTime: '~30 min', status: 'Open', slots: 3 },
  { id: '3', name: 'Ceypetco – Maharagama', district: 'Colombo', fuelTypes: ['Petrol 92', 'Kerosene'], waitTime: '~45 min', status: 'Busy', slots: 1 },
  { id: '4', name: 'Shell – Kandy City', district: 'Kandy', fuelTypes: ['Petrol 92', 'Petrol 95', 'Diesel'], waitTime: '~10 min', status: 'Open', slots: 12 },
  { id: '5', name: 'Lanka IOC – Galle Fort', district: 'Galle', fuelTypes: ['Petrol 92', 'Diesel'], waitTime: '~20 min', status: 'Open', slots: 5 },
  { id: '6', name: 'Ceypetco – Jaffna City', district: 'Jaffna', fuelTypes: ['Petrol 92', 'Kerosene', 'Diesel'], waitTime: 'Closed', status: 'Closed', slots: 0 },
];

const statusColor: Record<string, string> = {
  Open: '#10B981',
  Busy: '#F4A820',
  Closed: '#EF4444',
};

export default function ShedsScreen() {
  const [search, setSearch] = useState('');

  const filtered = sheds.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.district.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>⛽ Fuel Sheds</Text>
        <Text style={styles.screenSub}>Find nearby fuel stations</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or district..."
          placeholderTextColor="#6B7280"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>
          {filtered.length} shed{filtered.length !== 1 ? 's' : ''} found
        </Text>

        {filtered.map((shed) => (
          <Pressable
            key={shed.id}
            style={({ pressed }) => [styles.shedCard, pressed && styles.shedCardPressed]}>
            <View style={styles.shedHeader}>
              <View style={styles.shedIconCircle}>
                <Text style={{ fontSize: 22 }}>⛽</Text>
              </View>
              <View style={styles.shedInfo}>
                <Text style={styles.shedName}>{shed.name}</Text>
                <Text style={styles.shedDistrict}>📍 {shed.district}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusColor[shed.status] + '22' }]}>
                <View style={[styles.statusDot, { backgroundColor: statusColor[shed.status] }]} />
                <Text style={[styles.statusText, { color: statusColor[shed.status] }]}>{shed.status}</Text>
              </View>
            </View>

            <View style={styles.shedDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>⏱️</Text>
                <Text style={styles.detailText}>{shed.waitTime}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>🚗</Text>
                <Text style={styles.detailText}>{shed.slots} slots</Text>
              </View>
            </View>

            <View style={styles.fuelTypeRow}>
              {shed.fuelTypes.map((fuel) => (
                <View key={fuel} style={styles.fuelTag}>
                  <Text style={styles.fuelTagText}>{fuel}</Text>
                </View>
              ))}
            </View>

            <Pressable
              style={({ pressed }) => [styles.bookBtn, pressed && { opacity: 0.8 }]}
              disabled={shed.status === 'Closed'}>
              <Text style={[styles.bookBtnText, shed.status === 'Closed' && { color: '#6B7280' }]}>
                {shed.status === 'Closed' ? 'Currently Closed' : 'Book Slot →'}
              </Text>
            </Pressable>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0A0E1A' },
  topBar: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  screenTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  screenSub: { color: '#6B7280', fontSize: 13, marginTop: 2 },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    marginHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F2937',
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  searchIcon: { fontSize: 16, marginRight: 10 },
  searchInput: { flex: 1, color: '#F9FAFB', fontSize: 15, paddingVertical: 14 },
  scroll: { paddingHorizontal: 20, paddingBottom: 32, gap: 14 },
  sectionLabel: { color: '#6B7280', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  shedCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
    gap: 12,
  },
  shedCardPressed: { backgroundColor: '#1A2337' },
  shedHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  shedIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1A2640',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#208AEF33',
  },
  shedInfo: { flex: 1 },
  shedName: { color: '#F9FAFB', fontSize: 14, fontWeight: '700' },
  shedDistrict: { color: '#6B7280', fontSize: 12, marginTop: 2 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  shedDetails: { flexDirection: 'row', gap: 20 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailIcon: { fontSize: 13 },
  detailText: { color: '#9CA3AF', fontSize: 13 },
  fuelTypeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  fuelTag: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#374151',
  },
  fuelTagText: { color: '#9CA3AF', fontSize: 11, fontWeight: '600' },
  bookBtn: {
    backgroundColor: '#1A2640',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#208AEF44',
  },
  bookBtnText: { color: '#208AEF', fontSize: 14, fontWeight: '700' },
});
