import axios from "axios";
const BASE_URL = "https://tax.api.cyberozunu.com/api/v1.1";

export default axios.create({
  baseURL: BASE_URL,
});

export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json-patch+json",
    "accept": "*/*",
  },
//   withCredentials: true,
});
