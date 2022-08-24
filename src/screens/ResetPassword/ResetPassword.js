import TextField from "@mui/material/TextField";
import React, { useEffect, useState } from "react";
import "./ResetPassword.scss";

import { yupResolver } from "@hookform/resolvers/yup";
import Typography from "@mui/material/Typography";
import { useForm } from "react-hook-form";
import "react-phone-input-2/lib/material.css";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import lottie from "lottie-web";
import useAuth from "../../hooks/useAuth";
import useAxiosClient from "../../hooks/useAxiosClient";
import loadingAnim from "../../static/working.json";
import { useCookies } from "react-cookie";
import axios from "axios";

const ResetPassword = () => {
  const { setAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [cookies, setCookie] = useCookies(["client"]);
  const [usercookies, setUserCookie] = useCookies(["resetPassword"]);
useEffect(()=>{
    if(usercookies.resetPassword){
      setUserCookie("resetPassword", undefined, {
        path: "/"
      });
    }
  },[usercookies.resetPassword]);

  const axiosClient = useAxiosClient();

  useEffect(() => {
    const element = document.querySelector("#loading");
    if (element) {
      lottie.loadAnimation({
        container: element,
        animationData: loadingAnim,
        renderer: "svg", // "canvas", "html"
        loop: true, // boolean
        autoplay: true, // boolean
      });
    }
  }, [loading]);

  const validationSchema = Yup.object().shape({
    email: Yup.string().email().required("Email must not be empty."),
  });

  const formOptions = {
    mode: "onChange",
    resolver: yupResolver(validationSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  };

  const { register, handleSubmit, formState } = useForm(formOptions);
  const { errors } = formState;

  const onSubmit = async (data) => {
    setLoading(true);
    if (cookies.client) {
      try {
        const response = await axiosClient.get(
          `https://tax.api.cyberozunu.com/api/v1.1//Authentication/request-forgot-password?userName=${data.email}`);
        console.log(response);
        console.log(response?.data.result);
        console.log(response?.data.result.otp);
        
        const accessToken2FA = response?.data?.result?.token;
        const otp = response?.data?.result?.otp;
        setAuth({ accessToken2FA, otp });
        setLoading(false);
       
        navigate("/otp-change-password");
      } catch (err) {
        setLoading(false);
        if (err.response.data.isError) {
          toast.error(err.response.data.error.detail);
        }
      }
    } else {
      try {
        const response1 = await axios.get(
          "https://tax.api.cyberozunu.com/api/v1.1/Authentication/Client-token?id=474FA9DA-28DB-4635-B666-EB5B6C662537&key=uwODmcIAA0e2dwKD8ifprQ%3D%3D",
          { headers: { "Access-Control-Allow-Origin": "*" } }
        );
        setCookie("client", response1.data.result.token, {
          path: "/",
        });
        const response = await axios.get( `https://tax.api.cyberozunu.com/api/v1.1//Authentication/request-forgot-password?userName=${data.email}`,
          {
            headers: {
              "Content-Type": "application/json-patch+json",
              Authorization: `Bearer ${response1.data.result.token}`,
              accept: "*/*",
            },
            // withCredentials: true
          }
        );
        console.log(response);
        console.log(response?.data.result);
        console.log(response?.data.result.otp);
        
        const accessToken2FA = response?.data?.result?.token;
        const otp = response?.data?.result?.otp;
        setAuth({ accessToken2FA, otp });
        setLoading(false);
       
        navigate("/otp-change-password");
      } catch (err) {
        setLoading(false);
        if (err.response.data.isError) {
          toast.error(err.response.data.error.detail);
        }
      }
    }
  };

  return (
    <React.Fragment>
      
      {loading ? (
        <React.Fragment>
          {loading && (
            <div className="ResetPassword">
              <div id="loading" className="loading" />
            </div>
          )}
        </React.Fragment>
      ) : (
        <div className="ResetPassword">
          <div className="login-form">
            <button
              className="button is-ghost home"
              onClick={() => navigate("/")}
            >
              {"<- Home"}
            </button>
            <form onSubmit={handleSubmit(onSubmit)}>
              <p className="title is-3">Reset Password</p>

              <div>
                <TextField
                  type="email"
                  id="email"
                  name="email"
                  label="Email"
                  variant="outlined"
                  fullWidth
                  autoComplete="off"
                  error={!!errors.email?.message}
                  {...register("email")}
                />

                <Typography variant="body2" color="error" align="left">
                  {errors.email?.message}
                </Typography>
              </div>

              
              
              <button className="button is-medium is-fullwidth is-warning" style={{marginTop:'1rem'}}>
                Next
              </button>
              
              
            </form>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default ResetPassword;
