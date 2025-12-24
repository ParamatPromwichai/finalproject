import { useState } from "react";
import Login from "./Login";
import Register from "./Register";

function App(){
  const [page, setPage] = useState<"login" | "register">("login");

  return (
    <div>
      {page === "login" ? <Login /> : <Register />}

      <hr />

      {page === "login" ? (
        <button onClick={() => setPage("register")}>
          Go to Register
        </button>
      ) : (
        <button onClick={() => setPage("login")}>
          Back to Login
        </button>
      )}
    </div>
  );
}

export default App;
