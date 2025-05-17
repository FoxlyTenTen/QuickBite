import React, { useEffect } from 'react';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../../firebaseConfig';

const db = getFirestore(app);
const auth = getAuth(app);

export default function DriverLocationUpdater({ orderId }) {
  useEffect(() => {
    if (!orderId) {
      console.warn("No orderId provided to DriverLocationUpdater");
      return;
    }

    let watchId;

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        watchId = navigator.geolocation.watchPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              await setDoc(
                doc(db, 'orderLocations', orderId),
                {
                  driverId: user.uid,
                  lat: latitude,
                  lng: longitude,
                  updatedAt: serverTimestamp()
                },
                { merge: true }
              );
              console.log("Location updated:", latitude, longitude);
            } catch (err) {
              console.error("Error updating location:", err);
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
          },
          { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
        );
      } else {
        console.warn("User not authenticated");
      }
    });

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      unsub();
    };
  }, [orderId]);

  return null;
}
