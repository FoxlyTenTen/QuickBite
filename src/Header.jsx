import React, { useEffect, useState } from 'react';
import './Header.css';
import { Play } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { app } from '../firebaseConfig';

export default function Header() {
  const [user, setUser] = useState(null);
  const auth = getAuth(app);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleLogout = async () => {
    await signOut(auth);
    alert("Signed out!");
    setUser(null);
    navigate('/');
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">QuickBite</div>

        <nav>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><a href='#menu'>Menu</a></li>

            <li>
              <Link to="/locationTracking/locTrack" className="track-link">
                Track Order 🚚
              </Link>
            </li>
          </ul>
        </nav>

        <div className="auth-buttons">
          {!user ? (
            <Link to="/auth/SignUp" className="btn register">Register</Link>
          ) : (
            <>
              <Link to="/Cart/CartOrder" className="btn cart">Your Cart</Link>
              <Link to="/auth/MerchantSignIn" className="btn merchant">Merchant</Link>
              <Link to="/auth/DriverSignIn" className="btn driver">Driver</Link>
              <button onClick={handleLogout} className="btn logout">Sign Out</button>
            </>
          )}
        </div>
      </header>

      <section className="hero">
        <div className="hero-text">
          <h1>Dive into Delights <br />of Delectable <span>Food</span></h1>
          <p>Where each plate tells a flavorful story of craft and care.</p>
          <div className="hero-buttons">
            <button className="order-now">Order Now</button>
            <div className="watch-video">
              <Play size={18} />
              <span>Watch Video</span>
            </div>
          </div>
        </div>

        <div className="product-boxes">
          <div className="product-card">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXY4CKzbUCWis1NqTl6NEGFta6vmQBYumNpQ&s" alt="Spicy noodles" />
            <h4>Spicy Noodles</h4>
            <p>RM 8.00</p>
          </div>
          <div className="product-card">
            <img src="https://assets.bonappetit.com/photos/5e3c7a3c866b940008106763/1:1/w_2560%2Cc_limit/HLY-Veggie-Ramen-16x9.jpg" alt="Vegetarian salad" />
            <h4>Vegetarian Salad</h4>
            <p>RM 7.00</p>
          </div>
        </div>
      </section>
    </div>
  );
}
