// CartOrder.jsx
import React, { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../../firebaseConfig';

const CartOrder = () => {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const db = getFirestore(app);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setCartItems(userData.cart || []);
          } else {
            setCartItems([]);
          }
        } catch (err) {
          console.error("Error fetching cart:", err);
          setError("Failed to load cart. Please try again.");
        }
      } else {
        setUser(null);
        setCartItems([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    ).toFixed(2);
  };

  const handleRemoveItem = async (itemId) => {
    if (!user) return;

    try {
      const updatedCart = cartItems.filter(item => item.itemId !== itemId);
      setCartItems(updatedCart);
      
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { cart: updatedCart });
      
      alert("Item removed from cart");
    } catch (err) {
      console.error("Error removing item:", err);
      alert("Failed to update cart. Please try again.");
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }
    
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    localStorage.setItem("cartTotal", calculateTotal());
    window.location.href = "/Cart/ConfirmOrder";
  };

  if (loading) return <div style={styles.loading}>Loading cart...</div>;
  if (error) return <div style={styles.error}>{error}</div>;
  if (!user) return <div style={styles.authPrompt}>Please log in to view your cart.</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Your Shopping Cart ({cartItems.length} items)</h2>
      
      {cartItems.length === 0 ? (
        <div style={styles.emptyCart}>
          <p>Your cart is empty</p>
          <button 
            onClick={() => window.location.href = "/"} 
            style={styles.continueShopping}
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Item</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Quantity</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.itemId} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={styles.itemInfo}>
                      <img 
                        src={item.imageUri} 
                        alt={item.name} 
                        style={styles.image} 
                      />
                      <div>
                        <strong>{item.name}</strong>
                        <p style={styles.description}>{item.desc}</p>
                        <p style={styles.restaurantId}>Restaurant: {item.restaurantId}</p>
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>RM {item.price.toFixed(2)}</td>
                  <td style={styles.td}>{item.quantity}</td>
                  <td style={styles.td}>
                    RM {(item.price * item.quantity).toFixed(2)}
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => handleRemoveItem(item.itemId)}
                      style={styles.removeButton}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={styles.summary}>
            <h3>Total: RM {calculateTotal()}</h3>
          </div>

          <button
            style={styles.checkoutButton}
            onClick={handleCheckout}
          >
            Proceed to Checkout
          </button>
        </>
      )}
    </div>
  );
};

// Styles remain the same as previous implementation
const styles = {
    container: {
      padding: '2rem',
      maxWidth: '1200px',
      margin: 'auto',
      fontFamily: 'Arial, sans-serif'
    },
    title: {
      marginBottom: '2rem'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginBottom: '2rem'
    },
    th: {
      borderBottom: '2px solid #ddd',
      padding: '1rem',
      textAlign: 'left',
      backgroundColor: '#f5f5f5'
    },
    td: {
      borderBottom: '1px solid #eee',
      padding: '1rem'
    },
    tr: {
      transition: 'background-color 0.2s'
    },
    itemInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    image: {
      width: '80px',
      height: '80px',
      objectFit: 'cover',
      borderRadius: '8px'
    },
    description: {
      color: '#666',
      fontSize: '0.9rem',
      margin: 0
    },
    removeButton: {
      backgroundColor: '#d32f2f',
      color: 'white',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    summary: {
      textAlign: 'right',
      fontSize: '1.2rem',
      fontWeight: 'bold',
      marginBottom: '2rem'
    },
    checkoutButton: {
      width: '100%',
      padding: '1rem',
      backgroundColor: '#4caf50',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '1.1rem',
      cursor: 'pointer'
    },
    emptyCart: {
      textAlign: 'center',
      padding: '3rem'
    },
    continueShopping: {
      padding: '0.75rem 1.5rem',
      backgroundColor: '#2196F3',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    loading: {
      padding: '2rem',
      textAlign: 'center'
    },
    error: {
      padding: '2rem',
      textAlign: 'center',
      color: '#d32f2f'
    },
    authPrompt: {
      padding: '2rem',
      textAlign: 'center',
      color: '#333'
    }
  };

export default CartOrder;