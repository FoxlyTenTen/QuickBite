import React, { useState } from "react";
import { app } from "../../firebaseConfig";
import { Link } from 'react-router-dom';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";


function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const auth = getAuth(app);
  const db = getFirestore(app);

  const registerHandler = async (e) => {
    e.preventDefault();
  
    if (!email || !password || !selectedRole) {
      alert("Please complete all fields.");
      return;
    }
  
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
  
      if (methods.length > 0) {
        // Account exists, now verify password
        const existingUser = await signInWithEmailAndPassword(auth, email, password);
        const user = existingUser.user;
  
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
  
        if (userSnap.exists()) {
          const existingRoles = userSnap.data().roles || [];
  
          if (existingRoles.includes(selectedRole)) {
            alert(`Already registered as ${selectedRole}`);
          } else {
            await updateDoc(userRef, {
              roles: arrayUnion(selectedRole),
              currentRole: selectedRole,
            });
            alert(`Role ${selectedRole} added`);
          }
        }
      } else {
        // New user
        const newUser = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", newUser.user.uid), {
          uid: newUser.user.uid,
          email: newUser.user.email,
          roles: [selectedRole],
          currentRole: selectedRole,
          cart: [],
          createdAt: new Date(),
        });
        alert(`User registered as ${selectedRole}`);
      }
    } catch (err) {
      console.error("Error during registration:", err);
      alert("Failed: check password or try again.");
    }
  };
  
  return (
    <div style={styles.container}>
      <h2>Register</h2>
      <form onSubmit={registerHandler} style={styles.form}>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          style={styles.input}
        >
          <option value="">Select your role</option>
          <option value="customer">Customer</option>
          <option value="merchant">Merchant</option>
          <option value="driver">Driver</option>
        </select>
        <button type="submit" style={styles.button}>Register</button>
        <Link to="/auth/signin" style={styles.button}>Login</Link>

      </form>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    padding: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    width: "300px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px",
    backgroundColor: "#00c853",
    color: "#fff",
    fontWeight: "bold",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default RegisterPage;
