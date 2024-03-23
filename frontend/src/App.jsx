import CssBaseline from "@mui/material/CssBaseline";
import Header from "./components/Header";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const App = () => {
  return (
    <>
      <CssBaseline enableColorScheme />
      <ToastContainer />
      <Header />
      <Outlet />
    </>
  );
};

export default App;
