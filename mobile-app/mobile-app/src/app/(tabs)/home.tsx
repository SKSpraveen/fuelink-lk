import { useAuth } from '@/context/AuthContext';
import { StyleSheet, Text, View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import API from '@/api/api';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { userToken, user } = useAuth();
  const router = useRouter();
  const [nearestShed, setNearestShed] = useState<any>(null);
  const [fuelPrices, setFuelPrices] = useState<any>(null);
  const [communityReports, setCommunityReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [emergencyAlert, setEmergencyAlert] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch nearest shed
      const shedsRes = await API.get('/sheds/nearby-sheds', {
        params: { lat: 6.9271, lng: 80.7744, radius: 5000 }
      });
      if (shedsRes.data && shedsRes.data.length > 0) {
        setNearestShed(shedsRes.data[0]);
      }

      // Mock fuel prices (replace with real API)
      setFuelPrices({
        petrol92: 289.50,
        petrol95: 304.75,
        diesel: 286.25,
        superDiesel: 298.00,
        lastUpdated: new Date().toLocaleString()
      });

      // Mock community reports (replace with real API)
      setCommunityReports([
        { id: 1, shed: 'Shell Colombo 3', type: 'High Queue', count: 12, time: '5 mins ago' },
        { id: 2, shed: 'IOC Nugegoda', type: 'Low Stock', count: 8, time: '12 mins ago' },
      ]);

      // Mock emergency alert
      setEmergencyAlert({
        type: 'SHORTAGE',
        message: 'Petrol 92 shortage reported in Colombo area',
        severity: 'HIGH',
        affectedAreas: ['Colombo 1-7', 'Matara', 'Galle']
      });

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getQueueStatusColor = (status: string) => {
    switch (status) {
      case 'LOW': return { color: '#10B981', bg: '#064E3B' };
      case 'MEDIUM': return { color: '#F59E0B', bg: '#78350F' };
      case 'HIGH': return { color: '#EF4444', bg: '#7F1D1D' };
      default: return { color: '#6B7280', bg: '#1F2937' };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#208AEF" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const shedStatusColor = nearestShed ? getQueueStatusColor(nearestShed.queueStatus) : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ==================== HEADER ==================== */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getTimeGreeting()} 👋</Text>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
          </View>
          <Pressable style={styles.profileButton} onPress={() => router.push('/(tabs)/profile')}>
            <View style={styles.profileCircle}>
              <Text style={styles.profileEmoji}>👤</Text>
            </View>
          </Pressable>
        </View>

        {/* ==================== SMART ALERT BANNER ==================== */}
        <View style={styles.smartAlertContainer}>
          <View style={styles.alertBadge}>
            <Text style={styles.alertBadgeText}>⏰ SMART ALERT</Text>
          </View>
          <View style={styles.smartAlertBox}>
            <Text style={styles.alertIcon}>🔔</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>Quota Reset in 3 Days</Text>
              <Text style={styles.alertSubtext}>Plan your refill to avoid running out</Text>
            </View>
            <Pressable>
              <Text style={styles.alertAction}>→</Text>
            </Pressable>
          </View>
        </View>

        {/* ==================== LIVE SHED STATUS CARD (MOST IMPORTANT) ==================== */}
        {nearestShed && (
          <View style={styles.sectionContainer}>
            <View style={styles.liveBadgeContainer}>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveBadgeText}>LIVE NOW</Text>
              </View>
            </View>

            <Pressable 
              style={[styles.liveStatusCard, { borderLeftColor: shedStatusColor?.color, borderLeftWidth: 5 }]}
              onPress={() => router.push(`/(tabs)/map`)}
            >
              {/* Header Section */}
              <View style={styles.liveCardHeader}>
                <View style={styles.liveCardHeaderLeft}>
                  <Text style={styles.liveCardLabel}>Nearest Active Shed</Text>
                  <Text style={styles.liveCardShedName}>{nearestShed.name}</Text>
                  <Text style={styles.liveCardDistance}>📍 2.3 km away</Text>
                </View>
                <View style={[styles.statusIndicator, { backgroundColor: shedStatusColor?.bg }]}>
                  <View style={[styles.statusDot, { backgroundColor: shedStatusColor?.color }]} />
                </View>
              </View>

              {/* Fuel Types Available */}
              <View style={styles.fuelTypesContainer}>
                <Text style={styles.fuelTypesLabel}>Available Fuels:</Text>
                <View style={styles.fuelTypesRow}>
                  {nearestShed.fuelTypes?.petrol92 && (
                    <View style={[styles.fuelBadge, styles.fuelAvailable]}>
                      <Text style={styles.fuelBadgeText}>⛽ Petrol 92</Text>
                    </View>
                  )}
                  {nearestShed.fuelTypes?.petrol95 && (
                    <View style={[styles.fuelBadge, styles.fuelAvailable]}>
                      <Text style={styles.fuelBadgeText}>⛽ Petrol 95</Text>
                    </View>
                  )}
                  {nearestShed.fuelTypes?.diesel && (
                    <View style={[styles.fuelBadge, styles.fuelAvailable]}>
                      <Text style={styles.fuelBadgeText}>🛢️ Diesel</Text>
                    </View>
                  )}
                  {nearestShed.fuelTypes?.superDiesel && (
                    <View style={[styles.fuelBadge, styles.fuelAvailable]}>
                      <Text style={styles.fuelBadgeText}>🛢️ Super Diesel</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Queue Status Section */}
              <View style={styles.queueStatusSection}>
                <View style={styles.queueStatusItem}>
                  <Text style={styles.queueStatusItemLabel}>Queue Status</Text>
                  <View style={[styles.queueStatusBadge, { backgroundColor: shedStatusColor?.bg }]}>
                    <Text style={[styles.queueStatusBadgeText, { color: shedStatusColor?.color }]}>
                      {nearestShed.queueStatus === 'LOW' ? '🟢 Low' : nearestShed.queueStatus === 'MEDIUM' ? '🟡 Moderate' : '🔴 High'}
                    </Text>
                  </View>
                </View>

                <View style={styles.queueStatusItem}>
                  <Text style={styles.queueStatusItemLabel}>Wait Time</Text>
                  <Text style={styles.queueWaitTime}>~{nearestShed.waitTime || 0} mins</Text>
                </View>

                <View style={styles.queueStatusItem}>
                  <Text style={styles.queueStatusItemLabel}>In Queue</Text>
                  <Text style={styles.queueVehicleCount}>{nearestShed.queueCount || 0} 🚗</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.liveCardActions}>
                <Pressable style={styles.primaryAction} onPress={() => router.push(`/(tabs)/map`)}>
                  <Text style={styles.primaryActionText}>→ Join Queue</Text>
                </Pressable>
                <Pressable style={styles.secondaryAction} onPress={() => router.push(`/(tabs)/map`)}>
                  <Text style={styles.secondaryActionText}>📍 View Map</Text>
                </Pressable>
              </View>

              {/* Last Updated */}
              <Text style={styles.lastUpdatedText}>Updated just now</Text>
            </Pressable>
          </View>
        )}

        {/* ==================== LIVE QUEUE STATUS ==================== */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>📊 Live Queue Status</Text>
          <View style={styles.queueStatusGrid}>
            <View style={styles.queueStatusCard}>
              <View style={[styles.queueDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.queueStatusLabel}>Low</Text>
              <Text style={styles.queueStatusCount}>4 Sheds</Text>
            </View>
            <View style={styles.queueStatusCard}>
              <View style={[styles.queueDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.queueStatusLabel}>Medium</Text>
              <Text style={styles.queueStatusCount}>8 Sheds</Text>
            </View>
            <View style={styles.queueStatusCard}>
              <View style={[styles.queueDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.queueStatusLabel}>High</Text>
              <Text style={styles.queueStatusCount}>3 Sheds</Text>
            </View>
          </View>
        </View>


        {/* ==================== COMMUNITY REPORTS ==================== */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>👥 Community Reports</Text>
          <View style={styles.reportsContainer}>
            {communityReports.map((report) => (
              <View key={report.id} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <View>
                    <Text style={styles.reportShed}>{report.shed}</Text>
                    <Text style={styles.reportType}>{report.type}</Text>
                  </View>
                  <View style={styles.reportCount}>
                    <Text style={styles.reportCountText}>{report.count}</Text>
                  </View>
                </View>
                <Text style={styles.reportTime}>{report.time}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ==================== EMERGENCY ALERT SECTION ==================== */}
        {emergencyAlert && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>⚠️ Emergency Alerts</Text>
            <View style={[styles.emergencyCard, { borderLeftColor: '#EF4444' }]}>
              <View style={styles.emergencyHeader}>
                <Text style={styles.emergencyIcon}>🚨</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.emergencyTitle}>{emergencyAlert.type}</Text>
                  <Text style={styles.emergencyMessage}>{emergencyAlert.message}</Text>
                </View>
              </View>
              <View style={styles.emergencyAffected}>
                <Text style={styles.emergencyAffectedLabel}>Affected Areas:</Text>
                <View style={styles.emergencyAreaTags}>
                  {emergencyAlert.affectedAreas.map((area: string, idx: number) => (
                    <View key={idx} style={styles.areaTag}>
                      <Text style={styles.areaTagText}>{area}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <Pressable style={styles.emergencyAction}>
                <Text style={styles.emergencyActionText}>View Details →</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ==================== FUEL PRICES ==================== */}
        {fuelPrices && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>⛽ Current Fuel Prices</Text>
            <View style={styles.priceGrid}>
              <View style={styles.priceCard}>
                <Text style={styles.priceType}>Petrol 92</Text>
                <Text style={styles.price}>Rs {fuelPrices.petrol92}</Text>
                <Text style={styles.priceChange}>↓ 0.50</Text>
              </View>
              <View style={styles.priceCard}>
                <Text style={styles.priceType}>Petrol 95</Text>
                <Text style={styles.price}>Rs {fuelPrices.petrol95}</Text>
                <Text style={styles.priceChange}>↑ 1.25</Text>
              </View>
              <View style={styles.priceCard}>
                <Text style={styles.priceType}>Diesel</Text>
                <Text style={styles.price}>Rs {fuelPrices.diesel}</Text>
                <Text style={styles.priceChange}>↓ 0.75</Text>
              </View>
              <View style={styles.priceCard}>
                <Text style={styles.priceType}>Super Diesel</Text>
                <Text style={styles.price}>Rs {fuelPrices.superDiesel}</Text>
                <Text style={styles.priceChange}>→ 0.00</Text>
              </View>
            </View>
            <Text style={styles.priceUpdated}>Last updated: {fuelPrices.lastUpdated}</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0A0E1A' },
  scroll: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 },
  loadingText: { color: '#93C5FD', marginTop: 12, fontSize: 14 },

  // ===== HEADER =====
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  headerLeft: {},
  greeting: { color: '#6B7280', fontSize: 13 },
  userName: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginTop: 4 },
  profileButton: { padding: 8 },
  profileCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1F2937',
    borderWidth: 2,
    borderColor: '#208AEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileEmoji: { fontSize: 24 },

  // ===== SMART ALERT =====
  smartAlertContainer: { marginBottom: 24 },
  alertBadge: { backgroundColor: '#1A2640', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 8 },
  alertBadgeText: { color: '#93C5FD', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  smartAlertBox: {
    backgroundColor: '#111827',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#208AEF',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  alertIcon: { fontSize: 24 },
  alertTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginBottom: 2 },
  alertSubtext: { color: '#9CA3AF', fontSize: 12 },
  alertAction: { color: '#208AEF', fontSize: 18, fontWeight: '700' },

  // ===== SECTIONS =====
  sectionContainer: { marginBottom: 24 },
  sectionTitle: { color: '#F9FAFB', fontSize: 15, fontWeight: '800', marginBottom: 12, letterSpacing: 0.3 },

  // ===== NEAREST SHED (REPLACED WITH LIVE STATUS) =====
  liveStatusCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#208AEF',
    overflow: 'hidden',
    paddingBottom: 12,
  },
  liveCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 12,
  },
  liveCardHeaderLeft: {
    flex: 1,
  },
  liveCardLabel: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  liveCardShedName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 4,
  },
  liveCardDistance: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
  },
  statusIndicator: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  statusDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },

  // ===== FUEL TYPES =====
  liveBadgeContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  liveBadge: {
    backgroundColor: '#064E3B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveBadgeText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  fuelTypesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#2D3748',
  },
  fuelTypesLabel: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
  },
  fuelTypesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fuelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  fuelAvailable: {
    backgroundColor: '#064E3B',
    borderColor: '#10B981',
  },
  fuelBadgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },

  // ===== QUEUE STATUS SECTION =====
  queueStatusSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#2D3748',
  },
  queueStatusItem: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  queueStatusItemLabel: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '600',
  },
  queueStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  queueStatusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  queueWaitTime: {
    color: '#208AEF',
    fontSize: 14,
    fontWeight: '800',
  },
  queueVehicleCount: {
    color: '#F9FAFB',
    fontSize: 14,
    fontWeight: '800',
  },

  // ===== ACTION BUTTONS =====
  liveCardActions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryAction: {
    flex: 1,
    backgroundColor: '#208AEF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryAction: {
    flex: 1,
    backgroundColor: '#1F2937',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  secondaryActionText: {
    color: '#93C5FD',
    fontSize: 13,
    fontWeight: '700',
  },

  // ===== LAST UPDATED =====
  lastUpdatedText: {
    color: '#6B7280',
    fontSize: 10,
    textAlign: 'center',
    paddingHorizontal: 16,
  },

  nearestShedCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
    overflow: 'hidden',
  },
  shedCardHeader: {
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  shedName: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginBottom: 4 },
  shedAddress: { color: '#6B7280', fontSize: 11 },
  distanceBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  distanceText: { fontSize: 13, fontWeight: '700' },
  shedCardDivider: { height: 1, backgroundColor: '#1F2937' },
  shedCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    gap: 8,
  },
  shedStat: { flex: 1, alignItems: 'center' },
  shedStatLabel: { color: '#6B7280', fontSize: 10, fontWeight: '600', marginBottom: 4 },
  shedStatValue: { fontSize: 13, fontWeight: '700' },
  shedStatusBadge: { fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderRadius: 4 },
  joinButton: {
    backgroundColor: '#208AEF',
    margin: 12,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  joinButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

  // ===== QUEUE STATUS =====
  queueStatusGrid: { flexDirection: 'row', gap: 10 },
  queueStatusCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  queueDot: { width: 12, height: 12, borderRadius: 6 },
  queueStatusLabel: { color: '#9CA3AF', fontSize: 11, fontWeight: '600' },
  queueStatusCount: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

  // ===== MINI MAP =====
  miniMapHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  viewAllLink: { color: '#208AEF', fontSize: 11, fontWeight: '600' },
  miniMapPlaceholder: {
    backgroundColor: '#111827',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F2937',
    paddingVertical: 32,
    alignItems: 'center',
    gap: 8,
  },
  miniMapIcon: { fontSize: 32 },
  miniMapText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  miniMapSubtext: { color: '#6B7280', fontSize: 11 },

  // ===== COMMUNITY REPORTS =====
  reportsContainer: { gap: 10 },
  reportCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
    padding: 12,
  },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  reportShed: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', marginBottom: 2 },
  reportType: { color: '#F59E0B', fontSize: 11, fontWeight: '600' },
  reportCount: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  reportCountText: { color: '#111827', fontSize: 11, fontWeight: '700' },
  reportTime: { color: '#6B7280', fontSize: 10 },

  // ===== EMERGENCY ALERT =====
  emergencyCard: {
    backgroundColor: '#1F1219',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#7F1D1D',
    borderLeftWidth: 4,
    padding: 14,
    gap: 12,
  },
  emergencyHeader: { flexDirection: 'row', gap: 10 },
  emergencyIcon: { fontSize: 20 },
  emergencyTitle: { color: '#FCA5A5', fontSize: 12, fontWeight: '700', marginBottom: 2 },
  emergencyMessage: { color: '#EF4444', fontSize: 11 },
  emergencyAffected: { gap: 6 },
  emergencyAffectedLabel: { color: '#9CA3AF', fontSize: 10, fontWeight: '600' },
  emergencyAreaTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  areaTag: {
    backgroundColor: '#7F1D1D',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  areaTagText: { color: '#FCA5A5', fontSize: 10, fontWeight: '600' },
  emergencyAction: {
    backgroundColor: '#7F1D1D',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  emergencyActionText: { color: '#FCA5A5', fontSize: 11, fontWeight: '700' },

  // ===== FUEL PRICES =====
  priceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  priceCard: {
    width: '48%',
    backgroundColor: '#111827',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  priceType: { color: '#9CA3AF', fontSize: 11, fontWeight: '600' },
  price: { color: '#208AEF', fontSize: 16, fontWeight: '800' },
  priceChange: { color: '#10B981', fontSize: 10, fontWeight: '700' },
  priceUpdated: { color: '#6B7280', fontSize: 10, marginTop: 12, textAlign: 'center' },
});
