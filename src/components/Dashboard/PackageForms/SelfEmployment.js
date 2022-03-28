import React, { useState } from "react";
import "./SelfEmployment.scss";
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
import { useCookies } from "react-cookie";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";

const getMonths = (fromDate, toDate) => {
  const fromYear = fromDate.getFullYear();
  const fromMonth = fromDate.getMonth();
  const toYear = toDate.getFullYear();
  const toMonth = toDate.getMonth();
  const months = [];
  for(let year = fromYear; year <= toYear; year++) {
    let month = year === fromYear ? fromMonth : 0;
    const monthLimit = year === toYear ? toMonth : 11;
    for(; month <= monthLimit; month++) {
      months.push({ year, month, amount:"" })
    }
  }
  return months;
}
const mL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const mS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];


const Input = styled("input")({
  display: "none",
});

const SelfEmployment = () => {
  let navigate = useNavigate();
 
  const [overallexpenses, setOverallexpenses] = React.useState(false);
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [monthsList, setMonthsList] = React.useState([]);
  const axiosPrivate = useAxiosPrivate();
  const [expensesList, setExpensesList] = React.useState([{
    description: "",
    amount: "",
  }]);
  const params = useParams();
  const [overallexpenseValue, setOverallexpensesValue] = React.useState("");
  const [cookies, setCookie] = useCookies();
  const [urls, setUrls] = useState([]);
  const [isLoading, setLoading] = React.useState(false);
  const { ref, autocompleteRef } = usePlacesWidget({
    apiKey: "YOUR_GOOGLE_MAPS_API_KEY",
    onPlaceSelected: (place) => {
      console.log(place);
    },
  });

  

  const validationSchema = Yup.object().shape({
    businessName: Yup.string().required("Business name must not be empty."),
    descriptionOfBusiness:Yup.string().required("Description of your business must not be empty."),
    address: Yup.string().required("Business address must not be empty."),
    totalTurnover: Yup.number().required("Total turnover must not be empty"),
   
  });

  const formOptions = {
    mode: "onChange",
    resolver: yupResolver(validationSchema),
    defaultValues: {
      businessName: "",
      descriptionOfBusiness: "",
      address: "",
      totalTurnover: "",
      overallExpenses: "",
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
      const response = await axiosPrivate.post("https://tax.api.cyberozunu.com/api/SelfEmployment",
          {
            orderId: params.orderId?params.orderId: cookies.order.oderId,
            businessName: data.businessName,
            descriptionOfBusiness: data.descriptionOfBusiness,
            address: data.address,
            postalCode: data.postalCode,
            accountingPeriodFrom: startDate,
            accountPeriodTo: endDate,
            totalTurnOver: data.totalTurnover,
            turnOver: [...monthsList.map(n=>{
              return({month:mL[n.month],amount:parseInt(n.amount)})
            })],
            overallExpenses: overallexpenseValue,
            expenses: overallexpenseValue?[]:[...expensesList.map(n=>{
              return({description:n.description,amount:parseInt(n.amount)})
            })],
            attachments:[...urls.map(n=>{ 
              return({url:n})})]
          }
      );
      setLoading(false);
      reset();
     setExpensesList([{description: "",
     amount: "",}])
     setLoading(false);
     setUrls([]);
     setOverallexpensesValue("");
      if(params.orderId){
        navigate('/account');
      }else{
        const filtered = cookies.order.selectedPackages.filter(n=> n.package.name !== "Self Employment");
        
        if(filtered.length>1){
          navigate(`/${(filtered[0].package.name).toLowerCase().replace(/\s/g, '')}`)
        }else{
          navigate('/account')
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
    }
  };

  const onSubmitAndAddAnother = async (data) => {
    setLoading(true);
  
    try {
      const response = await axiosPrivate.post("https://tax.api.cyberozunu.com/api/SelfEmployment",
          {
            orderId: params.orderId?params.orderId: cookies.order.oderId,
            businessName: data.businessName,
            descriptionOfBusiness: data.descriptionOfBusiness,
            address: data.address,
            postalCode: data.postalCode,
            accountingPeriodFrom: startDate,
            accountPeriodTo: endDate,
            totalTurnOver: data.totalTurnover,
            turnOver: [...monthsList.map(n=>{
              return({month:mL[n.month],amount:parseInt(n.amount)})
            })],
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
    }
  };
  
  
const handleInputMonth = (i, event) => {
  const values = [...monthsList];
    const { name, value } = event.target;
    values[i]["amount"] = value;
    setMonthsList(values);
  
}


  function handleChangeInput(i, event) {
    const values = [...expensesList];
    const { name, value } = event.target;
    values[i][name] = value;
    setExpensesList(values);
    if(value){
      setOverallexpenses(true)
    }else{
      setOverallexpenses(false)
    }
    
  }

  function handleAddInput() {
    const values = [...expensesList];
    values.push({
      description: "",
      amount: "",
    });
    setExpensesList(values);
  }

  function handleRemoveInput(i) {
    const values = [...expensesList];
   
    values.splice(i, 1);
    setExpensesList(values);
  }

  const handleStartDate = (e) => {
    setStartDate(e.target.value)
  }

  const handleEndDate = (e) => {
    setEndDate(e.target.value)
    setMonthsList(getMonths(new Date(startDate),new Date(e.target.value)))
    console.log(getMonths(new Date(startDate),new Date(e.target.value)))
  }

  const handleUpload = (urlsComming) => {
    setUrls(urlsComming);
  }

  const handleOverallExpenses = (e) => {
    setOverallexpensesValue(e.target.value);
  }

  return (
    <div className="SelfEmployment">
      {isLoading
     ? 
     <CircularProgress />
     :
      <form >
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
            <p className="title is-3">Self Employment Details</p>
            <Box sx={{ mt: 1 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={12}>
                  <InputLabel
                    htmlFor="employer"
                    required
                    sx={{ fontWeight: "bold" }}
                  >
                    Business Name
                  </InputLabel>
                  <TextField
                    name="businessName"
                    required
                    fullWidth
                    id="businessName"
                    //   label="Enter your employer name"
                    placeholder="Enter your business name"
                    autoFocus
                    error={errors.firstName?.message}
                    {...register("businessName")}
                  />

                  <Typography variant="body2" color="error" align="left">
                    {errors.businessName?.message}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <InputLabel
                    htmlFor="descriptionOfBusiness"
                    required
                    sx={{ fontWeight: "bold" }}
                  >
                    Description of business
                  </InputLabel>
                  <TextField
                    required
                    fullWidth
                    id="descriptionOfBusiness"
                    name="descriptionOfBusiness"
                    {...register("descriptionOfBusiness")}
                    placeholder="Describe your business"
                  />
                  <Typography variant="body2" color="error" align="left">
                    {errors.descriptionOfBusiness?.message}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InputLabel
                    htmlFor="address"
                    required
                    sx={{ fontWeight: "bold" }}
                  >
                    Address
                  </InputLabel>
                  <TextField
                    required
                    fullWidth
                    multiline
                    maxRows={4}
                    id="address"
                    name="address"
                    {...register("address")}
                    placeholder="Enter your business address"
                  />
                  <Typography variant="body2" color="error" align="left">
                    {errors.address?.message}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12}>
                  <InputLabel htmlFor="payee" sx={{ fontWeight: "600" }}>
                    Accounting period
                  </InputLabel>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <InputLabel
                    htmlFor="startDate"
                    required
                    sx={{ fontWeight: "bold" }}
                  >
                    Date your books or accounts start
                  </InputLabel>
                  <TextField
                    required
                    fullWidth
                    id="startDate"
                    name="startDate"
                    type={"date"}
                   
                    InputLabelProps={{
                      shrink: true,
                    }}
                    onChange={handleStartDate}
                    placeholder="Enter your business address"
                  />
                  <Typography variant="body2" color="error" align="left">
                    {errors.startDate?.message}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InputLabel
                    htmlFor="endDate"
                    required
                    sx={{ fontWeight: "bold" }}
                  >
                    Date your books or accounts end
                  </InputLabel>
                  <TextField
                    required
                    fullWidth
                    id="endDate"
                    name="endDate"
                    type={"date"}
                    InputLabelProps={{
                      shrink: true,
                    }}
                   
                    onChange={handleEndDate}
                    placeholder="Enter your business address"
                  />
                  <Typography variant="body2" color="error" align="left">
                    {errors.endDate?.message}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12}>
                  <InputLabel
                    htmlFor="totalTurnover"
                    required
                    sx={{ fontWeight: "bold" }}
                  >
                    Total turnover
                  </InputLabel>
                  <TextField
                    required
                    fullWidth
                    id="totalTurnover"
                    name="totalTurnover"
                    type={"number"}
                    {...register("totalTurnover")}
                    placeholder="Enter your Total turnover"
                    
                  />
                  <Typography variant="body2" color="error" align="left">
                    {errors.totalTurnover?.message}
                  </Typography>
                </Grid>
                  {monthsList.map((n,i)=>
                    
                   
                    <React.Fragment key={n.month+"-"+n.year}>
                      <Grid item xs={12} sm={2} sx={{ display:"flex",justifyContent:"flex-start",alignItems:"flex-start"}}>
                  <InputLabel
                    htmlFor="payee"
                    required
                    sx={{ fontWeight: "bold", alignSelf:"flex-end", justifySelf:"flex-end"}}
                   
                  >
                    {mL[n.month]}
                  </InputLabel>
                  </Grid>
                  <Grid item xs={12} sm={10}  >

                  <TextField
                    required
                    fullWidth
                    id="monthExpense"
                    name="monthExpense"
                    type={"number"}
                   
                    onChange={(e)=> handleInputMonth(i,e)}
                    placeholder="Enter your expense"
                    
                  />
                  <Typography variant="body2" color="error" align="left">
                    {errors.taxFrom?.message}
                  </Typography>
                </Grid>
                </React.Fragment>
                  )}
                 
                <Grid item xs={12} sm={12}>
                  <InputLabel htmlFor="payee" sx={{ fontWeight: "600" }}>
                    Expenses
                  </InputLabel>
                </Grid>
                <Grid item xs={12} sm={12}>
                  <InputLabel
                    htmlFor="payee"
                    // required
                    // sx={{ fontWeight: "bold" }}
                  >
                    Overall expenses
                  </InputLabel>
                  <TextField
                    
                    fullWidth
                    id="overallExpenses"
                    name="overallExpenses"
                    type={"number"}
                    value={overallexpenseValue}
                    onChange={handleOverallExpenses}
                    placeholder="Enter your overall expenses"
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
                        disabled={overallexpenseValue?true:false}
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
                        disabled={overallexpenseValue?true:false}
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
                          onClick={handleRemoveInput}
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

export default SelfEmployment;
