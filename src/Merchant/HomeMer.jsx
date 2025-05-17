import React, { useEffect, useState } from 'react';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import {
  getFirestore,
  doc,
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  updateDoc,
  arrayRemove
} from 'firebase/firestore';
import AddRestaurant from './AddRestaurant';
import AddMenuItemForm from './AddMenuItem';
import './HomeMer.css';

const auth = getAuth();
const db = getFirestore();

export default function HomeMer() {
  const [user, setUser] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      if (!u) return navigate('/login');
      setUser(u);
    });
    return unsub;
  }, [navigate]);

  const restaurantId = user?.uid;

  useEffect(() => {
    if (!restaurantId) return;
    const ref = doc(db, 'restaurants', restaurantId);
    return onSnapshot(ref, snap => {
      if (snap.exists()) setRestaurant(snap.data());
    });
  }, [restaurantId]);

  useEffect(() => {
    if (!restaurantId) return;
    const q = query(
      collection(db, 'menuItems'),
      where('restaurantId', '==', restaurantId)
    );
    return onSnapshot(q, snap => {
      setMenuItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [restaurantId]);

  const handleDelete = async id => {
    if (!window.confirm('Delete this item?')) return;
    await deleteDoc(doc(db, 'menuItems', id));
    await updateDoc(doc(db, 'restaurants', restaurantId), {
      itemsName: arrayRemove(id)
    });
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <div className="merchant-container">
      <header className="merchant-header">
        <h1>Merchant Dashboard</h1>
        <div className="header-buttons">
          <button onClick={handleLogout} className="btn red">Sign Out</button>
          <button onClick={() => navigate('/')} className="btn red">Back Home</button>
        </div>
      </header>

      {restaurant && (
        <p className="restaurant-info">
          <strong>{restaurant.restaurantName}</strong> (@{restaurant.location})
        </p>
      )}

      <div className="merchant-forms">
        <AddRestaurant restaurantId={restaurantId} />
        <AddMenuItemForm restaurantId={restaurantId} />
      </div>

      <h2>Your Menu Items</h2>
      {menuItems.length > 0 ? (
        <div className="menu-grid">
          {menuItems.map(i => (
            <div key={i.id} className="menu-card">
              <img src={i.imageUri} alt={i.name} className="menu-img" />
              <h3>{i.name}</h3>
              <p>{i.desc}</p>
              <p><strong>RM {i.price.toFixed(2)}</strong></p>
              <button onClick={() => handleDelete(i.id)} className="btn delete">Delete</button>
            </div>
          ))}
        </div>
      ) : (
        <p>No items yet.</p>
      )}
    </div>
  );
}
