import React, { useState, useEffect } from "react";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { app } from "../../firebaseConfig";

function AddRestaurant({ restaurantId, onRegistered }) {
  const db = getFirestore(app);
  const [showForm, setShowForm] = useState(false);
  const [owner, setOwner] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  // preload existing
  useEffect(() => {
    async function load() {
      const ref = doc(db, "restaurants", restaurantId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const d = snap.data();
        setOwner(d.restaurantOwner || "");
        setName(d.restaurantName || "");
        setLocation(d.location || "");
      }
    }
    load();
  }, [db, restaurantId]);

  const handle = async e => {
    e.preventDefault();
    if (!owner || !name || !location) {
      alert("Fill all fields");
      return;
    }
    const ref = doc(db, "restaurants", restaurantId);
    const payload = { restaurantOwner: owner, restaurantName: name, location, itemsName: [] };
    const snap = await getDoc(ref);
    if (snap.exists()) await updateDoc(ref, payload);
    else await setDoc(ref, payload);
    alert("Restaurant saved");
    setShowForm(false);
    onRegistered && onRegistered();
  };

  return (
    <>
      <button onClick={() => setShowForm(true)} style={styles.addBtn}>
        Register / Edit Restaurant
      </button>
      {showForm && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3>Restaurant Info</h3>
            <form onSubmit={handle} style={styles.form}>
              <input placeholder="Owner" value={owner} onChange={e=>setOwner(e.target.value)} style={styles.input}/>
              <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} style={styles.input}/>
              <input placeholder="Location" value={location} onChange={e=>setLocation(e.target.value)} style={styles.input}/>
              <div style={styles.btnRow}>
                <button type="submit" style={styles.btn}>Save</button>
                <button type="button" onClick={()=>setShowForm(false)} style={styles.cancel}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  addBtn: { padding:10, background:"#00c853", color:"#fff", border:"none", borderRadius:6 },
  overlay: { position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center" },
  modal: { background:"#fff", padding:30, borderRadius:10, width:300 },
  form: { display:"flex", flexDirection:"column", gap:15 },
  input: { padding:10, borderRadius:5, border:"1px solid #ccc" },
  btnRow: { display:"flex", gap:8 },
  btn: { flex:1, padding:10, background:"#00c853", color:"#fff", border:"none", borderRadius:4 },
  cancel: { flex:1, padding:10, background:"#ccc", border:"none", borderRadius:4 }
};

export default AddRestaurant;
