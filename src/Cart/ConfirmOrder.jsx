import React, { useEffect, useState } from 'react';
import {
  getFirestore,
  collection,
  addDoc,
  Timestamp,
  updateDoc,
  doc,
  arrayUnion
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../../firebaseConfig';
import './ConfirmOrder.css';

const ConfirmOrder = () => {
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [isLoading, setIsLoading] = useState(false);

  const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
  const db = getFirestore(app);
  const auth = getAuth(app);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      if (u) setUser(u);
      else window.location.href = '/login';
    });

    navigator.geolocation.getCurrentPosition(
      pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => {
        alert("Location access required.");
        console.error(err);
      }
    );

    return () => unsub();
  }, []);

  const handleConfirm = async () => {
    if (!user || !location.lat || cartItems.length === 0) {
      alert("Missing user, location, or cart.");
      return;
    }

    setIsLoading(true);
    try {
      const totalPrice = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

      const orderItems = cartItems.map(item => ({
        name: item.name,
        itemId: item.itemId,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        desc: item.desc,
        restaurantId: item.restaurantId
      }));

      const order = {
        userId: user.uid,
        driverId: null,
        status: "pending",
        items: orderItems,
        totalPrice,
        locationLat: location.lat,
        locationLng: location.lng,
        paymentMethod,
        createdAt: Timestamp.now()
      };

      const orderRef = await addDoc(collection(db, "orders"), order);

      await updateDoc(doc(db, "users", user.uid), {
        orders: arrayUnion(orderRef.id)
      });

      await updateDoc(doc(db, "users", user.uid), { cart: [] });
      localStorage.removeItem("cartItems");
      localStorage.removeItem("cartTotal");

      alert("Order placed! Your order ID: " + orderRef.id);
      window.location.href = "/";
    } catch (err) {
      console.error("Error submitting order:", err);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="confirm-container">
      <h2>Confirm Your Order</h2>

      {cartItems.length > 0 ? (
        <>
          <ul className="confirm-item-list">
            {cartItems.map((item, idx) => (
              <li key={`${item.itemId}-${idx}`} className="confirm-item">
                <div className="confirm-details">
                  <strong>{item.name}</strong>
                  <p>RM {item.price} × {item.quantity} = RM {(item.price * item.quantity).toFixed(2)}</p>
                  <p className="confirm-restaurant">Restaurant ID: {item.restaurantId}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="payment-section">
            <h3>Payment Method</h3>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
            >
              <option>Cash on Delivery</option>
              <option>Credit Card</option>
              <option>eWallet</option>
            </select>
          </div>

          <button
            onClick={handleConfirm}
            className="confirm-btn"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Confirm Order"}
          </button>
        </>
      ) : (
        <div className="empty-state">
          <p>Your cart is empty. Please add items first.</p>
          <button onClick={() => window.location.href = "/"} className="back-btn">
            Go to Menu
          </button>
        </div>
      )}
    </div>
  );
};

export default ConfirmOrder;
