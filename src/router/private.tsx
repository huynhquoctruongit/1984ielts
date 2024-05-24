import { log } from "console";
import { Route, Navigate } from "react-router-dom";

const PrivateRoute = ({ element, isAuthenticated, ...props }: any) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return <Route element={element} {...props} />;
};

export default PrivateRoute;
