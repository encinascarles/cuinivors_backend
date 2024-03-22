import CssBaseline from "@mui/material/CssBaseline";
import Header from "./components/Header";
import { Outlet } from "react-router-dom";

const App = () => {
  return (
    <>
      <CssBaseline enableColorScheme />
      <Header />
      <Outlet />
    </>
  );
};

export default App;
