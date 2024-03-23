import CssBaseline from "@mui/material/CssBaseline";
import Header from "./components/Header";
import { Outlet } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
const App = () => {
  return (
    <>
      <CssBaseline enableColorScheme />
      <Header />
      <ToastContainer />
      <Outlet />
    </>
  );
};

export default App;
