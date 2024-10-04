import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../utiles";
import axios from "axios";

const SignUp = () => {
  const [signupinfo, setSignUpInfo] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.warn(name, value);
    const copySignUpInfo = { ...signupinfo };
    copySignUpInfo[name] = value;
    setSignUpInfo(copySignUpInfo);
  };



  const handleSignup = async (e) => {
    e.preventDefault();
    const { name, email, password } = signupinfo;
    if (!name || !email || !password) {
      return handleError("Name, email and password are required");
    }
    if (password.length < 4) {
    return handleError("Password should be at least 4 characters long");
  }
    try {
      const response = await axios.post('http://localhost:9999/auth/signup', {
      name,
      email,
      password,
    });
    if (response.status == 201 ) {
      handleSuccess("SignUp successfull");
      setSignUpInfo({ name: '', email: '', password: ''});
      setTimeout(() => {
        navigate('/login')
      },1000)
    }
    
    }catch(err){
      const errorMsg = err.response?.data?.message ||   "Signup failed ";
      handleError(errorMsg)
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 h-screen   justify-center ">
      <div
        className="bg-[#fff] px-[32px] py-[48px] rounded border-4 border-black   "
        style={{ boxShadow: "8px 8px 24px 0px rgba(66, 68, 90, 1)" }}
      >
        <h1 className="text-2xl mb-[20px]">SignUp</h1>
        <form onSubmit={handleSignup} className="flex flex-col gap-5 space-y-2">
          <div className="flex gap-4 flex-col">
            <label htmlFor="name"> Name </label>
            <input
              className="border border-black p-2"
              onChange={handleChange}
              type="text"
              name="name"
              autoFocus
              placeholder="Enter your name...."
              value={signupinfo.name}
            />
          </div>
          <div className="flex gap-4 flex-col ">
            <label htmlFor="email"> Email </label>
            <input
              className="border border-black p-2"
              onChange={handleChange}
              type="text"
              name="email"
              autoFocus
              placeholder="Enter your email...."
              value={signupinfo.email}
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
              value={signupinfo.password}
            />
          </div>
          <button className="bg-purple-500 rounded border-2 ">SignUp</button>
          <span className="">
            Already have an account ?
            <Link className="pl-6" to="/login">
              Login
            </Link>
          </span>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
};

export default SignUp;
