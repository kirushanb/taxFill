import TextField from "@mui/material/TextField";
import React, { useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import "./EditAccount.scss";
import PasswordChecklist from "react-multiple-password-validator";
import { yupResolver } from "@hookform/resolvers/yup";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  Checkbox,
  CircularProgress,
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

import AutoFillForm from "../Address/AutoFillForm";
import useAuth from "../../hooks/useAuth";
import useAxiosClient from "../../hooks/useAxiosClient";
import { toast, ToastContainer } from "react-toastify";
import { useCookies } from "react-cookie";
import axios from "axios";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import moment from "moment";
import ResetPassword from "../../screens/ResetPassword/ResetPassword";

const EditAccount = () => {
  let navigate = useNavigate();
  const [phonenumber, setPhonenumber] = React.useState("");
  const [uTRNumber, setuTRNumber] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [checked, setChecked] = React.useState(false);
  const [id, setId] = React.useState("");

  const [loading, setLoading] = React.useState(true);

  // const [, setPlaces] = React.useState("");

  const axiosPrivate = useAxiosPrivate();
  const [cookies, setCookie, removeCookie] = useCookies(["user"]);
  // const {
  //   placesService,
  //   placePredictions,
  //   // getPlacePredictions,
  //   // isPlacePredictionsLoading,
  // } = usePlacesService({
  //   apiKey: "AIzaSyDezvcxcWVk19G542NjV5St1IGSf0ixwIY",
  // });

  React.useEffect(() => {
    if (cookies?.userId) {
      setLoading(true);
      (async () => {
        try {
          const response = await axiosPrivate.get(
            `https://tax.api.cyberozunu.com/api/v1.1/Customer/${cookies?.userId}`
          );
          if (response?.data?.result) {
            const result = response?.data?.result;
            
            const fields = [
              "firstName",
              "lastName",
              "email",
              "phone",
              "nINumber",
              "dob",
              "address"
            ];

            const packages = {
              firstName: result?.firstName,
              lastName: result?.lastName,
              email: result?.email,
              phone: result?.phoneNumber,
              nINumber: result?.nI_Number,
              dob: moment(result?.dob).format("YYYY-MM-DD"),
              address: JSON.parse(result.address ?? {})
            };
            fields.forEach((field) => setValue(field, packages[field]));
            setPhonenumber(packages.phone);
            setId(result.id);
            setAddress(JSON.parse(result.address ?? {}));
            if (result?.utR_Number) {
              setuTRNumber(result?.utR_Number);
              setValue("uTRNumber", result?.utR_Number);
            } else {
              setChecked(true);
            }
          }
          setLoading(false);
        } catch (error) {
          console.log(error);
          setLoading(false);
        }
      })();
    }
  }, [cookies?.userId]);

  const handleChange = (event) => {
    setChecked(event.target.checked);
  };

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("First name must not be empty."),
    lastName: Yup.string().required("Last name must not be empty."),
    email: Yup.string(),
    phone: Yup.string()
      .required("Phone number must not be empty")
      .min(10, "Phone number must be enough length"),
    nINumber: Yup.string()
      .required("NI Number must not be empty")
      .matches(
        /^\s*[a-zA-Z]{2}(?:\s*\d\s*){6}[a-zA-Z]?\s*[a-zA-Z]{1}$/,
        "NI Number must be valid"
      ),
    dob: Yup.string().required("DOB  must not be empty"),
    uTRNumber: Yup.string(),
    address: Yup.object(),
  });

  const formOptions = {
    mode: "onChange",
    resolver: yupResolver(validationSchema),
    defaultValues: {
      phone: "",
      password: "",
    },
  };

  const { register, handleSubmit, formState, setValue, trigger, reset } =
    useForm(formOptions);
  const { errors } = formState;

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      await axiosPrivate.put(
        "https://tax.api.cyberozunu.com/api/v1.1/Customer",
        JSON.stringify({
          id: id,
          firstName: data.firstName,
          lastName: data.lastName,
          dob: data.dob,
          nI_Number: data.nINumber,
          utR_Number: data.uTRNumber
            ? data.uTRNumber.replace(/\s/g, "")
            : data.uTRNumber,
          address: JSON.stringify(data.address ?? {}),
          phoneNumber: data.phone,
          email: data.email,
          status: 1,
        })
      );
      navigate("/account");
      toast.success("Account updated successfully");
      setLoading(false);
      reset();
      setPhonenumber("");
      setId("");
      setAddress("");
      setuTRNumber("");

      setChecked(false);
    } catch (err) {
      if (err.response.data.isError) {
        toast.error(err.response.data.error.detail);
      }
      setLoading(false);
    }
  };

  const handleAddress = (value) => {
    setValue("address", value)
  };

  const formValid = () => {
    // if (!validPassword) {
    //   return false;
    // }
    return true;
  };

  return (
    <div className="EditAccount">
      <div className="login-form">
        <div className="header">
         {!loading && <button
            className="button is-ghost home"
            onClick={() => navigate("/account")}
          >
            {"<- Back"}
          </button>}
        </div>
        {loading ? (
          <CircularProgress />
        ) : (
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
                <p className="title is-3">Edit Account</p>
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
                        disabled={true}
                        {...register("email")}
                      />
                      <Typography variant="body2" color="error" align="left">
                        {errors.email?.message}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <AutoFillForm
                        handleAddress={handleAddress}
                        addressComingFrom={address}
                      />

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

            <button disabled={loading} className="button is-medium is-warning">
              Update
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditAccount;
