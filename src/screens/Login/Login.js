import React, { useEffect, useState } from "react";
import "./Login.scss";
import PhoneInput from "react-phone-input-2";
import TextField from "@mui/material/TextField";

import Typography from "@mui/material/Typography";
import "react-phone-input-2/lib/material.css";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import useAuth from "../../hooks/useAuth";
import { useCookies } from "react-cookie";
import lottie from "lottie-web";
import loadingAnim from "../../static/working.json";
import axios from "axios";
const LOGIN_URL = '/login';

const Login = () => {
    const { setAuth } = useAuth();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";
    
   
    const [errMsg, setErrMsg] = useState('');

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
 
 
  const [phonenumber, setPhonenumber] = React.useState('');
  const validationSchema = Yup.object().shape({
    phone: Yup.string().required("Phone number must not be empty."),
    password: Yup.string().required("Password must not be empty.")
    //   .matches(
    //     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
    //     "Password must have minimum eight characters, at least one uppercase letter, one lowercase letter and one number."
    //   )
      ,
  });

  const formOptions = {
    mode: "onChange",
    resolver: yupResolver(validationSchema),
    defaultValues: {
        phone: "",
        password:""
    },
  };

  const { register, handleSubmit, formState, reset, setValue, trigger } = useForm(formOptions);
  const { errors } = formState;

  const onSubmit = async (data) => {
    setLoading(true)
    try {
        const response1 = await axios.get('https://tax.api.cyberozunu.com/api/v1.1/Authentication/Client-token?id=474FA9DA-28DB-4635-B666-EB5B6C662537&key=uwODmcIAA0e2dwKD8ifprQ%3D%3D',{headers: {"Access-Control-Allow-Origin": "*"}});
        const response = await axios.post('https://tax.api.cyberozunu.com/api/v1.1/Authentication/login',
            JSON.stringify({ userName:"+"+data.phone, password:data.password }),
            {
                headers: { 'Content-Type': 'application/json-patch+json',
                Authorization: `Bearer ${response1.data.result.token}`,
                "accept": "*/*"
            },
                // withCredentials: true
            }
        );
        console.log(response);
        console.log(response?.data.result);
        console.log(response?.data.result.otp);
        //console.log(JSON.stringify(response));
        const accessToken2FA = response?.data?.result?.token;
        const otp = response?.data?.result?.otp
        setAuth({ accessToken2FA, otp });
        setLoading(false);
        // setUser('');
        // setPwd('');
        navigate('/otp');
    } catch (err) {
      setLoading(false);
      if(err.response.data.isError){
        toast.error(err.response.data.error.detail);
      }
    }
    
  };

  return (
    <React.Fragment>
       <ToastContainer />
      {loading?<React.Fragment>{loading && <div className="Login">
        <div id="loading" className="loading" />
        </div>}</React.Fragment>:
    <div className="Login">
       
        <div className="login-form">
          
        <button className="button is-ghost home" onClick={()=>navigate('/')}>{"<- Home"}</button>
      <form onSubmit={handleSubmit(onSubmit)}>
        <p className="title is-3">Login to account</p>

        <div>
          <PhoneInput
            id="phone"
            name="phone"
            country={"lk"}
            value={phonenumber}
            onlyCountries={["gb",'lk']}
            onChange={(phone) => {
                setPhonenumber(phone)
                setValue("phone",phone)
                trigger('phone')
            }}
          />

          <Typography variant="body2" color="error" align="left">
            {errors.phone?.message}
          </Typography>
        </div>

        <div>
          <TextField
            type="password"
            id="password"
            name="password"
            label="Password"
            variant="outlined"
            fullWidth
            autoComplete="off"
            {...register("password")}
          />
          <Typography variant="body2" color="error" align="left">
            {errors.password?.message}
          </Typography>
        </div>
        <div className="signup-link">
          <p className="title is-6">Don't have an account ?</p>
          <Link to="/signup">Create account</Link>
        </div>
        <button className="button is-medium is-fullwidth is-warning">
          Next
        </button>
      </form>
        </div>

    </div>}
    </React.Fragment>
    
  );
};

export default Login;
