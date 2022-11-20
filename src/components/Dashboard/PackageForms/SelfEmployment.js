import { yupResolver } from "@hookform/resolvers/yup";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import RemoveIcon from "@mui/icons-material/Remove";
import SaveIcon from "@mui/icons-material/Save";
import {
  Box,
  CircularProgress,
  Container,
  Fab,
  Grid,
  InputLabel,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React, { useEffect, useState } from "react";
import { usePlacesWidget } from "react-google-autocomplete";
import { useForm } from "react-hook-form";
import "react-phone-input-2/lib/material.css";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as Yup from "yup";
import "./SelfEmployment.scss";

import moment from "moment";
import { useCookies } from "react-cookie";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import AutoFillForm from "../../Address/AutoFillForm";
import { getQueryStringParam } from "./Employment";
import UploadFiles from "./UploadFiles";

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
      months.push({ year, month, amount: "0" });
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
        amount: data
          .filter((x) => x.month === mL[month])[0]
          ?.amount.toString()
          .replace(/[^\d.]/g, "")
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          .replace(/(\.\d{1,2}).*/g, "$1") ?? 0,
        id: data.filter((x) => x.month === mL[month])[0]?.id,
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
          amount: data.filter((x) => x.month === month)[0]?.amount,
          id: data.filter((x) => x.month === month)[0]?.id,
        });
      } else {
        months.push({ year, month, amount: "0" });
      }
    }
  }
  return months;
};

const Input = styled("input")({
  display: "none",
});

const SelfEmployment = () => {
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
      amount: "0",
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
    businessName: Yup.string().required("Business name must not be empty."),
    descriptionOfBusiness: Yup.string().required(
      "Description of your business must not be empty."
    ),
    address: Yup.string().required("Business address must not be empty."),
    totalTurnover: Yup.string().required("Total turnover must not be empty"),
  });

  const formOptions = {
    mode: "onChange",
    resolver: yupResolver(validationSchema),
    defaultValues: {
      businessName: "",
      descriptionOfBusiness: "",
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
  const taxYear = cookies?.order?.taxYear
    ? cookies.order.taxYear
    : getQueryStringParam("reference")
    ? getQueryStringParam("reference")
    : 0;

  const postCall = (data) => {
    const response = axiosPrivate.post(
      "https://tax.api.cyberozunu.com/api/SelfEmployment",
      {
        orderId: params.orderId ? params.orderId : cookies.order.oderId,
        name: data.businessName,
        descriptionOfBusiness: data.descriptionOfBusiness,
        address: data.address,
        postalCode: data.postalCode,
        accountingPeriodFrom: startDate,
        accountPeriodTo: endDate,
        totalTurnOver: data.totalTurnover
          ? parseFloat(data.totalTurnover.toString().replace(/\,/g, "")).toFixed(2)
          : 0,
        turnOver: [
          ...monthsList.map((n) => {
            return {
              month: mL[n.month],
              amount: parseFloat(n.amount.toString().replace(/\,/g, "")).toFixed(2),
            };
          }),
        ],
        totalExpenses: overallexpenseValue
          ? parseFloat(overallexpenseValue.toString().replace(/\,/g, "")).toFixed(2)
          : 0,
        expenses:
          expensesList.length === 0
            ? []
            : expensesList.length === 1 && expensesList[0].amount === 0
            ? []
            : [
                ...expensesList.map((n) => {
                  return {
                    description: n.description,
                    amount: parseFloat(n.amount.toString().replace(/\,/g, "")).toFixed(2),
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
      "https://tax.api.cyberozunu.com/api/SelfEmployment",
      {
        id: packageId,
        orderId: params.orderId,
        name: data.businessName,
        descriptionOfBusiness: data.descriptionOfBusiness,
        address: data.address,
        postalCode: data.postalCode,
        accountingPeriodFrom: startDate,
        accountPeriodTo: endDate,
        totalTurnOver: data.totalTurnover
          ? parseFloat(data.totalTurnover.toString().replace(/\,/g, "")).toFixed(2)
          : 0,
        turnOver: [
          ...monthsList.map((n) => {
            return {
              id: n.id,
              month: mL[n.month],
              amount: parseFloat(n.amount.toString().replace(/\,/g, "")).toFixed(2),
            };
          }),
        ],
        totalExpenses: overallexpenseValue
          ? parseFloat(overallexpenseValue.toString().replace(/\,/g, "")).toFixed(2)
          : 0,
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
                    amount: parseFloat(n.amount.toString().replace(/\,/g, "")).toFixed(2),
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

      setUrls([]);
      setOverallexpensesValue("");
      setTotalTurnover("");
      setStartDate("");
      setEndDate("");
      setMonthsList([]);
      if (packageId) {
        navigate(`/edit/${params.orderId}/?reference=${taxYear}`);
      } else {
        if (params.orderId) {
          navigate("/account");
        } else {
          if (cookies.order.selectedPackages.length > 1) {
            const filteredEmployement = cookies.order.selectedPackages.filter(
              (n) => n.package.name === "Self employment"
            );

            filteredEmployement[0].package.recordsAdded = true;

            const filteredOther = cookies.order.selectedPackages.filter(
              (n) =>
                n.package.name !== "Self employment"
            );
            const filtered = filteredOther.filter(
              (n) => n.package.recordsAdded !== true
            );

            setCookie(
              "order",
              {
                oderId: cookies.order.oderId,
                selectedPackages: [...filteredOther, ...filteredEmployement],
                taxYear
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
      toast.success(
        packageId
          ? "Self Employment Details Edited Successfully"
          : "Self Employment Details Saved Successfully"
      );
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
      toast.success("Self Employment Details Saved Successfully");
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
    values[i]["amount"] = value
      .replace(/[^\d.]/g, "")
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      .replace(/(\.\d{1,2}).*/g, "$1");
    setMonthsList(values);
    if (value) {
      setTotalTurnover(
        values
          .reduce(
            (acc, curr) =>
              acc +
              (isNaN(curr.amount.replace(/\,/g, ""))
                ? 0
                : parseFloat(curr.amount.replace(/\,/g, ""))),
            0
          )
          .toFixed(2)
      );
      setValue(
        "totalTurnover",
        values
          .reduce(
            (acc, curr) =>
              acc +
              (isNaN(curr.amount.replace(/\,/g, ""))
                ? 0
                : parseFloat(curr.amount.replace(/\,/g, ""))),
            0
          )
          .toFixed(2)
      );
    }else {
      const filtered = values.filter((a, key) => key === i);
      const other = values.filter((a, key) => key !== i);
      setTotalTurnover(
        parseFloat(
          [
            ...other,
            { amount: 0, description: filtered[0].description },
          ].reduce(
            (acc, curr) =>
              acc +
              (curr.amount
                ? isNaN(curr.amount.replace(/\,/g, ""))
                  ? 0
                  : parseFloat(curr.amount.replace(/\,/g, ""))
                : 0),
            0
          )
        ).toFixed(2)
      );
      setValue(
        "totalTurnover",
        parseFloat(
          [
            ...other,
            { amount: 0, description: filtered[0].description },
          ].reduce(
            (acc, curr) =>
              acc +
              (curr.amount
                ? isNaN(curr.amount.replace(/\,/g, ""))
                  ? 0
                  : parseFloat(curr.amount.replace(/\,/g, ""))
                : 0),
            0
          )
        ).toFixed(2)
      );
    }
  };

  function handleChangeInput(i, event) {
    const values = [...expensesList];
    const { name, value } = event.target;
    if (name === "description") {
      values[i][name] = value;
    } else {
      values[i][name] = value
        .replace(/[^\d.]/g, "")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        .replace(/(\.\d{1,2}).*/g, "$1");
    }

    setExpensesList(values);
    if (value) {
      setOverallexpenses(true);

      setOverallexpensesValue(
        parseFloat(
          values.reduce(
            (acc, curr) =>
              acc +
              (curr.amount
                ? isNaN(curr.amount.replace(/\,/g, ""))
                  ? 0
                  : parseFloat(curr.amount.replace(/\,/g, ""))
                : 0),
            0
          )
        ).toFixed(2)
      );
    } else {
      const filtered = values.filter((a, key) => key === i);
      const other = values.filter((a, key) => key !== i);
      setOverallexpensesValue(
        parseFloat(
          [
            ...other,
            { amount: 0, description: filtered[0].description },
          ].reduce(
            (acc, curr) =>
              acc +
              (curr.amount
                ? isNaN(curr.amount.replace(/\,/g, ""))
                  ? 0
                  : parseFloat(curr.amount.replace(/\,/g, ""))
                : 0),
            0
          )
        ).toFixed(2)
      );
      setOverallexpenses(false);
    }
  }

  function handleAddInput() {
    const values = [...expensesList];
    values.push({
      description: "",
      amount: "0",
    });
    setExpensesList(values);
    setOverallexpensesValue(
      parseFloat(
        values.reduce(
          (acc, curr) =>
            acc +
            (curr.amount
              ? isNaN(curr.amount.replace(/\,/g, ""))
                ? 0
                : parseFloat(curr.amount.replace(/\,/g, ""))
              : 0),
          0
        )
      ).toFixed(2)
    );
  }

  function handleRemoveInput(i) {
    if (packageId) {
      const values = [...expensesList];
      const filtered = values.filter((a, key) => key === i);
      const other = values.filter((a, key) => key !== i);
      values.splice(i, 1);
      setExpensesList([
        ...other,
        { amount: "0", description: "", id: filtered[0]?.id },
      ]);
      setOverallexpensesValue(
        parseFloat(
          values.reduce(
            (acc, curr) =>
              acc +
              (curr.amount
                ? isNaN(curr.amount.replace(/\,/g, ""))
                  ? 0
                  : parseFloat(curr.amount.replace(/\,/g, ""))
                : 0),
            0
          )
        ).toFixed(2)
      );
      return;
    }
    const values = [...expensesList];
    values.splice(i, 1);
    setExpensesList(values);
    setOverallexpensesValue(
      parseFloat(
        values.reduce(
          (acc, curr) =>
            acc +
            (curr.amount
              ? isNaN(curr.amount.replace(/\,/g, ""))
                ? 0
                : parseFloat(curr.amount.replace(/\,/g, ""))
              : 0),
          0
        )
      ).toFixed(2)
    );
  }

  const handleOverallExpenses = (e) => {
    if (e.target.value === "") {
      setOverallexpensesValue(e.target.value);
    } else {
      setOverallexpensesValue(
        (e.target.value = e.target.value
          .replace(/[^\d.]/g, "")
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          .replace(/(\.\d{1,2}).*/g, "$1"))
      );
    }

    if (e.target.value) {
      setExpenseListHide(true);
    } else {
      setExpenseListHide(false);
    }
  };

  const handleStartDate = (e) => {
    const date = new Date(e.target.value);
    const selectedYear = date.getFullYear();
    if (
      !(
        date.getFullYear() === parseInt(taxYear) ||
        date.getFullYear() === parseInt(taxYear) - 1
      )
    ) {
      toast.error(
        `You could only select dates between selected Tax Year ${taxYear}`
      );
      return;
    } else if (endDate) {
      if (new Date(endDate).getFullYear() === selectedYear) {
        if (new Date(endDate).getMonth() < date.getMonth()) {
          toast.error(`Start date should be smaller than end date`);
          return;
        }else if (new Date(endDate).getMonth() === date.getMonth()) {
          if (new Date(endDate).getDate() < date.getDate()) {
            toast.error(`Start date should be smaller than end date`);
            return;
          }
        }
      } 
    }

    setStartDate(e.target.value);
    if (packageId && endDate) {
      setMonthsList(
        getMonthsWithDataAdd(
          new Date(e.target.value),
          new Date(endDate),
          monthsList
        )
      );
    } else if(endDate) {
      setMonthsList(getMonths(new Date(e.target.value), new Date(endDate)));
    }
  };

  const handleEndDate = (e) => {
    const date = new Date(e.target.value);
    const selectedYear = date.getFullYear();
    if (!startDate) {
      toast.warn(`Please select start date first`);
      return;
    } else if (selectedYear !== parseInt(taxYear)) {
      toast.error(
        `You could only select dates between selected Tax Year ${taxYear}`
      );
      return;
    } else if (new Date(startDate).getFullYear() === selectedYear) {
      if (new Date(startDate).getMonth() > date.getMonth()) {
        toast.error(`End date should be greater than start date`);
        return;
      }else if (new Date(startDate).getMonth() === date.getMonth()) {
        if (new Date(startDate).getDate() > date.getDate()) {
          toast.error(`End date should be greater than start date`);
          return;
        }
      }
    } 
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
    // setAddress(value);
    setValue("address", JSON.stringify(value));
  };
  const handleTotalTurnover = (e) => {
    if (e.target.value === "") {
      setValue(
        "totalTurnover",
        e.target.value
      );
      setTotalTurnover(e.target.value)
      
    }else{
      setValue(
        "totalTurnover",
        (e.target.value = e.target.value
          .replace(/[^\d.]/g, "")
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          .replace(/(\.\d{1,2}).*/g, "$1"))
      );
      setTotalTurnover(
        (e.target.value = e.target.value
          .replace(/[^\d.]/g, "")
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          .replace(/(\.\d{1,2}).*/g, "$1"))
      );
    }
    
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
        `https://tax.api.cyberozunu.com/api/SelfEmployment/${packageId}`
      );
      const fields = [
        "businessName",
        "descriptionOfBusiness",
        "address",
        "totalTurnover",
      ];

      const packages = {
        businessName: response.data.result.name,
        descriptionOfBusiness: response.data.result.descriptionOfBusiness,
        address: response.data.result.address,
        totalTurnover: response.data.result.totalTurnOver
          .toString()
          .replace(/[^\d.]/g, "")
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          .replace(/(\.\d{1,2}).*/g, "$1"),
      };

      setTotalTurnover(
        response.data.result.totalTurnOver
          .toString()
          .replace(/[^\d.]/g, "")
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          .replace(/(\.\d{1,2}).*/g, "$1")
      );
      fields.forEach((field) => setValue(field, packages[field]));
      setAddress(JSON.parse(response.data.result.address));
      if (response.data.result.expenses.length > 0) {
        setExpensesList([
          ...response.data.result.expenses.map((n) => {
            return {
              id: n.id,
              description: n.description,
              amount: n.amount
                .toString()
                .replace(/[^\d.]/g, "")
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                .replace(/(\.\d{1,2}).*/g, "$1"),
            };
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
      if(response.data.result.turnOver.length){
        setMonthsList(
          getMonthsWithData(
            new Date(response.data.result.accountingPeriodFrom),
            new Date(response.data.result.accountPeriodTo),
            response.data.result.turnOver
          )
        );
      }
      

      if (
        response?.data?.result?.attachments &&
        response?.data?.result?.attachments.length > 0
      ) {
        setUrls([
          ...response.data.result.attachments.map((n) => {
            return { url: n.url, id: n.id };
          }),
        ]);
      }

      setOverallexpensesValue(
        response.data.result.totalExpenses
          .toString()
          .replace(/[^\d.]/g, "")
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          .replace(/(\.\d{1,2}).*/g, "$1")
      );
      setLoading(false);
    } catch (err) {
      // console.log(err);
      setLoading(false);
      console.log(err);
    }
  };

  return (
    <div className="SelfEmployment">
      {isLoading ? (
        <CircularProgress />
      ) : (
        <form>
          <Container component="main" maxWidth="lg">
            <div className="heading-form">
              <div className="back-button" onClick={() => navigate(-1)}>
                <ArrowBackIosNewIcon className="back-icon" />
                <h5 className="title is-5">Back</h5>
              </div>
              <h5 className="title is-5">
                {taxYear ? `Tax Year ${taxYear-1}-${taxYear}` : ""}
              </h5>
              <div> </div>
            </div>
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
                      value={startDate}
                      onChange={handleStartDate}
                      onKeyDown={(e) => e.preventDefault()}
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
                      value={endDate}
                      onChange={handleEndDate}
                      onKeyDown={(e) => e.preventDefault()}
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
                      value={totalTurnover}
                      // {...register("totalTurnover")}
                      onChange={handleTotalTurnover}
                      placeholder="Enter your Total turnover"
                    />
                    <Typography variant="body2" color="error" align="left">
                      {errors.totalTurnover?.message}
                    </Typography>
                  </Grid>
                  {monthsList.map((n, i) => (
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
                          fullWidth
                          id="monthExpense"
                          name="monthExpense"
                          value={n.amount}
                          onChange={(e) => handleInputMonth(i, e)}
                          placeholder="Enter your turnover"
                        />
                        <Typography variant="body2" color="error" align="left">
                          {errors.taxFrom?.message}
                        </Typography>
                      </Grid>
                    </React.Fragment>
                  ))}

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
                    <UploadFiles handleUpload={handleUpload} taxYear={taxYear}/>

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
                disabled={isLoading}
              >
                <SaveIcon />
                {isLoading ? "Submitting" : "Edit"}
              </button>
            ) : (
              <>
                <button
                  className="button is-warning"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isLoading}
                >
                  <SaveIcon />
                  {isLoading ? "Submitting" : "Save"}
                </button>

                <button
                  className="button is-success"
                  onClick={handleSubmit(onSubmitAndAddAnother)}
                  disabled={isLoading}
                >
                  <SaveIcon />
                  {isLoading ? "Submitting" : "Save and Add another"}
                </button>
              </>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default SelfEmployment;
