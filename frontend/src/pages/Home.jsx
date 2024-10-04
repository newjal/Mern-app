import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleSuccess } from "../utiles";
import { ToastContainer } from "react-toastify";
import axios from "axios";
const Home = () => {
  const [loggedInUser, setLoggedInUser] = useState("");
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    setLoggedInUser(localStorage.getItem("name"));
  }, []);

  const handleLogout = (e) => {
    localStorage.removeItem("name");
    localStorage.removeItem("jwtToken");
    handleSuccess("Logout successfull");
    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };
  const fetchProduct = async () => {
    try {
      const token = localStorage.getItem("jwtToken"); // Retrieve token

      if (!token) {
        console.error("JWT token is missing from localStorage");
        return;
      }

      console.log("JWT Token:", token); // Debugging

      const product = await axios.get("http://localhost:9999/products", {
        headers: {
          Authorization: token, // Directly use the token without "Bearer"
        },
        
      });

      console.log(product.data); // Log fetched data
      setProducts(product.data);
    } catch (error) {
      if (error.response) {
        console.error(`Error: ${error.response.status}`, error.response.data);
      } else {
        console.error("Error:", error.message);
      }
    }
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  return (
    <div className="flex  justify-center items-center h-screen">
      <div>
        <h1 className="text-2xl"> {loggedInUser} </h1>
        <button onClick={handleLogout}> Logout </button>
        <div className="bg-slate-500 p-4 m-4" >
          {
            products.map((item, index) => {
              return (
              <ul key={index}>
                <span>
                  {item.name} : {item.price}
                </span>
              </ul>);
            })
         }
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Home;
