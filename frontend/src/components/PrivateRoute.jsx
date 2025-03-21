import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const activeUserToken = localStorage.getItem("token");

  if (!activeUserToken) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default PrivateRoute;
