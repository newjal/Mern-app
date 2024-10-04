import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import MernApp from "./MernApp.jsx";
import { BrowserRouter } from "react-router-dom";
import 'react-toastify/ReactToastify.css'

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* <App /> */}
    <BrowserRouter>
      <MernApp />
    </BrowserRouter>
  </StrictMode>
);
