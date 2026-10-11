import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      const res = await api.post("/api/auth/login", {
        email,
        password,
      });

      // Save JWT Token
      localStorage.setItem("token", res.data.token);

      // Save User Details
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Success Message
      alert("Login Successful");

      // Redirect to Dashboard
      navigate("/dashboard");

    } catch (err) {
      alert("Login Failed");

      if (err.response) {
        console.log(err.response.data);
      } else {
        console.log(err.message);
      }
    }
  };

  return (
    <div
      style={{
        width: "350px",
        margin: "80px auto",
        textAlign: "center",
      }}
    >
      <h1>Login</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
        }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
        }}
      />

      <button
        onClick={login}
        style={{
          width: "100%",
          padding: "10px",
          cursor: "pointer",
        }}
      >
        Login
      </button>
    </div>
  );
}

export default Login;


