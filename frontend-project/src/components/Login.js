import { useState } from "react";
import axios from "axios";
import '../index.css';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      return alert("Please fill in both fields");
    }

    try {
      const res = await axios.post("http://localhost:3012/login", {
        username,
        password,
      });

      localStorage.setItem("token", res.data.token);
      onLogin(username); // or just onLogin() if no user context needed
    } catch (err) {
      alert("Login failed: " + err.response?.data?.message || "Server error");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded shadow-md w-96 space-y-4"
      >
        <h2 className="text-xl font-bold text-center">Login</h2>
        <input
          type="text"
          className="border w-full p-2 rounded"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          className="border w-full p-2 rounded"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
