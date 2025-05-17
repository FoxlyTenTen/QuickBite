import React, { useEffect, useState } from 'react';
import {
  getFirestore,
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { app } from '../../firebaseConfig';
import { motion, AnimatePresence } from 'framer-motion';
import DriverLocationUpdater from '../locationTracking/DriverLocationUpdater';
import './HomeDrive.css';

const db = getFirestore(app);
const auth = getAuth(app);

export default function DriverDashboard() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, u => {
      if (!u) window.location.href = '/';
      else setUser(u);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    const ordersRef = collection(db, 'orders');
    const unsub = onSnapshot(ordersRef, snapshot => {
      setOrders(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const statuses = ['pending', 'accepted', 'preparing', 'sending', 'arrived', 'completed'];

  const changeStatus = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
    } catch (err) {
      console.error('Status update failed', err);
    }
    setUpdating(null);
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      await deleteDoc(doc(db, 'orderLocations', orderId)); // Also delete location tracking
      alert('Order and tracking deleted successfully.');
    } catch (err) {
      console.error('Failed to delete order:', err);
      alert('Error deleting order.');
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    window.location.href = '/';
  };

  return (
    <div className="driver-container">
      <header className="driver-header">
        <h1>🚚 Driver Dashboard</h1>
        <div className="header-actions">
          <button onClick={handleSignOut} className="btn signout">Sign Out</button>
          <button onClick={() => window.location.href = '/'} className="btn backhome">Back Home</button>
        </div>
      </header>

      <AnimatePresence>
        {orders.map(order => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="order-card"
          >
            <div className="order-info">
              <p><strong>Order ID:</strong> {order.id}</p>
              <p>
                <strong>Status:</strong>{' '}
                <span className={`status ${order.status || 'pending'}`}>
                  {order.status}
                </span>
              </p>
              <p><strong>Total:</strong> RM {order.totalPrice?.toFixed(2) ?? '0.00'}</p>
            </div>

            {/* 🛰️ Live location tracking during delivery */}
            {['sending', 'arrived'].includes(order.status) && (
              <DriverLocationUpdater orderId={order.id} />
            )}

            <div className="status-buttons">
              {statuses.map(s => (
                <motion.button
                  key={s}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={updating === order.id || order.status === s}
                  onClick={() => changeStatus(order.id, s)}
                  className={`btn status-btn ${order.status === s ? 'active' : ''}`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </motion.button>
              ))}
            </div>

            {/* ❌ Delete completed order */}
            {order.status === 'completed' && (
              <button onClick={() => handleDeleteOrder(order.id)} className="btn delete-btn">
                Delete Order
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
