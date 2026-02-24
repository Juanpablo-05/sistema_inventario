import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useApi } from "../context/ApiContext";

function PrivateRoute() {
  const { isAuthenticated } = useApi();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default PrivateRoute;
