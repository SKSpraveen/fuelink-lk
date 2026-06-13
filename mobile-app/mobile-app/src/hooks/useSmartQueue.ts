import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import API from '@/api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper: Haversine distance in meters
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3; // metres
  const toRadians = (deg: number) => deg * (Math.PI / 180);
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; 
};

export function useSmartQueue(sheds: any[]) {
  const [isPossibleQueue, setIsPossibleQueue] = useState(false);
  const [suggestedShed, setSuggestedShed] = useState<any>(null);
  const [inQueueSession, setInQueueSession] = useState<{ shedId: string, joinedAt: number } | null>(null);
  
  const timeNearShedRef = useRef<number>(0); // Time in seconds
  const currentShedRef = useRef<any>(null);
  const locationSubRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    // Load session from storage if app restarted
    AsyncStorage.getItem('queueSession').then(val => {
      if (val) setInQueueSession(JSON.parse(val));
    });
  }, []);

  useEffect(() => {
    let active = true;

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      locationSubRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // Every 10 seconds
          distanceInterval: 10, // Or every 10 meters
        },
        async (location) => {
          if (!active) return;
          const { latitude, longitude, speed } = location.coords;
          
          if (inQueueSession) {
            // Check if leaving queue
            const sessionShed = sheds.find(s => s.shedId === inQueueSession.shedId || s._id === inQueueSession.shedId);
            if (sessionShed) {
              const shedLat = sessionShed.location.coordinates[1];
              const shedLon = sessionShed.location.coordinates[0];
              const dist = getDistance(latitude, longitude, shedLat, shedLon);
              
              if (dist > 500 || (speed && speed > 8)) { // > 500m or > 28km/h
                leaveQueue(inQueueSession.shedId);
              }
            }
            return;
          }

          // Check if entering a queue
          let closestShed = null;
          let minDistance = Infinity;

          for (const shed of sheds) {
            const shedLat = shed.location.coordinates[1];
            const shedLon = shed.location.coordinates[0];
            const dist = getDistance(latitude, longitude, shedLat, shedLon);
            if (dist < minDistance) {
              minDistance = dist;
              closestShed = shed;
            }
          }

          if (closestShed && minDistance < 150) {
            if (currentShedRef.current?.shedId !== (closestShed.shedId || closestShed._id)) {
              currentShedRef.current = closestShed;
              timeNearShedRef.current = 0;
            } else {
              // Increase time near shed
              timeNearShedRef.current += 10; 
              
              // If stationary or moving very slow (< 1.5 m/s) and been here for > 60 seconds
              const currentSpeed = speed || 0;
              if (currentSpeed < 1.5 && timeNearShedRef.current >= 60) {
                setSuggestedShed(closestShed);
                setIsPossibleQueue(true);
              }
            }
          } else {
            // Reset if moved away
            currentShedRef.current = null;
            timeNearShedRef.current = 0;
            setIsPossibleQueue(false);
          }
        }
      );
    };

    if (sheds.length > 0) {
      startTracking();
    }

    return () => {
      active = false;
      if (locationSubRef.current) {
        locationSubRef.current.remove();
      }
    };
  }, [sheds, inQueueSession]);

  const joinQueue = async (shedId: string, lat: number, lon: number) => {
    try {
      await API.post('/sheds/join-queue', { shedId, latitude: lat, longitude: lon });
      const sessionData = { shedId, joinedAt: Date.now() };
      setInQueueSession(sessionData);
      await AsyncStorage.setItem('queueSession', JSON.stringify(sessionData));
      setIsPossibleQueue(false);
    } catch (error: any) {
      if (error.response?.status === 400) {
        // Assume already in queue, sync local state
        const sessionData = { shedId, joinedAt: Date.now() };
        setInQueueSession(sessionData);
        await AsyncStorage.setItem('queueSession', JSON.stringify(sessionData));
        setIsPossibleQueue(false);
      } else {
        console.error("Failed to join queue", error);
      }
    }
  };

  const leaveQueue = async (shedId: string) => {
    try {
      await API.post('/sheds/leave-queue', { shedId });
      setInQueueSession(null);
      await AsyncStorage.removeItem('queueSession');
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Assume already left or session expired, clear local state
        setInQueueSession(null);
        await AsyncStorage.removeItem('queueSession');
      } else {
        console.error("Failed to leave queue", error);
      }
    }
  };

  const declineQueue = () => {
    setIsPossibleQueue(false);
    // Maybe set a cooldown so we don't ask again immediately
    timeNearShedRef.current = -300; // 5 min cooldown
  };

  return {
    isPossibleQueue,
    suggestedShed,
    inQueueSession,
    joinQueue,
    leaveQueue,
    declineQueue
  };
}
