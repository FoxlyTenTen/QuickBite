import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../../firebaseConfig';
import TrackOrder from './TrackOrder';

const db = getFirestore(app);
const auth = getAuth(app);

export default function UserOrderTracking() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (!u) {
        window.location.href = '/login';
        return;
      }
      setUser(u);
      const q = query(collection(db, 'orders'), where('userId', '==', u.uid));
      const unsubOrders = onSnapshot(q, (snapshot) => {
        const fetched = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setOrders(fetched);
        setLoading(false);
      });
      return () => unsubOrders();
    });

    return () => unsubAuth();
  }, []);

  if (loading) {
    return <p style={styles.message}>Loading your orders...</p>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Your Orders</h2>
      {orders.length > 0 ? (
        <ul style={styles.list}>
          {orders.map((order) => (
            <li key={order.id} style={styles.card}>
              <p><strong>Order ID:</strong> {order.id}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Total:</strong> RM {order.totalPrice?.toFixed(2) || '0.00'}</p>

              {['sending', 'arrived'].includes(order.status) && (
                <TrackOrder orderId={order.id} />
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p style={styles.message}>You have not placed any orders yet.</p>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '2rem', maxWidth: '600px', margin: 'auto', fontFamily: 'Arial, sans-serif' },
  header: { fontSize: '1.5rem', marginBottom: '1rem', color: '#2e7d32' },
  list: { listStyle: 'none', padding: 0, margin: 0 },
  card: {
    background: '#fff', border: '1px solid #eee', borderRadius: '6px',
    padding: '1rem', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  message: { textAlign: 'center', color: '#555' }
};
