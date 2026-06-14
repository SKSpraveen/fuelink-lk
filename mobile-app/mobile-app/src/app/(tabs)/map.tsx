import API from '@/api/api';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, Pressable } from 'react-native';
import MapView, { Marker, Callout } from '@/components/Map';
import { useSmartQueue } from '@/hooks/useSmartQueue';
import SmartQueuePopup from '@/components/SmartQueuePopup';

export default function MapScreen() {
  const router = useRouter();
  const [sheds, setSheds] = useState<any[]>([]);
  const [location, setLocation] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const { isPossibleQueue, suggestedShed, inQueueSession, joinQueue, declineQueue } = useSmartQueue(sheds);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);

      try {
        const response = await API.get('/sheds/nearby-sheds', {
          params: { lat: loc.coords.latitude, lng: loc.coords.longitude, radius: 10000 }
        });
        setSheds(response.data);
      } catch (err) {
        console.error("Failed to fetch nearby sheds", err);
      }
    })();
  }, []);

  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'LOW': return '#10B981'; // Green
      case 'MEDIUM': return '#F59E0B'; // Yellow
      case 'HIGH': return '#EF4444'; // Red
      default: return '#6B7280'; // Gray
    }
  };

  if (!location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#208AEF" />
        <Text style={styles.loadingText}>Finding nearby sheds...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
      >
        {sheds.map((shed) => (
          <Marker
            key={shed._id || shed.shedId}
            coordinate={{
              latitude: shed.location.coordinates[1],
              longitude: shed.location.coordinates[0],
            }}
            pinColor={getMarkerColor(shed.queueStatus)}
            title={shed.name}
            description={inQueueSession?.shedId === (shed._id || shed.shedId) ? "You are in this queue" : `Wait: ~${shed.waitTime || 0} mins | Tap for details`}
            onCalloutPress={() => router.push(`/shed/${shed._id || shed.shedId}`)}
          />
        ))}
      </MapView>
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Queue Status:</Text>
        <View style={styles.legendRow}><View style={[styles.dot, { backgroundColor: '#10B981' }]} /><Text style={styles.legendText}>Low</Text></View>
        <View style={styles.legendRow}><View style={[styles.dot, { backgroundColor: '#F59E0B' }]} /><Text style={styles.legendText}>Medium</Text></View>
        <View style={styles.legendRow}><View style={[styles.dot, { backgroundColor: '#EF4444' }]} /><Text style={styles.legendText}>High</Text></View>
      </View>

      <SmartQueuePopup 
        visible={isPossibleQueue && !inQueueSession} 
        shedName={suggestedShed?.name || "nearby shed"} 
        onConfirm={(lat, lon) => joinQueue(suggestedShed?.shedId || suggestedShed?._id, lat, lon)} 
        onDecline={declineQueue} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0E1A' },
  loadingText: { color: '#9CA3AF', marginTop: 12, fontSize: 16 },
  map: { width: '100%', height: '100%' },
  callout: { width: 200, padding: 8 },
  calloutTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  calloutText: { fontSize: 12, color: '#4B5563', marginBottom: 8 },
  calloutAction: { color: '#208AEF', fontSize: 12, fontWeight: '600' },
  legend: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  legendTitle: { color: '#F9FAFB', fontWeight: 'bold', marginBottom: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  legendText: { color: '#9CA3AF', fontSize: 13 },
  activeQueueBanner: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: '#064E3B',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  activeQueueInfo: { flex: 1 },
  activeQueueTitle: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16, marginBottom: 2 },
  activeQueueSubtitle: { color: '#A7F3D0', fontSize: 12 },
  leaveButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  leaveButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
});
