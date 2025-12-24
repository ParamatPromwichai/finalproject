import { useState } from "react";
import axios from "axios";

axios.defaults.withCredentials = true;

function Register(){
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [msg, setMsg] = useState<string>("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:5000/api/register",
        {
          username: username,
          password: password,
        }
      );
      setMsg("Register success, please login");
    } catch {
      setMsg("Register failed (username exists)");
    }
  };

  return (
    <form onSubmit={submit}>
      <h2>Register Admin</h2>

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

      <button type="submit">Register</button>
      <p>{msg}</p>
    </form>
  );
}

export default Register;
