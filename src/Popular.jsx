import React, { useState, useEffect } from 'react';
import {
  getFirestore,
  collection,
  getDocs
} from 'firebase/firestore';
import { app } from '../firebaseConfig';
import './Popular.css';
import MenuDetail from './MenuDetail';

const db = getFirestore(app);

function PopularCategories() {
  const [menuItems, setMenuItems] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "menuItems"));
        const items = querySnapshot.docs.map(doc => ({
          itemId: doc.id,
          ...doc.data()
        }));
        setMenuItems(items);
      } catch (error) {
        console.error("Error fetching menu items:", error);
      }
    };

    fetchMenuItems();
  }, []);

  const handleSearch = () => {
    const results = menuItems.filter((item) =>
      item.name.toLowerCase().includes(searchInput.toLowerCase())
    );
    setSearchResult(results);
  };

  const handleAddToCart = (itemWithQuantity) => {
    setCart(prev => [...prev, itemWithQuantity]);
    setSelectedItem(null);
    alert(`${itemWithQuantity.name} added to cart (x${itemWithQuantity.quantity})`);
  };

  return (
    <section className="categories-section">
      <p className="section-label">Customer Favorites</p>
      <h2 className="section-title" id='menu'>Menu Items</h2>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search menu item..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="search-box"
        />
        <button onClick={handleSearch} className="search-btn">Search</button>
      </div>

      <div className="categories-grid">
        {(searchResult.length > 0 ? searchResult : menuItems).map((item, index) => (
          <div className="category-card" key={index} onClick={() => setSelectedItem(item)}>
            <div className="icon-bg">
              <img src={item.imageUri} alt={item.name} />
            </div>
            <h3>{item.name}</h3>
            <p>{item.desc}</p>
            <p><strong>Price:</strong> RM {item.price}</p>
            <p className="item-category"><strong>Category:</strong> {item.category}</p>
          </div>
        ))}
      </div>

      {selectedItem && (
        <MenuDetail
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </section>
  );
}

export default PopularCategories;
