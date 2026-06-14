import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import API from '@/api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid'; // Make sure to install: npm install uuid

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
  const [isValidatingSession, setIsValidatingSession] = useState(false);
  
  const timeNearShedRef = useRef<number>(0);
  const currentShedRef = useRef<any>(null);
  const locationSubRef = useRef<Location.LocationSubscription | null>(null);
  const joinDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const leaveDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const isJoiningRef = useRef<boolean>(false);
  const isLeavingRef = useRef<boolean>(false);

  // ✅ CRITICAL: Validate session on app resume
  useEffect(() => {
    const validateAndSync = async () => {
      try {
        setIsValidatingSession(true);
        const localSession = await AsyncStorage.getItem('queueSession');
        
        if (!localSession) {
          setIsValidatingSession(false);
          return;
        }

        // Ask backend if session is still valid
        const response = await API.get('/sheds/validate-session');
        
        if (response.data.isValid) {
          // Backend confirms session is active
          setInQueueSession({ 
            shedId: response.data.shedId, 
            joinedAt: response.data.joinedAt 
          });
        } else {
          // Backend says session is invalid, clear local storage
          await AsyncStorage.removeItem('queueSession');
          setInQueueSession(null);
        }
      } catch (error) {
        console.warn("Session validation failed:", error);
        // On network error, keep local session as is
      } finally {
        setIsValidatingSession(false);
      }
    };

    validateAndSync();
  }, []);

  // Load session from storage if app restarted
  useEffect(() => {
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
          timeInterval: 10000,
          distanceInterval: 10,
        },
        async (location) => {
          if (!active) return;
          const { latitude, longitude, speed } = location.coords;
          
          if (inQueueSession) {
            const sessionShed = sheds.find(s => s.shedId === inQueueSession.shedId || s._id === inQueueSession.shedId);
            if (sessionShed) {
              const shedLat = sessionShed.location.coordinates[1];
              const shedLon = sessionShed.location.coordinates[0];
              const dist = getDistance(latitude, longitude, shedLat, shedLon);
              
              // Auto-leave if user moves too far or too fast
              if (dist > 500 || (speed && speed > 8)) {
                // ✅ Debounce leave to prevent multiple calls
                if (!isLeavingRef.current) {
                  leaveQueue(inQueueSession.shedId);
                }
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
              timeNearShedRef.current += 10; 
              
              const currentSpeed = speed || 0;
              if (currentSpeed < 1.5 && timeNearShedRef.current >= 60) {
                setSuggestedShed(closestShed);
                setIsPossibleQueue(true);
              }
            }
          } else {
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

  // ✅ CRITICAL: Add debouncing and idempotency key
  const joinQueue = async (shedId: string, lat: number, lon: number) => {
    // Prevent duplicate rapid calls
    if (isJoiningRef.current) {
      console.warn("Join already in progress");
      return;
    }

    // Debounce
    if (joinDebounceRef.current) {
      clearTimeout(joinDebounceRef.current);
    }

    isJoiningRef.current = true;

    joinDebounceRef.current = setTimeout(async () => {
      try {
        const idempotencyKey = uuidv4(); // Generate unique key
        const response = await API.post('/sheds/join-queue', { 
          shedId, 
          latitude: lat, 
          longitude: lon,
          idempotencyKey // Send for deduplication
        });
        
        const sessionData = { 
          shedId: response.data.session.shedId, 
          joinedAt: response.data.session.joinedAt 
        };
        setInQueueSession(sessionData);
        await AsyncStorage.setItem('queueSession', JSON.stringify(sessionData));
        setIsPossibleQueue(false);
      } catch (error: any) {
        if (error.response?.status === 200 || error.response?.status === 400) {
          // Already in queue (idempotent response)
          const sessionData = { shedId, joinedAt: Date.now() };
          setInQueueSession(sessionData);
          await AsyncStorage.setItem('queueSession', JSON.stringify(sessionData));
          setIsPossibleQueue(false);
        } else if (error.response?.status === 403) {
          alert("Not authorized to join queue");
        } else {
          console.error("Failed to join queue", error);
          alert("Failed to join queue. Please try again.");
        }
      } finally {
        isJoiningRef.current = false;
      }
    }, 500); // Debounce 500ms
  };

  // ✅ CRITICAL: Add debouncing
  const leaveQueue = async (shedId: string) => {
    if (isLeavingRef.current) {
      console.warn("Leave already in progress");
      return;
    }

    if (leaveDebounceRef.current) {
      clearTimeout(leaveDebounceRef.current);
    }

    isLeavingRef.current = true;

    leaveDebounceRef.current = setTimeout(async () => {
      try {
        await API.post('/sheds/leave-queue', { shedId });
        setInQueueSession(null);
        await AsyncStorage.removeItem('queueSession');
      } catch (error: any) {
        if (error.response?.status === 404) {
          // Already left or session expired
          setInQueueSession(null);
          await AsyncStorage.removeItem('queueSession');
        } else {
          console.error("Failed to leave queue", error);
        }
      } finally {
        isLeavingRef.current = false;
      }
    }, 500); // Debounce 500ms
  };

  const declineQueue = () => {
    setIsPossibleQueue(false);
    timeNearShedRef.current = -300;
  };

  return {
    isPossibleQueue,
    suggestedShed,
    inQueueSession,
    isValidatingSession,
    joinQueue,
    leaveQueue,
    declineQueue
  };
}
