import CategoryLayout from "./layouts/Category/CategoryLayout";
import ProductLayout from "./layouts/products/ProductLayout";
import MovementLayout from "./layouts/movements/MovementLayout";
import LoginLayout from "./layouts/auth/LoginLayout";
import HomePage from "./layouts/HomePage";
import RegisterLayout from "./layouts/auth/RegisterLayout";
import PageTransition from "./components/PageTransition";
import ResetPassword from "./layouts/auth/ResetPassword";
import HomeUser from "./layouts/home/HomeUser";

import { AnimatePresence } from "motion/react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoute";
import { AppShell } from "./components/SideBar";
import { useApi } from "./context/ApiContext";

import "./css/side_bar/side_bar.css";

function App() {
  const location = useLocation();
  const { user } = useApi();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/login"
          element={
            <PageTransition>
              <LoginLayout />
            </PageTransition>
          }
        />
        <Route
          path="/register"
          element={
            <PageTransition>
              <RegisterLayout />
            </PageTransition>
          }
        />

        <Route
          path="/reset-password"
          element={
            <PageTransition>
              <ResetPassword />
            </PageTransition>
          }
        />  


        <Route element={<PrivateRoute />}>
          <Route element={<AppShell />}>
            <Route
              path="/"
              element={
                <PageTransition>
                  {user?.role === "admin" ? <HomePage /> : <HomeUser />} 
                </PageTransition>
              }
            />
            <Route
              path="/categories"
              element={
                <PageTransition>
                  <CategoryLayout />
                </PageTransition>
              }
            />
            <Route
              path="/products"
              element={
                <PageTransition>
                  <ProductLayout />
                </PageTransition>
              }
            />
            <Route
              path="/movements"
              element={
                <PageTransition>
                  <MovementLayout />
                </PageTransition>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default App;
