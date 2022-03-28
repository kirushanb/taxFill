import { useCookies } from 'react-cookie';
import axios from '../api/axios';
import useAuth from './useAuth';

const useRefreshToken = () => {
    const { auth, setAuth } = useAuth();
    const [cookies, setCookie] = useCookies();
    const refresh = async () => {

        const response = await axios.post('/Authentication/refresh-token',
        JSON.stringify({ token: cookies.user, refreshToken: cookies.refreshToken }),
        {
            headers: { 'Content-Type': 'application/json-patch+json',
            Authorization: `Bearer ${cookies.user}`,
            "accept": "*/*"
        } });
        console.log(response)
        setAuth(prev => {
            console.log(JSON.stringify(prev));
            console.log(response.data.result.token);

            return { ...prev, accessToken: response.data.result.token }
        });
        setCookie("user", response.data.result.token, {
            path: "/"
          });
        return response.data.accessToken;
    }
    return refresh;
};

export default useRefreshToken;
