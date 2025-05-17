import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../../firebaseConfig";

function DriverSignIn() {
    console.log("DriverSignIn component loaded");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const auth = getAuth(app);
  const db = getFirestore(app);

  const loginHandler = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user's Firestore document
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        alert("User data not found.");
        await signOut(auth);
        return;
      }

      const userData = userDoc.data();

      if (userData.roles && userData.roles.includes("driver")) {
        alert("Logged in as driver.");
        navigate("../Driver/HomeDrive"); // Navigate to driver dashboard
      } else {
        alert("Access denied. You are not registered as a driver.");
        await signOut(auth);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Failed to log in. Check credentials.");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Driver Login</h2>
      <form onSubmit={loginHandler} style={styles.form}>
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
        <button type="submit" style={styles.button}>Sign In</button>
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

export default DriverSignIn;
