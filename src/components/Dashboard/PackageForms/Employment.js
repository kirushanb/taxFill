import React, { useState } from "react";
import "./Employment.scss";
import PhoneInput from "react-phone-input-2";
import TextField from "@mui/material/TextField";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import Typography from "@mui/material/Typography";
import "react-phone-input-2/lib/material.css";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Link, useNavigate, useParams } from "react-router-dom";
import SaveIcon from "@mui/icons-material/Save";
import Files from "react-files";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  Fab,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
  AddLinkOutlined,
  Copyright,
  Upload,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import DateAdapter from "@mui/lab/AdapterDateFns";
import { DatePicker, LocalizationProvider } from "@mui/lab";
import ReactGoogleAutocomplete from "react-google-autocomplete";
import { usePlacesWidget } from "react-google-autocomplete";
import { styled } from "@mui/material/styles";

import PhotoCamera from "@mui/icons-material/PhotoCamera";
import Stack from "@mui/material/Stack";
import FileUpload from "react-material-file-upload";
import UploadFiles from "./UploadFiles";
import axios from "axios";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useCookies } from "react-cookie";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const Input = styled("input")({
  display: "none",
});

const Employment = () => {
  let navigate = useNavigate();
  const [overallexpenseValue, setOverallexpensesValue] = React.useState("");
  
  const [urls, setUrls] = useState([]);
 
  const [showPassword, setShowPassword] = React.useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [overallexpenses, setOverallexpenses] = React.useState(false);
  const [expenseListHide, setExpenseListHide] = React.useState(false);
  
  const axiosPrivate = useAxiosPrivate();
  const [isLoading, setLoading] = React.useState(false);
  const [expensesList, setExpensesList] = React.useState([{
    description: "",
    amount: 0,
  }]);
  const params = useParams();
  const [cookies, setCookie] = useCookies();
  const { ref, autocompleteRef } = usePlacesWidget({
    apiKey: "YOUR_GOOGLE_MAPS_API_KEY",
    onPlaceSelected: (place) => {
      console.log(place);
    },
  });


  const validationSchema = Yup.object().shape({
    employerName: Yup.string().required("Employer name must not be empty."),
    payee: Yup.string().required("Payee Ref Number must not be empty."),
    incomeFrom:Yup.string().required("Income from P60/P45 must not be empty."),
    taxFrom: Yup.string().required("Tax from P60/P45 must not be empty"),
  });

  const formOptions = {
    mode: "onChange",
    resolver: yupResolver(validationSchema),
    defaultValues: {
      employerName: "",
      payee: "",
      incomeFrom: "",
      taxFrom: "",
    },
  };

  const {
    register,
    handleSubmit,
    formState,
    reset,
    setValue,
    trigger,
    getValues,
  } = useForm(formOptions);
  const { errors } = formState;

  const onSubmit = async (data) => {
  
    setLoading(true);
    try {
      const response = await axiosPrivate.post("/EmploymentDetail",
          {
            orderId: params.orderId?params.orderId: cookies.order.oderId,
            name: data.employerName,
            paye: data.payee,
            incomeFromP60_P45: data.incomeFrom,
            taxFromP60_P45: data.taxFrom,
            overallExpenses: overallexpenseValue?parseInt(overallexpenseValue):0,
            expenses: overallexpenseValue?[]:[...expensesList.map(n=>{
              return({description:n.description,amount:parseInt(n.amount)})
            })],
            attachments:[...urls.map(n=>{ 
              return({url:n})})]
          }
      );

      setLoading(false);
      toast.success("Employment Details Saved Successfully");
      reset();
     setExpensesList([{description: "",
     amount: "",}])
     setLoading(false);
     setUrls([]);
     setOverallexpensesValue("");
          
          if(params.orderId){
            navigate('/account');
          }else{
            if(cookies.order.selectedPackages.length>1){
             
              const filteredEmployement = cookies.order.selectedPackages.filter(n=> n.package.name === "Employment");
             
              filteredEmployement[0].package.recordsAdded = true;
              
              const filteredOther= cookies.order.selectedPackages.filter(n=> n.package.name !== "Employment");
              const filtered = filteredOther.filter(n=> n.package.recordsAdded===false);
              
              setCookie("order", {oderId:cookies.order.oderId,selectedPackages:{...filteredOther,...filteredEmployement}}, {
                path: "/"
              });
              
              if(filtered.length>0){  
                navigate(`/${(filtered[0].package.name).toLowerCase().replace(/\s/g, '')}`)
              }else{
                navigate('/account');
              }
            }else{
              navigate('/account');
            }
            
          }
       
       
    
    } catch (err) {
     
      // if (!err?.response) {
      //     setErrMsg('No Server Response');
      // } else if (err.response?.status === 400) {
      //     setErrMsg('Missing Username or Password');
      // } else if (err.response?.status === 401) {
      //     setErrMsg('Unauthorized');
      // } else {
      //     setErrMsg('Login Failed');
      // }
      // errRef.current.focus();
      setLoading(false);
      toast.error(err);
    }
  };

  const onSubmitAndAddAnother = async (data) => {
    
    setLoading(true);
    try {
      const response = await axiosPrivate.post("/EmploymentDetail",
          {
            orderId: params.orderId?params.orderId: cookies.order.oderId,
            name: data.employerName,
            paye: data.payee,
            incomeFromP60_P45: data.incomeFrom,
            taxFromP60_P45: data.taxFrom,
            overallExpenses: overallexpenseValue,
            expenses: overallexpenseValue?[]:[...expensesList.map(n=>{
              return({description:n.description,amount:parseInt(n.amount)})
            })],
            attachments:[...urls.map(n=>{ 
              return({url:n})})]
          }
      );
      
     
      
     reset();
     setExpensesList([{description: "",
     amount: "",}])
     setLoading(false);
     toast.success("Employment Details Saved Successfully")
     setUrls([]);
     setOverallexpensesValue("");
    } catch (err) {
      // if (!err?.response) {
      //     setErrMsg('No Server Response');
      // } else if (err.response?.status === 400) {
      //     setErrMsg('Missing Username or Password');
      // } else if (err.response?.status === 401) {
      //     setErrMsg('Unauthorized');
      // } else {
      //     setErrMsg('Login Failed');
      // }
      // errRef.current.focus();
      setLoading(false);
      toast.error(err);
    }
  };
  

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  function handleChangeInput(i, event) {
    const values = [...expensesList];
    const { name, value } = event.target;
    values[i][name] = value;
    setExpensesList(values);
    if(value){
      setOverallexpenses(true);
     
      setOverallexpensesValue(values.reduce((acc, curr) => acc + parseInt(curr.amount), 0));
     
    }else{
     
      setOverallexpenses(false);
      
    }
  }

  function handleAddInput() {
    const values = [...expensesList];
    values.push({
      description: "",
      amount: 0,
    });
    setExpensesList(values);
    setOverallexpensesValue(expensesList.reduce((acc, curr) => acc + parseInt(curr.amount), 0));

  }

  function handleRemoveInput(i) {
    const values = [...expensesList];
    values.splice(i, 1);
    setExpensesList(values);
    setOverallexpensesValue(values.reduce((acc, curr) => acc + parseInt(curr.amount), 0));

  }

  const handleUpload = (urlsComming) => {
    setUrls(urlsComming);
  }

  const handleOverallExpenses = (e) => {
    setOverallexpensesValue(e.target.value);
    if(e.target.value){
      setExpenseListHide(true);
    }else{
      setExpenseListHide(false);
    }
  }

  return (
    <div className="Employment">
       {isLoading 
     ? 
     <CircularProgress />
     :
      <form >
         <ToastContainer />
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
            <p className="title is-3">Employment Details</p>
            <Box sx={{ mt: 1 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={12}>
                  <InputLabel
                    htmlFor="employer"
                    required
                    sx={{ fontWeight: "bold" }}
                  >
                    Employment
                  </InputLabel>
                  <TextField
                    name="employerName"
                    required
                    fullWidth
                    id="employerName"
                    //   label="Enter your employer name"
                    placeholder="Enter your employer name"
                    autoFocus
                    error={errors.employerName?.message}
                    {...register("employerName")}
                  />

                  <Typography variant="body2" color="error" align="left">
                    {errors.employerName?.message}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12}>
                  <InputLabel
                    htmlFor="payee"
                    required
                    sx={{ fontWeight: "bold" }}
                  >
                    Payee Ref Number
                  </InputLabel>
                  <TextField
                    required
                    fullWidth
                    id="payee"
                    name="payee"
                    {...register("payee")}
                    placeholder="Payee Ref Number"
                  />
                  <Typography variant="body2" color="error" align="left">
                    {errors.payee?.message}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12}>
                  <InputLabel
                    htmlFor="payee"
                    required
                    sx={{ fontWeight: "bold" }}
                  >
                    Income from P60/P45
                  </InputLabel>
                  <TextField
                    required
                    fullWidth
                    id="incomeFrom"
                    name="incomeFrom"
                    {...register("incomeFrom")}
                    type='number'
                    placeholder="Income from P60/P45"
                  />
                  <Typography variant="body2" color="error" align="left">
                    {errors.incomeFrom?.message}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12}>
                  <InputLabel
                    htmlFor="payee"
                    required
                    sx={{ fontWeight: "bold" }}
                  >
                    Tax from P60/P45
                  </InputLabel>
                  <TextField
                    required
                    fullWidth
                    id="taxFrom"
                    name="taxFrom"
                    {...register("taxFrom")}
                    type='number'
                    placeholder="Tax from P60/P45"
                  />
                  <Typography variant="body2" color="error" align="left">
                    {errors.taxFrom?.message}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12}>
                  <InputLabel htmlFor="payee" sx={{ fontWeight: "600" }}>
                    Expenses
                  </InputLabel>
                </Grid>
                <Grid item xs={12} sm={12}>
                  <InputLabel
                    htmlFor="payee"
                    required
                    // sx={{ fontWeight: "bold" }}
                  >
                    Overall expenses
                  </InputLabel>
                  <TextField
                    required
                    fullWidth
                    id="overallExpenses"
                    name="overallExpenses"
                    type={"number"}
                    onChange={handleOverallExpenses}
                    placeholder="Enter your overall expenses"
                    value={overallexpenseValue}
                    disabled={overallexpenses}
                  />
                  <Typography variant="body2" color="error" align="left">
                    {errors.taxFrom?.message}
                  </Typography>
                </Grid>
                {expensesList.map((field, idx) => (
                  <React.Fragment key={field+"-"+idx}>
                    <Grid item xs={12} sm={5.5}>
                      <InputLabel htmlFor="payee" required>
                        Description
                      </InputLabel>
                      <TextField
                        required
                        fullWidth
                        id="description"
                        name="description"
                        value={field.description}
                        // {...register("description")}
                        onChange={(e) => handleChangeInput(idx, e)}
                        placeholder="Description"
                        disabled={expenseListHide}
                      />
                      <Typography variant="body2" color="error" align="left">
                        {errors.lastName?.message}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={5.5}>
                      <InputLabel htmlFor="payee" required>
                        Amount
                      </InputLabel>
                      <TextField
                        required
                        fullWidth
                        id="amount"
                        name="amount"
                        value={field.amount}
                        type="number"
                        // {...register("description")}
                        onChange={(e) => handleChangeInput(idx, e)}
                        // {...register("amount")}
                        placeholder="Amount"
                        disabled={expenseListHide}
                      />
                      <Typography variant="body2" color="error" align="left">
                        {errors.lastName?.message}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      {idx === 0 ? (
                        <Fab
                          onClick={ handleAddInput
                          }
                          color="primary"
                          size="small"
                          aria-label="add"
                          sx={{
                            background: "#49c68d",
                            alignSelf: "center",
                            marginTop: "1.8rem",
                          }}
                        >
                          <AddIcon />
                        </Fab>
                      ) : (
                        <Fab
                          onClick={()=>handleRemoveInput(idx)}
                          color="primary"
                          size="small"
                          aria-label="add"
                          sx={{
                            background: "#49c68d",
                            alignSelf: "center",
                            marginTop: "1.8rem",
                          }}
                        >
                          <RemoveIcon />
                        </Fab>
                      )}
                    </Grid>
                  </React.Fragment>
                ))}
                <Grid item xs={12} sm={12}>
                  <UploadFiles handleUpload={handleUpload}/>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Container>

        
        <div className="footer-save-button">
          <button className="button is-warning" onClick={handleSubmit(onSubmit)}>
            <SaveIcon />
            Save
          </button>
          <button className="button is-success" onClick={handleSubmit(onSubmitAndAddAnother)}>
            <SaveIcon />
            Save and Add another
          </button>
        </div>
      </form>}
    </div>
  );
};

export default Employment;
