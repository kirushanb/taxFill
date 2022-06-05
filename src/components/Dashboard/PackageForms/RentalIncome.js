import React, { useEffect, useState } from "react";
import "./RentalIncome.scss";
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

const RentalIncome = () => {
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
      description: "",
      amount: 0,
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
      //console.log(place);
    },
  });

  const validationSchema = Yup.object().shape({
    propertyName: Yup.string().required("Property name must not be empty."),
    address: Yup.string().required("Business address must not be empty."),
    totalTurnover: Yup.string().required("Rental income must not be empty"),
  });

  const formOptions = {
    mode: "onChange",
    resolver: yupResolver(validationSchema),
    defaultValues: {
      propertyName: "",
      address: "",
      totalTurnover: "",
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
      'https://tax.api.cyberozunu.com/api/v1.1/RentalIncome',
      {
        orderId: params.orderId ? params.orderId : cookies.order.oderId,
        propertyName: data.propertyName,
        address: JSON.stringify(address ?? {}),
        rentalIncome: data.totalTurnover ? parseInt(data.totalTurnover) : 0,
        totalExpenses: overallexpenseValue ? parseInt(overallexpenseValue) : 0,
        expenses:
          expensesList.length === 0
            ? []
            : expensesList.length === 1 && expensesList[0].amount === 0
            ? []
            : [
                ...expensesList.map((n) => {
                  return {
                    description: n.description,
                    amount: parseInt(n.amount),
                  };
                }),
              ],
        attachments: [
          ...urls.map((n) => {
            return { url: n };
          }),
        ],
      }
    );

    return response;
  };

  const putCall = (data) => {
    const response = axiosPrivate.put(
      'https://tax.api.cyberozunu.com/api/v1.1/RentalIncome',
      {
        id: packageId,
        orderId: params.orderId ? params.orderId : cookies.order.oderId,
        propertyName: data.propertyName,
        address: JSON.stringify(address ?? {}),
        rentalIncome: data.totalTurnover ? parseInt(data.totalTurnover) : 0,
        totalExpenses: overallexpenseValue ? parseInt(overallexpenseValue) : 0,
        expenses:
          expensesList.length === 0
            ? []
            : expensesList.length === 1 && expensesList[0].amount === 0
            ? []
            : [
                ...expensesList.map((n) => {
                  return {
                    id: n.id,
                    description: n.description,
                    amount: parseInt(n.amount),
                  };
                }),
              ],
        attachments: [
          ...urls.map((n) => {
            return { id: n.id, url: n.url };
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
      setExpensesList([{ description: "", amount: "" }]);
      setAddress("");
      setLoading(false);
      toast.success(
        packageId
          ? "Rental Income Details Edited Successfully"
          : "Rental Income Details Saved Successfully"
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
              (n) => n.package.name === "Rental Income"
            );

            filteredEmployement[0].package.recordsAdded = true;

            const filteredOther = cookies.order.selectedPackages.filter(
              (n) => n.package.name !== "Rental Income"
            );
            const filtered = filteredOther.filter(
              (n) => n.package.recordsAdded !== true
            );

            setCookie(
              "order",
              {
                oderId: cookies.order.oderId,
                selectedPackages: [ ...filteredOther, ...filteredEmployement ],
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
      setExpensesList([{ description: "", amount: "" }]);
      setLoading(false);
      toast.success("Rental Income Details Saved Successfully");
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
    if (value) {
      setOverallexpenses(true);

      setOverallexpensesValue(
        values.reduce((acc, curr) => acc + parseInt(curr.amount), 0)
      );
    } else {
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
    setOverallexpensesValue(
      expensesList.reduce((acc, curr) => acc + parseInt(curr.amount), 0)
    );
  }

  function handleRemoveInput(i) {
    const values = [...expensesList];
    values.splice(i, 1);
    setExpensesList(values);
    setOverallexpensesValue(
      values.reduce((acc, curr) => acc + parseInt(curr.amount), 0)
    );
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
        `https://tax.api.cyberozunu.com/api/v1.1/RentalIncome/${packageId}`
      );
      const fields = [
        "propertyName",
        "address",
        "totalTurnover",
      ];

      const packages = {
        propertyName: response.data.result.propertyName,
        address: response.data.result.address,
        totalTurnover: response.data.result.rentalIncome,
      };

      setTotalTurnover(response.data.result.rentalIncome);
      fields.forEach((field) => setValue(field, packages[field]));
      setAddress(JSON.parse(response.data.result.address));
      if (response.data.result.expenses.length > 0) {
        setExpensesList([
          ...response.data.result.expenses.map((n) => {
            return { id: n.id, description: n.description, amount: n.amount };
          }),
        ]);
      } else {
        setExpensesList([{ description: "", amount: 0 }]);
      }

      setStartDate(
        moment(response.data.result.accountingPeriodFrom).format("YYYY-MM-DD")
      );
      setEndDate(
        moment(response.data.result.accountPeriodTo).format("YYYY-MM-DD")
      );
      setMonthsList(
        getMonthsWithData(
          new Date(response.data.result.accountingPeriodFrom),
          new Date(response.data.result.accountPeriodTo),
          response.data.result.turnOver
        )
      );

      if (response.data.result?.attachments?.length > 0) {
        setUrls([
          ...response.data.result.attachments.map((n) => {
            return { url: n.url, id: n.id };
          }),
        ]);
      }

      setOverallexpensesValue(response.data.result.totalExpenses);
    } catch (err) {
      // console.log(err);
      setLoading(false);
    }
    setLoading(false);
  };

  return (
    <div className="RentalIncome">
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
              <p className="title is-3">Rental Income</p>
              <Box sx={{ mt: 1 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={12}>
                    <InputLabel
                      htmlFor="propertyName"
                      required
                      sx={{ fontWeight: "bold" }}
                    >
                      Property Name
                    </InputLabel>
                    <TextField
                      name="propertyName"
                      required
                      fullWidth
                      id="propertyName"
                      //   label="Enter your employer name"
                      placeholder="Enter your property name"
                      autoFocus
                      error={errors.propertyName?.message}
                      {...register("propertyName")}
                    />

                    <Typography variant="body2" color="error" align="left">
                      {errors.propertyName?.message}
                    </Typography>
                  </Grid>

                  {/* <Grid item xs={12} sm={6}>
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
                  </Grid> */}
                  <Grid item xs={12} sm={6}>
                    <InputLabel
                      htmlFor="address"
                      required
                      sx={{ fontWeight: "bold" }}
                    >
                      Address
                    </InputLabel>
                    {/* <TextField
                    required
                    fullWidth
                    multiline
                    maxRows={4}
                    id="address"
                    name="address"
                    {...register("address")}
                    placeholder="Enter your business address"
                  /> */}
                    <AutoFillForm
                      handleAddress={handleAddress}
                      addressComingFrom={address}
                    />
                    <Typography variant="body2" color="error" align="left">
                      {errors.address?.message}
                    </Typography>
                  </Grid>
                  {/* <Grid item xs={12} sm={12}>
                    <InputLabel htmlFor="payee" sx={{ fontWeight: "600" }}>
                      Accounting period
                    </InputLabel>
                  </Grid> */}

                  {/* <Grid item xs={12} sm={6}>
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
                      value={startDate}
                      onChange={handleStartDate}
                      placeholder="Enter your business address"
                    />
                    <Typography variant="body2" color="error" align="left">
                      {errors.startDate?.message}
                    </Typography>
                  </Grid> */}
                  {/* <Grid item xs={12} sm={6}>
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
                      value={endDate}
                      onChange={handleEndDate}
                      placeholder="Enter your business address"
                    />
                    <Typography variant="body2" color="error" align="left">
                      {errors.endDate?.message}
                    </Typography>
                  </Grid> */}
                  <Grid item xs={12} sm={12}>
                    <InputLabel
                      htmlFor="totalTurnover"
                      required
                      sx={{ fontWeight: "bold" }}
                    >
                      Rental Income
                    </InputLabel>
                    <TextField
                      required
                      fullWidth
                      id="totalTurnover"
                      name="totalTurnover"
                      type={"number"}
                      value={totalTurnover}
                      // {...register("totalTurnover")}
                      onChange={handleTotalTurnover}
                      placeholder="Enter your rental income"
                    />
                    <Typography variant="body2" color="error" align="left">
                      {errors.totalTurnover?.message}
                    </Typography>
                  </Grid>
                  {/* {monthsList.map((n, i) => (
                    <React.Fragment key={n.month + "-" + n.year}>
                      <Grid
                        item
                        xs={12}
                        sm={2}
                        sx={{
                          display: "flex",
                          justifyContent: "flex-start",
                          alignItems: "flex-start",
                        }}
                      >
                        <InputLabel
                          htmlFor="payee"
                          required
                          sx={{
                            fontWeight: "bold",
                            alignSelf: "flex-end",
                            justifySelf: "flex-end",
                          }}
                        >
                          {mL[n.month]}
                        </InputLabel>
                      </Grid>
                      <Grid item xs={12} sm={10}>
                        <TextField
                          required
                          fullWidth
                          id="monthExpense"
                          name="monthExpense"
                          type={"number"}
                          value={n.amount}
                          onChange={(e) => handleInputMonth(i, e)}
                          placeholder="Enter your expense"
                        />
                        <Typography variant="body2" color="error" align="left">
                          {errors.taxFrom?.message}
                        </Typography>
                      </Grid>
                    </React.Fragment>
                  ))} */}

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
                    <React.Fragment key={field + "-" + idx}>
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
                  <Grid item xs={12} sm={12}>
                    <UploadFiles handleUpload={handleUpload} />
                    {packageId && (
                      <>
                        <ol style={{ padding: "1rem" }}>
                          {urls.map((n) => (
                            <li key={n.id}>
                              <a target={"_blank"} href={n.url}>
                                {n.url}
                              </a>
                            </li>
                          ))}
                        </ol>
                      </>
                    )}
                  </Grid>
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

export default RentalIncome;
