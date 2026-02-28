import { useState } from "react";
import { auth, provider } from "../firebase/config";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import "./login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };


  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-brand">
          <h1>TaskFlow</h1>
          <p>Organize your tasks. Elevate your productivity.</p>
        </div>

        <div className="auth-form">
          <h2>{isLogin ? "Welcome Back 👋" : "Create Account 🚀"}</h2>

          {error && <div className="error-box">{error}</div>}

          <div className="input-group">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label>Email Address</label>
          </div>

          <div className="input-group">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label>Password</label>
          </div>

          <button
            className="primary-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isLogin
              ? "Login"
              : "Register"}
          </button>

         <button
  className="google-btn"
  onClick={handleGoogleLogin}
  disabled={loading}
>
  <img
    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
    alt="google"
  />
  Continue with Google
</button>

          <p className="switch-text">
            {isLogin
              ? "Don't have an account?"
              : "Already have an account?"}
            <span onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? " Register" : " Login"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}