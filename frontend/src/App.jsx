import CssBaseline from "@mui/material/CssBaseline";
import Header from "./components/Header";
import HomeScreen from "./screens/HomeScreen";


const App = () => {
  return (
    <>
      <CssBaseline enableColorScheme/>
      <Header />
      <HomeScreen />
    </>
  );
};

export default App;
