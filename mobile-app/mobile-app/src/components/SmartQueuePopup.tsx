import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import * as Location from 'expo-location';

interface Props {
  visible: boolean;
  shedName: string;
  onConfirm: (lat: number, lon: number) => void;
  onDecline: () => void;
}

export default function SmartQueuePopup({ visible, shedName, onConfirm, onDecline }: Props) {
  const [slideAnim] = useState(new Animated.Value(200));

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  const handleConfirm = async () => {
    const loc = await Location.getCurrentPositionAsync({});
    onConfirm(loc.coords.latitude, loc.coords.longitude);
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.icon}>📍</Text>
      <Text style={styles.title}>You are near {shedName}</Text>
      <Text style={styles.subtitle}>Queue appears busy. Are you currently waiting in queue?</Text>
      
      <View style={styles.buttonRow}>
        <Pressable style={[styles.button, styles.noButton]} onPress={onDecline}>
          <Text style={styles.noText}>No, Passing by</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.yesButton]} onPress={handleConfirm}>
          <Text style={styles.yesText}>Yes, I'm waiting</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100, // Above bottom nav
    left: 20,
    right: 20,
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#208AEF',
    shadowColor: '#208AEF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noButton: {
    backgroundColor: '#1F2937',
  },
  yesButton: {
    backgroundColor: '#208AEF',
  },
  noText: {
    color: '#9CA3AF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  yesText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
