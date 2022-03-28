import { useCookies } from "react-cookie";
import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const RequireAuth = () => {
    const [cookies, setCookie] = useCookies();
    const { setAuth } = useAuth();
  
   
    const { auth } = useAuth();
    const location = useLocation();

    return (
        cookies.user
            ? <Outlet />

                : <Navigate to="/login" state={{ from: location }} replace />
    );
}

export default RequireAuth;