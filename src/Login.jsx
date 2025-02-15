import { useState } from "react";
import axios from "axios";
const Login = () => {

  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "http://localhost:4444/login",
        {
          emailId,
          password,
        },
        { withCredentials: true }
      );
    }
    catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex justify-center my-10">
      <div className="card bg-base-100 w-96 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center">Login</h2>
          <div >
            <label className="form-control w-full max-w-xs  ">
              <div className="label">
                <span className="label-text">Email</span>
              </div>
              <input
                type="text"
                placeholder="Type here"
                value={emailId}
                className="input input-bordered w-full max-w-xs"
                onChange={(e) => setEmailId(e.target.value)}
              />

            </label>
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Password</span>
              </div>
              <input
                type="text"
                placeholder="Type here"
                value={password}
                className="input input-bordered w-full max-w-xs"
                onChange={(e) => setPassword(e.target.value)}
              />

            </label>
          </div>
          <div className="card-actions justify-end py-10">
            <button
              className="btn btn-primary"
              onClick={handleLogin}
            >Login</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
