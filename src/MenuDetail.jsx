// MenuDetail.jsx
import React, { useState, useEffect } from 'react';
import './MenuDetail.css';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../firebaseConfig';

const MenuDetail = ({ item, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState(null);
  const db = getFirestore(app);
  const auth = getAuth(app);

  // ✅ Get user safely on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  if (!item) return null;

  const handleAddToCart = async () => {
    if (!user) {
      alert('You must be logged in to add items to the cart.');
      return;
    }

    if (quantity < 1) {
      alert("Quantity must be at least 1.");
      return;
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        alert("User document not found.");
        return;
      }

      const userData = userDocSnap.data();
      const existingCart = userData.cart || [];

      const itemId = item.itemId || item.id || ''; // fallback if needed
      if (!itemId) {
        alert("Invalid item. Missing ID.");
        return;
      }

      const newItem = {
        restaurantId: item.restaurantId,
        itemId,
        name: item.name,
        desc: item.desc,
        price: item.price,
        imageUri: item.imageUri,
        category: item.category || '',
        quantity,
        addedAt: Timestamp.now(),
      };

      const existingIndex = existingCart.findIndex(cartItem => cartItem.itemId === itemId);
      let updatedCart;

      if (existingIndex >= 0) {
        updatedCart = [...existingCart];
        updatedCart[existingIndex].quantity += quantity;
      } else {
        updatedCart = [...existingCart, newItem];
      }

      await updateDoc(userDocRef, { cart: updatedCart });

      alert(`Added ${quantity} x ${item.name} to cart`);
      onClose();
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add to cart. Please try again.');
    }
  };

  return (
    <div className="menu-detail-overlay">
      <div className="menu-detail-modal">
        <button className="close-btn" onClick={onClose}>X</button>
        <img src={item.imageUri} alt={item.name} className="menu-detail-img" />
        <h2>{item.name}</h2>
        <p><strong>Description:</strong> {item.desc}</p>
        <p><strong>Price:</strong> RM {item.price}</p>
        <p><strong>Category:</strong> {item.category}</p>

        <div className="quantity-control">
          <label>Quantity:</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="quantity-input"
          />
        </div>

        <button className="add-to-cart-btn" onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default MenuDetail;
