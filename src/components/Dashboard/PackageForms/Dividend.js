import React, { useEffect, useState } from "react";
import "./Dividend.scss";
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
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
import AutoFillForm from "../../Address/AutoFillForm";
import { getQueryStringParam } from "./Employment";
import moment from "moment";

const mL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const mS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "June",
  "July",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];

const getMonths = (fromDate, toDate) => {
  const fromYear = fromDate.getFullYear();
  const fromMonth = fromDate.getMonth();
  const toYear = toDate.getFullYear();
  const toMonth = toDate.getMonth();
  const months = [];
  for (let year = fromYear; year <= toYear; year++) {
    let month = year === fromYear ? fromMonth : 0;
    const monthLimit = year === toYear ? toMonth : 11;
    for (; month <= monthLimit; month++) {
      months.push({ year, month, amount: "" });
    }
  }
  console.log(months);
  return months;
};

export const getMonthsWithData = (fromDate, toDate, data) => {
  const fromYear = fromDate.getFullYear();
  const fromMonth = fromDate.getMonth();
  const toYear = toDate.getFullYear();
  const toMonth = toDate.getMonth();
  const months = [];
  for (let year = fromYear; year <= toYear; year++) {
    let month = year === fromYear ? fromMonth : 0;
    const monthLimit = year === toYear ? toMonth : 11;
    for (; month <= monthLimit; month++) {
      months.push({
        year,
        month,
        amount: data.filter((x) => x.month === mL[month])[0].amount,
        id: data.filter((x) => x.month === mL[month])[0].id,
      });
    }
  }
  return months;
};

export const getMonthsWithDataAdd = (fromDate, toDate, data) => {
  const fromYear = fromDate.getFullYear();
  const fromMonth = fromDate.getMonth();
  const toYear = toDate.getFullYear();
  const toMonth = toDate.getMonth();
  const months = [];
  for (let year = fromYear; year <= toYear; year++) {
    let month = year === fromYear ? fromMonth : 0;
    const monthLimit = year === toYear ? toMonth : 11;
    for (; month <= monthLimit; month++) {
      if (data.filter((x) => x.month === month)[0]) {
        months.push({
          year,
          month,
          amount: data.filter((x) => x.month === month)[0].amount,
          id: data.filter((x) => x.month === month)[0].id,
        });
      } else {
        months.push({ year, month, amount: "" });
      }
    }
  }
  return months;
};

const Input = styled("input")({
  display: "none",
});

const Dividend = () => {
  let navigate = useNavigate();

  const [overallexpenses, setOverallexpenses] = React.useState(false);
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [monthsList, setMonthsList] = React.useState([]);
  const axiosPrivate = useAxiosPrivate();
  const [expenseListHide, setExpenseListHide] = React.useState(false);
  const [expensesList, setExpensesList] = React.useState([
    {
      companyName: "",
      noOfShares: 0,
      dividend: 0,
      receivedDate: "",
      dividentIncome:"",
    },
  ]);
  const [totalTurnover, setTotalTurnover] = React.useState("");
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

  const validationSchema = Yup.object();

  const formOptions = {
    mode: "onChange",
    resolver: yupResolver(validationSchema),
    defaultValues: {
     
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

  const packageId = getQueryStringParam("packageId");

  const postCall = (data) => {
    const response = axiosPrivate.post(
      'https://tax.api.cyberozunu.com/api/v1.1/Dividend',
      {
        orderId: params.orderId ? params.orderId : cookies.order.oderId,

        details:
          expensesList.length === 0
            ? []
            : expensesList.length === 1 && expensesList[0].companyName === ""
            ? []
            : [
                ...expensesList.map((n) => {
                  return {
                    companyName: n.companyName,
                    noOfShares: parseInt(n.noOfShares),
                    dividend: parseInt(n.dividend),
                    receivedDate: n.receivedDate,
                    dividentIncome:  n.dividentIncome.toString()
                  };
                }),
              ],
      }
    );

    return response;
  };

  const putCall = (data) => {
    const response = axiosPrivate.put(
      'https://tax.api.cyberozunu.com/api/v1.1/Dividend',
      {
        id: packageId,
        orderId: params.orderId ? params.orderId : cookies.order.oderId,
        details:
        expensesList.length === 0
          ? []
          : expensesList.length === 1 && expensesList[0].companyName === ""
          ? []
          : [
              ...expensesList.map((n) => {
                return {
                  id:n.id,
                  companyName: n.companyName,
                  noOfShares: parseInt(n.noOfShares),
                  dividend: parseInt(n.dividend),
                  receivedDate: n.receivedDate,
                  dividentIncome: n.dividentIncome.toString()
                };
              }),
            ],
        
      }
    );

    return response;
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = packageId ? await putCall(data) : await postCall(data);

      setLoading(false);
      reset();
      setExpensesList([{
        companyName: "",
        noOfShares: 0,
        dividend: 0,
        receivedDate: "",
        dividentIncome:"",
      },]);
      setAddress("");
      setLoading(false);
      toast.success(
        packageId
          ? "Dividend Details Edited Successfully"
          : "Dividend Details Saved Successfully"
      );
      setUrls([]);
      setOverallexpensesValue("");
      setTotalTurnover("");
      setStartDate("");
      setEndDate("");
      setMonthsList([]);
      if (packageId) {
        navigate("/account");
      } else {
        if (params.orderId) {
          navigate("/account");
        } else {
          if (cookies.order.selectedPackages.length > 1) {
            const filteredEmployement = cookies.order.selectedPackages.filter(
              (n) => n.package.name === "Dividend"
            );

            filteredEmployement[0].package.recordsAdded = true;

            const filteredOther = cookies.order.selectedPackages.filter(
              (n) => n.package.name !== "Dividend"
            );
            const filtered = filteredOther.filter(
              (n) => n.package.recordsAdded === false
            );

            setCookie(
              "order",
              {
                oderId: cookies.order.oderId,
                selectedPackages: { ...filteredOther, ...filteredEmployement },
              },
              {
                path: "/",
              }
            );

            if (filtered.length > 0) {
              navigate(
                `/${filtered[0].package.name.toLowerCase().replace(/\s/g, "")}`
              );
            } else {
              navigate("/account");
            }
          } else {
            navigate("/account");
          }
        }
      }
    } catch (err) {
      setLoading(false);
      toast.error(err);
    }
  };

  const onSubmitAndAddAnother = async (data) => {
    setLoading(true);

    try {
      const response = await postCall(data);

      reset();
      setExpensesList([{
        companyName: "",
        noOfShares: 0,
        dividend: 0,
        receivedDate: "",
        dividentIncome:"",
      },]);
      setLoading(false);
      toast.success("Dividend Details Saved Successfully");
      setUrls([]);
      setAddress("");
      setOverallexpensesValue("");
      setTotalTurnover("");
      setStartDate("");
      setEndDate("");
      setMonthsList([]);
    } catch (err) {
      setLoading(false);
      toast.error(err);
    }
  };

  const handleInputMonth = (i, event) => {
    const values = [...monthsList];
    const { name, value } = event.target;
    values[i]["amount"] = value;
    setMonthsList(values);
    if (value) {
      setTotalTurnover(
        values.reduce((acc, curr) => acc + parseInt(curr.amount), 0)
      );
      setValue(
        "totalTurnover",
        values.reduce((acc, curr) => acc + parseInt(curr.amount), 0)
      );
    }
  };

  function handleChangeInput(i, event) {
    const values = [...expensesList];
    const { name, value } = event.target;
    values[i][name] = value;
    setExpensesList(values);
    
  }

  function handleAddInput() {
    const values = [...expensesList];
    values.push({
      description: "",
      amount: 0,
    });
    setExpensesList(values);
    
  }

  function handleRemoveInput(i) {
    const values = [...expensesList];
    values.splice(i, 1);
    setExpensesList(values);
   
  }

  const handleOverallExpenses = (e) => {
    setOverallexpensesValue(e.target.value);
    if (e.target.value) {
      setExpenseListHide(true);
    } else {
      setExpenseListHide(false);
    }
  };

  const handleStartDate = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDate = (e) => {
    setEndDate(e.target.value);
    if (packageId) {
      setMonthsList(
        getMonthsWithDataAdd(
          new Date(startDate),
          new Date(e.target.value),
          monthsList
        )
      );
    } else {
      setMonthsList(getMonths(new Date(startDate), new Date(e.target.value)));
    }
  };

  const handleUpload = (urlsComming) => {
    if (packageId) {
      setUrls([
        ...urls,
        ...urlsComming.map((n) => {
          return { url: n };
        }),
      ]);
    } else {
      setUrls(urlsComming);
    }
  };

  const handleAddress = (value) => {
    setAddress(value);
    setValue("address", JSON.stringify(value));
  };
  const handleTotalTurnover = (e) => {
    setValue("totalTurnover", e.target.value);
    setTotalTurnover(e.target.value);
  };

  useEffect(() => {
    if (packageId) {
      // get user and set form fields
      getPackage(packageId);
    }
  }, [packageId]);

  const getPackage = async (packageId) => {
    setLoading(true);
    try {
      const response = await axiosPrivate.get(
        `https://tax.api.cyberozunu.com/api/v1.1/Dividend/${packageId}`
      );
      
      if (response.data.result.details.length > 0) {
        setExpensesList([
          ...response.data.result.details.map((n) => {
            return { id: n.id, companyName: n.companyName, noOfShares: n.noOfShares, dividend:n.dividend, receivedDate:n.receivedDate,dividentIncome:n.dividentIncome };
          }),
        ]);
      } else {
        setExpensesList([{
          companyName: "",
          noOfShares: 0,
          dividend: 0,
          receivedDate: "",
          dividentIncome:"",
        },]);
      }

      
    } catch (err) {
      // console.log(err);
      setLoading(false);
    }
    setLoading(false);
  };

  return (
    <div className="Dividend">
      {isLoading ? (
        <CircularProgress />
      ) : (
        <form>
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
              <p className="title is-3">Dividend</p>
              <Box sx={{ mt: 1 }}>
                <Grid container spacing={3}>
                  

                 

                  
                 
                  {expensesList.map((field, idx) => (
                    <React.Fragment key={field + "-" + idx}>
                      <Grid item xs={11} sm={11}>
                        <InputLabel htmlFor="payee" required>
                          Company Name
                        </InputLabel>
                        <TextField
                          required
                          fullWidth
                          id="companyName"
                          name="companyName"
                          value={field.companyName}
                          // {...register("description")}
                          onChange={(e) => handleChangeInput(idx, e)}
                          placeholder="Company Name"
                        />
                       
                      </Grid>
                      <Grid item xs={11} sm={11}>
                        <InputLabel htmlFor="payee" required>
                        No Of Shares
                        </InputLabel>
                        <TextField
                          required
                          fullWidth
                          id="noOfShares"
                          name="noOfShares"
                          value={field.noOfShares}
                          type="number"
                          onChange={(e) => handleChangeInput(idx, e)}
                          placeholder="No Of Shares"
                        />
                       
                      </Grid>
                      <Grid item xs={11} sm={11}>
                        <InputLabel htmlFor="payee" required>
                        Dividend
                        </InputLabel>
                        <TextField
                          required
                          fullWidth
                          id="dividend"
                          name="dividend"
                          value={field.dividend}
                          type="number"
                          onChange={(e) => handleChangeInput(idx, e)}
                          placeholder="Dividend"
                        />
                       
                      </Grid>
                      <Grid item xs={11} sm={11}>
                        <InputLabel htmlFor="payee" required>
                        Received Date
                        </InputLabel>
                        <TextField
                          required
                          fullWidth
                          id="receivedDate"
                          name="receivedDate"
                          value={field.receivedDate}
                          type="datetime-local"
                          onChange={(e) => handleChangeInput(idx, e)}
                          placeholder="Received Date"
                        />
                       
                      </Grid>
                      <Grid item xs={11} sm={11}>
                        <InputLabel htmlFor="payee" required>
                        Divident Income
                        </InputLabel>
                        <TextField
                          required
                          fullWidth
                          id="dividentIncome"
                          name="dividentIncome"
                          value={field.dividentIncome}
                          onChange={(e) => handleChangeInput(idx, e)}
                          placeholder="Divident Income"
                        />
                       
                      </Grid>
                      <Grid item xs={12} sm={1}>
                        {idx === 0 ? (
                          <Fab
                            onClick={handleAddInput}
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
                            onClick={() => handleRemoveInput(idx)}
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
                  
                </Grid>
              </Box>
            </Box>
          </Container>

          <div className="footer-save-button">
            {packageId ? (
              <button
                className="button is-warning"
                onClick={handleSubmit(onSubmit)}
              >
                <SaveIcon />
                Edit
              </button>
            ) : (
              <>
                <button
                  className="button is-warning"
                  onClick={handleSubmit(onSubmit)}
                >
                  <SaveIcon />
                  Save
                </button>

                <button
                  className="button is-success"
                  onClick={handleSubmit(onSubmitAndAddAnother)}
                >
                  <SaveIcon />
                  Save and Add another
                </button>
              </>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default Dividend;
