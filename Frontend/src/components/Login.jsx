import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../assets/css/Login.css";
function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate(); // Hook to programmatically navigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/auth/signin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Origin: "http://localhost:3000",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to log in");
      }

      const data = await response.json();
      // Store the token in local storage
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("username", data.username);
      localStorage.setItem("userId", data.id);
      localStorage.setItem("role", data.roles[0]); // Assuming the first role is the one you want to check
      localStorage.setItem("email", data.email);
      setSuccess("Login successful!");
      // Check the role and navigate accordingly
      if (data.roles.includes("ROLE_ADMIN")) {
        navigate("/admin"); // Redirect to the admin dashboard
      } else if (data.roles.includes("ROLE_USER")) {
        navigate("/"); // Redirect to the user homepage
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
}

export default Login;
