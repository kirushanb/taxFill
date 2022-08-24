import React, { useEffect, useState } from "react";
import OtpInput from "react-otp-input-rc-17";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Avatar from "@mui/material/Avatar";
import lottie from "lottie-web";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useAuth from "../../../hooks/useAuth";
import useAxiosClient from "../../../hooks/useAxiosClient";
import reactLogo from "../../../static/otp.json";
import loadingAnim from "../../../static/working.json";
import "./OTP.scss";

const OTP = () => {
  const [otp, setOtp] = React.useState("");
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();
  const [, setCookie] = useCookies(["user"]);
  const [loading, setLoading] = useState(false);
  const axiosClient = useAxiosClient();
  useEffect(() => {
   
    if(!auth.accessToken2FA){
      navigate('/login');
    }
  }, [auth.accessToken2FA, navigate]);

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
    if(!otp){
      toast.warn('Please enter the OTP number.')
      return
    }else if(otp.length!==6){
      toast.warn('Please enter a valid OTP number.')
      return
    }
    setLoading(true)
    try {       
        const response = await axiosClient.post('https://tax.api.cyberozunu.com/api/v1.1/Authentication/2FA-authentication',
            JSON.stringify({ token: auth.accessToken2FA, code: otp })
        );
       
        const accessToken = response?.data?.result?.token;
        const refreshToken = response?.data?.result?.refreshToken;
        setAuth({ accessToken });
        setCookie("user", accessToken, {
            path: "/"
          });
        setCookie("refreshToken", refreshToken, {
          path: "/"
        });
        setCookie("userId", response?.data?.result?.userId, {
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
     {/* <p className="title is-6">Didn't recieve OTP?</p>
     <button className="button is-ghost home" onClick={()=>null}>Resend OTP</button> */}
   </div>
   <button disabled={loading} className="button is-warning is-fullwidth" onClick={handleChange}>{loading? 'Verifying...': 'Verify'}</button>
   </div>

   
 </div>
 
</div>
 }
    </React.Fragment>
    
  );
};

export default OTP;
