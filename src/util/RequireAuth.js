import { useCookies } from "react-cookie";
import { useLocation, Navigate, Outlet } from "react-router-dom";

const RequireAuth = () => {
    const [cookies] = useCookies();
    const location = useLocation();

    return (
        cookies.user
            ? <Outlet />

                : <Navigate to="/" state={{ from: location }} replace />
    );
}

export default RequireAuth;