import { Navigate, Outlet, useLocation } from "react-router-dom";

const PrivateRoute = () => {
  const location = useLocation();
  const token = localStorage.getItem("admin_access_token");
  if (!token) {
    return <Navigate to="/sign-in" replace state={{ from: location }} />;
  }
  return <Outlet />;
};

export default PrivateRoute;
