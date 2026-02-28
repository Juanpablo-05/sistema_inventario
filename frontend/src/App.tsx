import CategoryLayout from "./layouts/Category/CategoryLayout";
import ProductLayout from "./layouts/products/ProductLayout";
import MovementLayout from "./layouts/movements/MovementLayout";
import LoginLayout from "./layouts/auth/LoginLayout";
import HomePage from "./layouts/HomePage";

import {  Navigate, Route, Routes } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoute";
import { AppShell } from "./components/SideBar";

import './css/side_bar.css'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginLayout />} />

      <Route element={<PrivateRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/categories" element={<CategoryLayout />} />
          <Route path="/products" element={<ProductLayout />} />
          <Route path="/movements" element={<MovementLayout />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
