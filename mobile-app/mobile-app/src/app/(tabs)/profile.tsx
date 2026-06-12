import { useAuth } from '@/context/AuthContext';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const menuItems = [
  { emoji: '📋', label: 'My Quota', sub: 'View remaining fuel quota' },
  { emoji: '📊', label: 'Fuel History', sub: 'Past refills and transactions' },
  { emoji: '🔔', label: 'Notifications', sub: 'Manage alerts & reminders' },
  { emoji: '🆔', label: 'NIC / Vehicle Info', sub: 'Update your registered info' },
  { emoji: '🔒', label: 'Change Password', sub: 'Update your security settings' },
  { emoji: '🆘', label: 'Help & Support', sub: 'Contact us or view FAQs' },
];

export default function ProfileScreen() {
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Profile Hero */}
        <View style={styles.profileHero}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <Text style={styles.userName}>John Doe</Text>
          <Text style={styles.userEmail}>john.doe@example.com</Text>
          <View style={styles.memberBadge}>
            <Text style={styles.memberBadgeText}>⭐ Verified Member</Text>
          </View>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsSummary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>47</Text>
            <Text style={styles.summaryLabel}>Total Refills</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>320L</Text>
            <Text style={styles.summaryLabel}>Total Fuel</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>Rs.48K</Text>
            <Text style={styles.summaryLabel}>Total Spent</Text>
          </View>
        </View>

        {/* Vehicle Card */}
        <View style={styles.vehicleCard}>
          <View style={styles.vehicleLeft}>
            <Text style={styles.vehicleEmoji}>🚗</Text>
            <View>
              <Text style={styles.vehiclePlate}>WP · CAR · 1234</Text>
              <Text style={styles.vehicleType}>Personal Vehicle · Petrol</Text>
            </View>
          </View>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Active</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, idx) => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [
                styles.menuItem,
                idx === 0 && styles.menuFirst,
                idx === menuItems.length - 1 && styles.menuLast,
                pressed && styles.menuItemPressed,
              ]}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconCircle}>
                  <Text style={{ fontSize: 18 }}>{item.emoji}</Text>
                </View>
                <View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuSub}>{item.sub}</Text>
                </View>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </Pressable>
          ))}
        </View>

        {/* Logout */}
        <Pressable
          style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutPressed]}
          onPress={handleLogout}>
          <Text style={styles.logoutEmoji}>🚪</Text>
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>

        <Text style={styles.versionText}>Fuelink LK v1.0.0 · Made in Sri Lanka 🇱🇰</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0A0E1A' },
  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40, gap: 20 },
  profileHero: { alignItems: 'center', gap: 8 },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#1F2937',
    borderWidth: 3,
    borderColor: '#208AEF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#208AEF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarEmoji: { fontSize: 40 },
  userName: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginTop: 4 },
  userEmail: { color: '#6B7280', fontSize: 14 },
  memberBadge: {
    backgroundColor: '#1A2640',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#208AEF44',
  },
  memberBadgeText: { color: '#93C5FD', fontSize: 12, fontWeight: '700' },
  statsSummary: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  summaryLabel: { color: '#6B7280', fontSize: 12 },
  summaryDivider: { width: 1, backgroundColor: '#1F2937', marginVertical: 4 },
  vehicleCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vehicleLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  vehicleEmoji: { fontSize: 32 },
  vehiclePlate: { color: '#F9FAFB', fontSize: 15, fontWeight: '700' },
  vehicleType: { color: '#6B7280', fontSize: 12, marginTop: 2 },
  verifiedBadge: {
    backgroundColor: '#064E3B',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  verifiedText: { color: '#10B981', fontSize: 12, fontWeight: '700' },
  menuSection: {
    backgroundColor: '#111827',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1F2937',
    overflow: 'hidden',
  },
  menuFirst: { borderTopLeftRadius: 18, borderTopRightRadius: 18 },
  menuLast: { borderBottomLeftRadius: 18, borderBottomRightRadius: 18 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  menuItemPressed: { backgroundColor: '#1A2337' },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  menuIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { color: '#F9FAFB', fontSize: 14, fontWeight: '600' },
  menuSub: { color: '#6B7280', fontSize: 12, marginTop: 1 },
  menuArrow: { color: '#374151', fontSize: 22 },
  logoutBtn: {
    backgroundColor: '#1A0A0A',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#EF444433',
  },
  logoutPressed: { backgroundColor: '#2A0A0A' },
  logoutEmoji: { fontSize: 18 },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: '700' },
  versionText: { textAlign: 'center', color: '#374151', fontSize: 12 },
});
