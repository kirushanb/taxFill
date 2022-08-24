import TextField from "@mui/material/TextField";
import React, { useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import "./Signup.scss";
import PasswordChecklist from "react-multiple-password-validator";
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

const Signup = () => {
  let navigate = useNavigate();
  const [phonenumber, setPhonenumber] = React.useState("");
  const [uTRNumber, setuTRNumber] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [checked, setChecked] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [validPassword, setValidPassword] = React.useState(false);
  const [confirmpassword, setConfirmPassword] = React.useState("");
  const { setAuth } = useAuth();
  const [, setPlaces] = React.useState("");
  const axiosClient = useAxiosClient();
  const [cookies, setCookie] = useCookies(["client"]);
  // const { ref, autocompleteRef } = usePlacesWidget({
  //   apiKey:"AIzaSyDezvcxcWVk19G542NjV5St1IGSf0ixwIY",
  //   onPlaceSelected: (place) => {
  //     console.log(place);
  //   }
  // });

  const {
    placesService,
    placePredictions,
    // getPlacePredictions,
    // isPlacePredictionsLoading,
  } = usePlacesService({
    apiKey: "AIzaSyDezvcxcWVk19G542NjV5St1IGSf0ixwIY",
  });

  useEffect(() => {
    // fetch place details for the first element in placePredictions array
    if (placePredictions.length)
      placesService?.getDetails(
        {
          placeId: placePredictions[0].place_id,
        },
        (placeDetails) => setPlaces(placeDetails)
      );
  }, [placePredictions, placesService]);

  const handleChange = (event) => {
    setChecked(event.target.checked);
  };

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("First name must not be empty."),
    lastName: Yup.string().required("Last name must not be empty."),
    email: Yup.string()
      .email("Email must be valid email")
      .required("Email must not be empty"),
    password: Yup.string().required("Password must not be empty"),
    confirmPassword: Yup.string()
      .required("Confirm Password must not be empty")
      .oneOf(
        [Yup.ref("password"), null],
        "Confirm passwords must match password above."
      ),
    phone: Yup.string()
      .required("Phone number must not be empty")
      .min(10, "Phone number must be enough length"),
    nINumber: Yup.string()
      .required("NI Number must not be empty")
      .matches(
        /^\s*[a-zA-Z]{2}(?:\s*\d\s*){6}[a-zA-Z]?\s*[a-zA-Z]{1}$/,
        "NI Number must be valid"
      ),
  });

  const formOptions = {
    mode: "onChange",
    resolver: yupResolver(validationSchema),
    defaultValues: {
      phone: "",
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
          "https://tax.api.cyberozunu.com/api/v1.1/Customer",
          JSON.stringify({
            firstName: data.firstName,
            lastName: data.lastName,
            dob: data.dob,
            nI_Number: data.nINumber,
            utR_Number: data.uTRNumber
              ? data.uTRNumber.replace(/\s/g, "")
              : data.uTRNumber,
            address: JSON.stringify(address ?? {}),
            email: data.email,
            phoneNumber: data.phone,
            status: 1,
            password: data.password,
          })
        );
        console.log(response?.data.result);
        console.log(response?.data.result.otp);
        //console.log(JSON.stringify(response));
        const accessToken2FA = response?.data?.result?.token;
        const otp = response?.data?.result?.otp;
        setAuth({ accessToken2FA, otp });
        // setUser('');
        // setPwd('');
        navigate("/otp");
        setLoading(false);
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
          "https://tax.api.cyberozunu.com/api/v1.1/Customer",
          JSON.stringify({
            firstName: data.firstName,
            lastName: data.lastName,
            dob: data.dob,
            nI_Number: data.nINumber,
            utR_Number: data.uTRNumber
              ? data.uTRNumber.replace(/\s/g, "")
              : data.uTRNumber,
            address: JSON.stringify(address ?? {}),
            email: data.email,
            phoneNumber: data.phone,
            status: 1,
            password: data.password,
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
        console.log(response?.data.result);
        console.log(response?.data.result.otp);
        //console.log(JSON.stringify(response));
        const accessToken2FA = response?.data?.result?.token;
        const otp = response?.data?.result?.otp;
        setAuth({ accessToken2FA, otp });
        // setUser('');
        // setPwd('');
        navigate("/otp");
        setLoading(false);
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

  const formValid = () => {
    if (!validPassword) {
      return false;
    }
    return true;
  };

  return (
    <div className="Signup">
      
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
              <p className="title is-3">Sign up</p>
              <Box sx={{ mt: 1 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      autoComplete="given-name"
                      name="firstName"
                      required
                      fullWidth
                      id="firstName"
                      label="First Name"
                      autoFocus
                      error={errors.firstName?.message}
                      {...register("firstName")}
                    />
                    <Typography variant="body2" color="error" align="left">
                      {errors.firstName?.message}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="lastName"
                      label="Last Name"
                      name="lastName"
                      autoComplete="family-name"
                      {...register("lastName")}
                    />
                    <Typography variant="body2" color="error" align="left">
                      {errors.lastName?.message}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      autoComplete="email"
                      {...register("email")}
                    />
                    <Typography variant="body2" color="error" align="left">
                      {errors.email?.message}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl sx={{ width: "35ch" }} variant="outlined">
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
                  <Grid item xs={12} sm={6}>
                    <FormControl sx={{ width: "35ch" }} variant="outlined">
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
                  {(password || confirmpassword) && (
                    <Grid item xs={12} sm={12}>
                      <PasswordChecklist
                        rules={[
                          "minLength",
                          "specialChar",
                          "number",
                          "capital",
                          "match",
                        ]}
                        minLength={8}
                        specialCharLength={1}
                        numberLength={1}
                        capitalLength={1}
                        lowerCaseLength={1}
                        value={password}
                        valueAgain={confirmpassword}
                        onChange={(isValid) => setValidPassword(isValid)}
                      />
                    </Grid>
                  )}
                  <Grid item xs={12} sm={6}>
                    {/* <ReactGoogleAutocomplete
  apiKey={"AIzaSyDezvcxcWVk19G542NjV5St1IGSf0ixwIY"}
  onPlaceSelected={(place) => console.log(place)}
/> */}

                    {/* <InputLabel htmlFor="address">
                        Address
                      </InputLabel> */}
                    {/* <input className="address-input" ref={ref}></input> */}

                    <AutoFillForm handleAddress={handleAddress} />

                    <Typography variant="body2" color="error" align="left">
                      {errors.address?.message}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="dob"
                      required
                      fullWidth
                      id="dob"
                      label="Date of Birth"
                      type={"date"}
                      autoFocus
                      InputLabelProps={{
                        shrink: true,
                      }}
                      {...register("dob")}
                    />

                    <Typography
                      mt={3}
                      variant="body2"
                      color="error"
                      align="left"
                    >
                      {errors.dob?.message}
                    </Typography>

                    <PhoneInput
                      id="phone"
                      name="phone"
                      country={"lk"}
                      value={phonenumber}
                      onlyCountries={["gb", "lk"]}
                      onChange={(phone) => {
                        setPhonenumber(phone);
                        setValue("phone", phone);
                        trigger("phone");
                      }}
                      specialLabel={"Phone number"}
                    />

                    <Typography variant="body2" color="error" align="left">
                      {errors.phone?.message}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="uTRNumber"
                      required={!checked}
                      fullWidth
                      id="uTRNumber"
                      label="UTR Number"
                      autoFocus
                      value={uTRNumber}
                      disabled={checked}
                      onChange={(e) => {
                        e.target.value = e.target.value
                          .replace(/[^\dA-Z]/g, "")
                          .replace(/(.{5})/g, "$1 ")
                          .trim();
                        setuTRNumber(e.target.value);
                        setValue("uTRNumber", e.target.value);
                        trigger("uTRNumber");
                      }}
                      inputProps={{ maxLength: 11 }}
                    />
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={checked}
                            onChange={handleChange}
                            value=""
                            color="primary"
                          />
                        }
                        label="I don't have a UTR number"
                      />
                    </Grid>
                    <Typography variant="body2" color="error" align="left">
                      {errors.uTRNumber?.message}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="nINumber"
                      required
                      fullWidth
                      id="nINumber"
                      label="NI Number"
                      autoFocus
                      placeholder="QQ 123456 C"
                      {...register("nINumber")}
                    />
                    <Typography variant="body2" color="error" align="left">
                      {errors.nINumber?.message}
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

          <button disabled={!formValid() || loading} className="button is-medium is-warning">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
