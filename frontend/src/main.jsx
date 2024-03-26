import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import HomeScreen from "./screens/HomeScreen.jsx";
import LoginScreen from "./screens/LoginScreen.jsx";
import store from "./store";
import { Provider } from "react-redux";
import RegisterScreen from "./screens/RegisterScreen.jsx";
import ProfileScreen from "./screens/ProfileScreen.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import AddRecipeScreen from "./screens/AddRecipeScreen.jsx";
import ShowRecipesScreen from "./screens/ShowRecipesScreen.jsx";
import ShowRecipeScreen from "./screens/ShowRecipeScreen.jsx";
import EditRecipeScreen from "./screens/EditRecipeScreen.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index={true} path="/" element={<HomeScreen />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/register" element={<RegisterScreen />} />
      <Route path="" element={<PrivateRoute />}>
        <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/recipes/add" element={<AddRecipeScreen />} />
          <Route path="/recipes/" element={<ShowRecipesScreen />} />
          <Route path="/recipes/:recipe_id" element={<ShowRecipeScreen />} />
          <Route path="/recipes/edit/:recipe_id" element={<EditRecipeScreen />} />
      </Route>
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  </Provider>
);
