import API from '@/api/api';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
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
import MapView, { Marker } from '@/components/Map';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddShedScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [coordinate, setCoordinate] = useState<any>(null);
  const [mapRegion, setMapRegion] = useState<any>(null);
  const [isLoadingLoc, setIsLoadingLoc] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fuelTypes, setFuelTypes] = useState({
    petrol92: false,
    petrol95: false,
    diesel: false,
    superDiesel: false,
  });

  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        let lat = 6.9271; // Default to Colombo
        let lng = 79.8612;

        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          lat = loc.coords.latitude;
          lng = loc.coords.longitude;
        }

        const region = { latitude: lat, longitude: lng, latitudeDelta: 0.05, longitudeDelta: 0.05 };
        setMapRegion(region);
        setCoordinate({ latitude: lat, longitude: lng });
      } catch (err) {
        console.error('Location error', err);
      } finally {
        setIsLoadingLoc(false);
      }
    };
    getLocation();
  }, []);

  const toggleFuel = (type: keyof typeof fuelTypes) => {
    setFuelTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleMapPress = (e: any) => {
    setCoordinate(e.nativeEvent.coordinate);
  };

  const submitShed = async () => {
    if (!name.trim() || !address.trim()) {
      Alert.alert('Validation Error', 'Please enter a name and address.');
      return;
    }
    if (!coordinate) {
      Alert.alert('Validation Error', 'Please tap on the map to select a location.');
      return;
    }

    setIsSubmitting(true);
    try {
      await API.post('/sheds', {
        name: name.trim(),
        address: address.trim(),
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        fuelTypes,
      });

      Alert.alert('Success', 'Shed registered successfully!', [
        { text: 'OK', onPress: () => router.push('/(owner-tabs)/dashboard') },
      ]);

      setName('');
      setAddress('');
      setFuelTypes({ petrol92: false, petrol95: false, diesel: false, superDiesel: false });
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to register shed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.greeting}>Expand your network 🏢</Text>
            <Text style={styles.title}>Register Shed</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Shed Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. CEYPETCO Colombo 03"
              placeholderTextColor="#6B7280"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 123 Galle Road, Colombo"
              placeholderTextColor="#6B7280"
              value={address}
              onChangeText={setAddress}
            />

            <Text style={styles.label}>Initial Fuel Stock</Text>
            <View style={styles.fuels}>
              {Object.entries(fuelTypes).map(([key, isAvail]) => {
                const displayName = key.replace(/([A-Z])/g, ' $1').trim().replace(/^./, (str) => str.toUpperCase());
                return (
                  <Pressable
                    key={key}
                    onPress={() => toggleFuel(key as keyof typeof fuelTypes)}
                    style={[styles.fuelBtn, isAvail && styles.fuelBtnActive]}
                  >
                    <Text style={[styles.fuelBtnText, isAvail && styles.fuelBtnTextActive]}>{displayName}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>Location (Tap map to pinpoint)</Text>
            <View style={styles.mapContainer}>
              {isLoadingLoc || !mapRegion ? (
                <View style={styles.mapLoading}>
                  <ActivityIndicator color="#208AEF" />
                </View>
              ) : (
                <MapView style={styles.map} initialRegion={mapRegion} onPress={handleMapPress}>
                  {coordinate && <Marker coordinate={coordinate} pinColor="#208AEF" />}
                </MapView>
              )}
            </View>

            <Pressable style={styles.submitBtn} onPress={submitShed} disabled={isSubmitting}>
              {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitBtnText}>Register Shed</Text>}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0A0E1A' },
  container: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  header: { marginBottom: 20 },
  greeting: { color: '#6B7280', fontSize: 14 },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', marginTop: 2 },
  card: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  label: { color: '#9CA3AF', fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: '#1F2937',
    color: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#374151',
    fontSize: 15,
  },
  fuels: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  fuelBtn: {
    backgroundColor: '#1F2937',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  fuelBtnActive: { backgroundColor: '#1A2640', borderColor: '#208AEF' },
  fuelBtnText: { color: '#9CA3AF', fontWeight: '500' },
  fuelBtnTextActive: { color: '#93C5FD', fontWeight: '700' },
  mapContainer: { height: 200, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#374151', marginTop: 8 },
  map: { width: '100%', height: '100%' },
  mapLoading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1F2937' },
  submitBtn: {
    backgroundColor: '#208AEF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 28,
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
