import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";

const Login = () => {
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoginForm, setIsLoginForm] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        BASE_URL + "/login",
        { emailId, password },
        { withCredentials: true }
      );
      dispatch(addUser(res.data));
      navigate("/");
    } catch (err) {
      setError(err?.response?.data || "Something went wrong");
    }
  };

  const handleSignUp = async () => {
    try {
      const res = await axios.post(
        BASE_URL + "/signup",
        { firstName, lastName, emailId, password },
        { withCredentials: true }
      );
      dispatch(addUser(res.data.data));
      navigate("/profile");
    } catch (err) {
      setError(err?.response?.data || "Something went wrong");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-300 text-black">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96 mb-50">
        <h2 className="text-2xl  font-semibold text-center mb-4">
          {isLoginForm ? "Login" : "Sign Up"}
        </h2>
        <div className="space-y-6 text-center">
          {!isLoginForm && (
            <>
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                className="input-field"
                onChange={(e) => setFirstName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                className="input-field"
                onChange={(e) => setLastName(e.target.value)}
              />
            </>
          )}
          <input
            type="email"
            placeholder="Email"
            value={emailId}
            className="input-field"
            onChange={(e) => setEmailId(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            className="input-field"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <button
          className="w-full mt-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
          onClick={isLoginForm ? handleLogin : handleSignUp}
        >
          {isLoginForm ? "Login" : "Sign Up"}
        </button>
        <p
          className="text-sm text-center text-gray-600 mt-4 cursor-pointer hover:underline"
          onClick={() => setIsLoginForm(!isLoginForm)}
        >
          {isLoginForm
            ? "Don't have an account? Sign Up"
            : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
};

export default Login;
