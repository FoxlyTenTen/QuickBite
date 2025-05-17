import React, { useState } from "react";
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  arrayUnion
} from "firebase/firestore";
import { app } from "../../firebaseConfig";
import "./AddMenuItem.css"; // ← NEW: external CSS file

function AddMenuItem({ restaurantId }) {
  const db = getFirestore(app);
  const [showForm, setShowForm] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemId, setItemId] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [imageUri, setImageUri] = useState("");
  const [category, setCategory] = useState("");

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!itemName || !desc || !price || !imageUri || !category || !itemId) {
      alert("All fields are required");
      return;
    }

    const id = itemId.trim();
    try {
      const newItem = {
        restaurantId,
        name: itemName,
        desc,
        price: parseFloat(price),
        imageUri,
        category,
        createdAt: new Date()
      };
      await setDoc(doc(db, "menuItems", id), newItem);
      await updateDoc(doc(db, "restaurants", restaurantId), {
        itemsName: arrayUnion(id)
      });
      alert("Item added successfully!");
      setShowForm(false);
      setItemName("");
      setItemId("");
      setDesc("");
      setPrice("");
      setImageUri("");
      setCategory("");
    } catch (err) {
      console.error("Failed to add item:", err);
      alert("Failed to add item. See console.");
    }
  };

  return (
    <div className="menu-form-container">
      <button onClick={() => setShowForm(true)} className="open-form-btn">
        Add New Menu Item
      </button>
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Add Menu Item</h3>
            <form onSubmit={handleAddItem} className="menu-form">
              <input
                placeholder="Item ID (string)"
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
              />
              <input
                placeholder="Name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <textarea
                placeholder="Description"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
              <input
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <input
                placeholder="Image URL"
                value={imageUri}
                onChange={(e) => setImageUri(e.target.value)}
              />
              <input
                placeholder="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <div className="button-row">
                <button type="submit" className="btn green">Submit</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn cancel">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddMenuItem;
