import { useAuth } from '@/context/AuthContext';
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const statCards = [
  { label: 'Fuel Quota', value: '20L', unit: 'remaining', color: '#208AEF', emoji: '⛽' },
  { label: 'Next Refill', value: '3', unit: 'days', color: '#F4A820', emoji: '📅' },
  { label: 'Saved', value: 'Rs.2,400', unit: 'this month', color: '#10B981', emoji: '💰' },
];

const recentActivity = [
  { shed: 'Colombo 03 – Shell', date: 'Jun 11, 2025', liters: '10L', status: 'Completed' },
  { shed: 'Nugegoda – Lanka IOC', date: 'Jun 08, 2025', liters: '8L', status: 'Completed' },
  { shed: 'Maharagama – Ceypetco', date: 'Jun 05, 2025', liters: '12L', status: 'Completed' },
];

export default function HomeScreen() {
  const { userToken } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Good morning 👋</Text>
            <Text style={styles.welcome}>Welcome to Fuelink LK</Text>
          </View>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
        </View>

        {/* Alert Banner */}
        <View style={styles.alertBanner}>
          <Text style={styles.alertIcon}>🔔</Text>
          <Text style={styles.alertText}>Quota reset in 3 days. Plan your refill early!</Text>
        </View>

        {/* Stat Cards */}
        <Text style={styles.sectionTitle}>Your Overview</Text>
        <View style={styles.statsRow}>
          {statCards.map((card) => (
            <View key={card.label} style={[styles.statCard, { borderTopColor: card.color }]}>
              <Text style={styles.statEmoji}>{card.emoji}</Text>
              <Text style={[styles.statValue, { color: card.color }]}>{card.value}</Text>
              <Text style={styles.statUnit}>{card.unit}</Text>
              <Text style={styles.statLabel}>{card.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <Pressable style={({ pressed }) => [styles.actionCard, pressed && styles.actionPressed]}>
            <Text style={styles.actionEmoji}>🗺️</Text>
            <Text style={styles.actionLabel}>Find Shed</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.actionCard, pressed && styles.actionPressed]}>
            <Text style={styles.actionEmoji}>📋</Text>
            <Text style={styles.actionLabel}>My Quota</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.actionCard, pressed && styles.actionPressed]}>
            <Text style={styles.actionEmoji}>📊</Text>
            <Text style={styles.actionLabel}>History</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.actionCard, pressed && styles.actionPressed]}>
            <Text style={styles.actionEmoji}>🆘</Text>
            <Text style={styles.actionLabel}>Support</Text>
          </Pressable>
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityList}>
          {recentActivity.map((item, idx) => (
            <View key={idx} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Text style={{ fontSize: 20 }}>⛽</Text>
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityShed}>{item.shed}</Text>
                <Text style={styles.activityDate}>{item.date}</Text>
              </View>
              <View style={styles.activityRight}>
                <Text style={styles.activityLiters}>{item.liters}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0A0E1A' },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: { color: '#6B7280', fontSize: 14 },
  welcome: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginTop: 2 },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1F2937',
    borderWidth: 2,
    borderColor: '#208AEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 22 },
  alertBanner: {
    backgroundColor: '#1A2640',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#208AEF',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 10,
  },
  alertIcon: { fontSize: 18 },
  alertText: { color: '#93C5FD', fontSize: 13, flex: 1, lineHeight: 18 },
  sectionTitle: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  statCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1F2937',
    borderTopWidth: 3,
    alignItems: 'center',
    gap: 2,
  },
  statEmoji: { fontSize: 20, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '800' },
  statUnit: { color: '#6B7280', fontSize: 11 },
  statLabel: { color: '#9CA3AF', fontSize: 11, fontWeight: '600', textAlign: 'center' },
  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  actionCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1F2937',
    gap: 6,
  },
  actionPressed: { backgroundColor: '#1F2937' },
  actionEmoji: { fontSize: 24 },
  actionLabel: { color: '#9CA3AF', fontSize: 11, fontWeight: '600' },
  activityList: { gap: 12 },
  activityItem: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1F2937',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A2640',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityInfo: { flex: 1 },
  activityShed: { color: '#F9FAFB', fontSize: 13, fontWeight: '600', marginBottom: 2 },
  activityDate: { color: '#6B7280', fontSize: 12 },
  activityRight: { alignItems: 'flex-end', gap: 4 },
  activityLiters: { color: '#208AEF', fontSize: 15, fontWeight: '700' },
  statusBadge: { backgroundColor: '#064E3B', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  statusText: { color: '#10B981', fontSize: 10, fontWeight: '700' },
});
