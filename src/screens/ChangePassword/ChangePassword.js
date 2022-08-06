import TextField from "@mui/material/TextField";
import React, { useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import "./ChangePassword.scss";

import { yupResolver } from "@hookform/resolvers/yup";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import Typography from "@mui/material/Typography";
// import { usePlacesWidget } from "react-google-autocomplete";
import usePlacesService from "react-google-autocomplete/lib/usePlacesAutocompleteService";
import { useForm } from "react-hook-form";
import "react-phone-input-2/lib/material.css";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";

import AutoFillForm from "../../components/Address/AutoFillForm";
import useAuth from "../../hooks/useAuth";
import useAxiosClient from "../../hooks/useAxiosClient";
import { toast, ToastContainer } from "react-toastify";
import { useCookies } from "react-cookie";
import axios from "axios";

const ChangePassword = () => {
  let navigate = useNavigate();
  const [phonenumber, setPhonenumber] = React.useState("");
  const [uTRNumber, setuTRNumber] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [checked, setChecked] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [confirmpassword, setConfirmPassword] = React.useState("");
  const { setAuth } = useAuth();
  const [, setPlaces] = React.useState("");
  const axiosClient = useAxiosClient();
  const [cookies, setCookie] = useCookies(["client"]);
  const [usercookies, setUserCookie] = useCookies(["resetPassword"]);
 

  useEffect(() => {
   
    if(!usercookies.resetPassword){
      navigate('/forget-password');
    }
  }, [usercookies.resetPassword, navigate]);

  

  const handleChange = (event) => {
    setChecked(event.target.checked);
  };

  const validationSchema = Yup.object().shape({
    password: Yup.string().required("Password must not be empty"),
    confirmPassword: Yup.string()
      .required("Confirm Password must not be empty")
      .oneOf(
        [Yup.ref("password"), null],
        "Confirm passwords must match password above."
      ),
  });

  const formOptions = {
    mode: "onChange",
    resolver: yupResolver(validationSchema),
    defaultValues: {
      confirmPassword: "",
      password: "",
    },
  };

  const { register, handleSubmit, formState, setValue, trigger } =
    useForm(formOptions);
  const { errors } = formState;

  const onSubmit = async (data) => {
    setLoading(true);
    if (cookies.client) {
      try {
        const response = await axiosClient.post(
          "https://tax.api.cyberozunu.com/api/v1.1/Authentication/change-password",
          JSON.stringify({
            newPassword: data.password,
            token: usercookies.resetPassword
          })
        );
        // console.log(response?.data.result);
        // console.log(response?.data.result.otp);
        // //console.log(JSON.stringify(response));
        // const accessToken2FA = response?.data?.result?.token;
        // const otp = response?.data?.result?.otp;
        // setAuth({ accessToken2FA, otp });
        // // setUser('');
        // // setPwd('');
        
        navigate("/login");
        setLoading(false);
        toast.success("Password has been sucessfully changed!!");
      } catch (err) {
        if (err.response.data.isError) {
          toast.error(err.response.data.error.detail);
        }
        setLoading(false);
        // errRef.current.focus();
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
        const response = await axios.post(
          "https://tax.api.cyberozunu.com/api/v1.1/Authentication/change-password",
          JSON.stringify({
            newPassword: data.password,
            token: usercookies.user
          }),
          {
            headers: {
              "Content-Type": "application/json-patch+json",
              Authorization: `Bearer ${response1.data.result.token}`,
              accept: "*/*",
            },
            // withCredentials: true
          }
        );
        // console.log(response?.data.result);
        // console.log(response?.data.result.otp);
        // //console.log(JSON.stringify(response));
        // const accessToken2FA = response?.data?.result?.token;
        // const otp = response?.data?.result?.otp;
        // setAuth({ accessToken2FA, otp });
        // // setUser('');
        // // setPwd('');
        
        navigate("/login");
        setLoading(false);
        toast.success("Password has been sucessfully changed!!");
      } catch (err) {
        if (err.response.data.isError) {
          toast.error(err.response.data.error.detail);
        }
        setLoading(false);
      }
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleAddress = (value) => {
    setAddress(value);
  };

  return (
    <div className="ChangePassword">
      <ToastContainer />
      <div className="login-form">
        <div className="header">
          <button
            className="button is-ghost home"
            onClick={() => navigate("/")}
          >
            {"<- Home"}
          </button>
          <button
            className="button is-ghost home"
            onClick={() => navigate("/login")}
          >
            {"Login ->"}
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="signup-form">
          <Container component="main" maxWidth="lg">
            <Box
              sx={{
                // marginTop: 8,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {/* <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                <LockOutlinedIcon />
              </Avatar> */}
              {/* <Typography component="h1" variant="h5">
                Sign up
              </Typography> */}
              <p className="title is-3">Change Password</p>
              <Box sx={{ mt: 1 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={12} md={6}>
                    <FormControl variant="outlined" fullWidth>
                      <InputLabel htmlFor="outlined-adornment-password">
                        Password
                      </InputLabel>
                      <OutlinedInput
                        id="password"
                        fullWidth
                        type={showPassword ? "text" : "password"}
                        value={password}
                        name={"password"}
                        onChange={(event) => {
                          setPassword(event.target.value);
                          setValue("password", event.target.value);
                        }}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              edge="end"
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="Password"
                      />
                    </FormControl>
                    <Typography variant="body2" color="error" align="left">
                      {errors.password?.message}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} md={6}>
                    <FormControl variant="outlined" fullWidth>
                      <InputLabel htmlFor="confirmPassword">
                        Confirm Password
                      </InputLabel>
                      <OutlinedInput
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmpassword}
                        name={"confirmPassword"}
                        onChange={(event) => {
                          setConfirmPassword(event.target.value);
                          setValue("confirmPassword", event.target.value);
                        }}
                        fullWidth
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowConfirmPassword}
                              edge="end"
                            >
                              {showConfirmPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="Confirm Password"
                      />
                    </FormControl>
                    <Typography variant="body2" color="error" align="left">
                      {errors.confirmPassword?.message}
                    </Typography>
                  </Grid>

                  

                    
                  
                 
                </Grid>
              </Box>
            </Box>
          </Container>

          {/* <div className="signup-link">
            <p className="title is-6">Don't have an account ?</p>
            <Link to="/signup">Create account</Link>
          </div> */}

          <button disabled={loading} className="button is-medium is-warning">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
