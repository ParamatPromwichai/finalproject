import { useState } from "react";
import axios from "axios";

axios.defaults.withCredentials = true;

interface LoginResponse {
  access_token: string;
}

function Login(){
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [msg, setMsg] = useState<string>("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await axios.post<LoginResponse>(
        "http://localhost:5000/api/login",
        {
          username: username,
          password: password,
        }
      );

      localStorage.setItem("access_token", res.data.access_token);
      setMsg("Login success");
    } catch {
      setMsg("Login failed");
    }
  };

  return (
    <form onSubmit={submit}>
      <h2>Restaurant Admin Login</h2>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br />

      <button type="submit">Login</button>
      <p>{msg}</p>
    </form>
  );
}

export default Login;
