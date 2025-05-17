import React, { useEffect, useRef, useState } from 'react';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { app } from '../../firebaseConfig';

const db = getFirestore(app);
const containerStyle = { width: '100%', height: '400px' };

export default function TrackOrder({ orderId }) {
  const [location, setLocation] = useState(null);
  const mapRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyCM44BLQnnma6HSzo3JM4onKyo9U_1Lr7Q' // Replace with secure key
  });

  useEffect(() => {
    const ref = doc(db, 'orderLocations', orderId);
    const unsub = onSnapshot(ref, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const newLoc = { lat: data.lat, lng: data.lng };
        setLocation(newLoc);
        if (mapRef.current) {
          mapRef.current.panTo(newLoc);
        }
      }
    });
    return () => unsub();
  }, [orderId]);

  if (!isLoaded) return <p>Loading map...</p>;
  if (!location) return <p>Waiting for driver location...</p>;

  return (
    <div style={{ marginTop: '1rem' }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={location}
        zoom={16}
        onLoad={(map) => (mapRef.current = map)}
      >
        <Marker position={location} />
      </GoogleMap>
    </div>
  );
}
