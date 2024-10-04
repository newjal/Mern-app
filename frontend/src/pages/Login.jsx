import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../utiles";
import axios from "axios";

const Login = () => {
  const [logininfo, setLoginInfo] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.warn(name, value);
    const copyLoginInInfo = { ...logininfo };
    copyLoginInInfo[name] = value;
    setLoginInfo(copyLoginInInfo);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = logininfo;
    if (!email || !password) {
      return handleError(" Email and password are required");
    }
    if (password.length < 4) {
      return handleError("Password should be at least 4 characters long");
    }
    try {
      const response = await axios.post("http://localhost:9999/auth/login", {
        email,
        password,
      });
      if (response.status == 200) {
        const { jwtToken, name } = response.data;

        localStorage.setItem("jwtToken", jwtToken);
        localStorage.setItem("name", name);

        handleSuccess("Login successfull");
        setLoginInfo({ email: "", password: "" });
        setTimeout(() => {
          navigate("/home");
        }, 1000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Login failed ";
      handleError(errorMsg);
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 h-screen   justify-center ">
      <div
        className="bg-[#fff] px-[32px] py-[48px] rounded border-4 border-black   "
        style={{ boxShadow: "8px 8px 24px 0px rgba(66, 68, 90, 1)" }}
      >
        <h1 className="text-2xl mb-[20px]">Login</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-5 space-y-2">
          <div className="flex gap-4 flex-col ">
            <label htmlFor="email"> Email </label>
            <input
              className="border border-black p-2"
              onChange={handleChange}
              type="text"
              name="email"
              autoFocus
              placeholder="Enter your email...."
              value={logininfo.email}
            />
          </div>
          <div className="flex gap-4 flex-col ">
            <label htmlFor="password"> Password </label>
            <input
              className="border border-black p-2"
              onChange={handleChange}
              type="password"
              name="password"
              autoFocus
              placeholder="Enter your password...."
              value={logininfo.password}
            />
          </div>
          <button className="bg-purple-500 rounded border-2 ">Login</button>
          <span className="">
            Don't have an account ?
            <Link className="pl-6" to="/signup">
              SignUp
            </Link>
          </span>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
};

export default Login;
