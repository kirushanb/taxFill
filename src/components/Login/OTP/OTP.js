import React, { Component, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import OtpInput from "react-otp-input-rc-17";

import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { makeStyles, useTheme } from "@mui/styles";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Avatar from "@mui/material/Avatar";
import lottie from "lottie-web";
import reactLogo from "../../../static/otp.json";
import "./OTP.scss";
import { color } from "@mui/system";
import useAuth from "../../../hooks/useAuth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import loadingAnim from "../../../static/working.json";
import axios from "axios";
const LOGIN_URL_2FA = '/Authentication/2FA-authentication'

const OTP = () => {
  const [otp, setOtp] = React.useState("");
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();
  const [cookies, setCookie] = useCookies(["user"]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
   
    if(!auth.accessToken2FA){
      navigate('/login');
    }
  }, []);

  useEffect(() => {
    const element = document.querySelector('#tax-logo');
    if(element) {
    lottie.loadAnimation({
      container: document.querySelector("#tax-logo"),
      animationData: reactLogo,
      renderer: 'svg', // "canvas", "html"
      loop: true, // boolean
      autoplay: true, // boolean
    });
  }
   
  });

  useEffect(() => {
    const element = document.querySelector('#loading');
    if (element) {
      lottie.loadAnimation({
        container: element,
        animationData: loadingAnim,
        renderer: 'svg', // "canvas", "html"
        loop: true, // boolean
        autoplay: true, // boolean
      });
    }
    
    
  }, [loading]);

  const handleChange = async () => {
    setLoading(true)
    try {
        const response1 = await axios.get('https://tax.api.cyberozunu.com/api/v1.1/Authentication/Client-token?id=474FA9DA-28DB-4635-B666-EB5B6C662537&key=uwODmcIAA0e2dwKD8ifprQ%3D%3D',{headers: {"Access-Control-Allow-Origin": "*"}});
       
        const response = await axios.post('https://tax.api.cyberozunu.com/api/v1.1/Authentication/2FA-authentication',
            JSON.stringify({ token: auth.accessToken2FA, code: otp }),
            {
                headers: { 'Content-Type': 'application/json-patch+json',
                Authorization: `Bearer ${response1.data.result.token}`,
                "accept": "*/*"
            },
                // withCredentials: true
            }
        );
        console.log(response?.data.result);
       
        const accessToken = response?.data?.result?.token;
        const refreshToken = response?.data?.result?.refreshToken;
        setAuth({ accessToken });
        setCookie("user", accessToken, {
            path: "/"
          });
        setCookie("refreshToken", refreshToken, {
          path: "/"
        });
        setLoading(false);
      
        navigate('/account');
    } catch (err) {
      setLoading(false);
      if(err.response.data.isError){
        toast.error(err.response.data?.error?.detail,{});
      }
      
      
    }

    
  };



  return (
    <React.Fragment>
       <ToastContainer />
 {loading? <React.Fragment>{loading && <div className="OTP"><div id="loading" className="loading" /> </div>}</React.Fragment>:
 <div className="OTP">
   
     
 <div id="tax-logo" className="tax-logo" />
 
 <div className="container">
 
   <Avatar className={"avatar"}>
     <LockOutlinedIcon />
   </Avatar>

   <p className="title is-3">Two step verification</p>
   <p className="subtitle is-5">
     Please enter the verification code sent to your mobile
   </p>
   <div className="otp-input">
   <OtpInput
     value={otp}
     onChange={(otp) => setOtp(otp)}
     numInputs={6}
     separator={
       <span>
         <strong>.</strong>
       </span>
     }
     inputStyle={{
       width: "3rem",
       height: "3rem",
       margin: "0 1rem",
       fontSize: "2rem",
       borderRadius: 4,
       border: "1px solid rgba(0,0,0,0.3)",
       alignSelf: "center"
     }}
   />

   </div>
   
   <div>
   <div className="signup-link">
     <p className="title is-6">Didn't recieve OTP?</p>
     <button className="button is-ghost home" onClick={()=>null}>Resend OTP</button>
   </div>
   <button className="button is-warning is-fullwidth" onClick={handleChange}>Verify</button>
   </div>

   
 </div>
 
</div>
 }
    </React.Fragment>
    
  );
};

export default OTP;
