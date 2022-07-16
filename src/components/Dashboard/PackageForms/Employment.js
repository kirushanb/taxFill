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
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React, { useCallback, useEffect, useState } from "react";
// import { usePlacesWidget } from "react-google-autocomplete";
import { useForm } from "react-hook-form";
import "react-phone-input-2/lib/material.css";
import { useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";
import "./Employment.scss";

import { useCookies } from "react-cookie";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import UploadFiles from "./UploadFiles";

export function getQueryStringParam(paramName) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(paramName);
}

const Employment = () => {
  let navigate = useNavigate();
  const [overallexpenseValue, setOverallexpensesValue] = React.useState("");

  const [urls, setUrls] = useState([]);

  const [overallexpenses, setOverallexpenses] = React.useState(false);
  const [expenseListHide, setExpenseListHide] = React.useState(false);

  const axiosPrivate = useAxiosPrivate();
  const [isLoading, setLoading] = React.useState(false);
  const [expensesList, setExpensesList] = React.useState([
    {
      description: "",
      amount: 0,
    },
  ]);
  const params = useParams();
  const [cookies, setCookie] = useCookies();
  // const { ref, autocompleteRef } = usePlacesWidget({
  //   apiKey: "YOUR_GOOGLE_MAPS_API_KEY",
  //   onPlaceSelected: (place) => {
  //     // console.log(place);
  //   },
  // });

  const validationSchema = Yup.object().shape({
    employerName: Yup.string().required("Employer name must not be empty."),
    payee: Yup.string().required("Payee Ref Number must not be empty."),
    incomeFrom: Yup.string().required("Income from P60/P45 must not be empty."),
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
    // trigger,
    // getValues,
  } = useForm(formOptions);
  const { errors } = formState;

  const packageId = getQueryStringParam("packageId");

  const postCall = (data) => {
    const response = axiosPrivate.post("/EmploymentDetail", {
      orderId: params.orderId ? params.orderId : cookies.order.oderId,
      name: data.employerName,
      paye: data.payee,
      incomeFromP60_P45: data.incomeFrom,
      taxFromP60_P45: data.taxFrom,
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
    });

    return response;
  };

  const putCall = (data) => {
    const response = axiosPrivate.put("/EmploymentDetail", {
      id: packageId,
      orderId: params.orderId,
      name: data.employerName,
      paye: data.payee,
      incomeFromP60_P45: data.incomeFrom,
      taxFromP60_P45: data.taxFrom,
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
    });

    return response;
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      packageId ? await putCall(data) : await postCall(data);

      setLoading(false);

      reset();
      setExpensesList([{ description: "", amount: 0 }]);
      setLoading(false);
      setUrls([]);
      setOverallexpensesValue("");
      if (packageId) {
        navigate(`/edit/${params.orderId}`);
      } else {
        if (params.orderId) {
          navigate("/account");
        } else {
          if (cookies.order.selectedPackages.length > 1) {
            const filteredEmployement = cookies.order.selectedPackages.filter(
              (n) => n.package.name === "Employment"
            );

            filteredEmployement[0].package.recordsAdded = true;

            const filteredOther = cookies.order.selectedPackages.filter(
              (n) =>
                n.package.name !== "Employment" &&
                n.package.name !== "Capital gain"
            );
            const filtered = filteredOther.filter(
              (n) => n.package.recordsAdded !== true
            );

            setCookie(
              "order",
              {
                oderId: cookies.order.oderId,
                selectedPackages: [...filteredOther, ...filteredEmployement],
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
      toast.success(packageId?"Employment Details Edited Successfully":"Employment Details Saved Successfully");
    } catch (err) {
      setLoading(false);
      toast.error(err);
    }

  };

  const onSubmitAndAddAnother = async (data) => {
    setLoading(true);
    try {
      await postCall(data);

      reset();
      setExpensesList([{ description: "", amount: 0 }]);
      setLoading(false);
      toast.success("Employment Details Saved Successfully");
      setUrls([]);
      setOverallexpensesValue("");
    } catch (err) {
      setLoading(false);
      toast.error(err);
    }
  };

  function handleChangeInput(i, event) {
    const values = [...expensesList];
    const { name, value } = event.target;
    if (name === "description") {
      values[i][name] = value;
    } else {
      values[i][name] = value.replace(/[^\dA-Z]/g, "");
    }

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

  const handleOverallExpenses = (e) => {
    setOverallexpensesValue(
      (e.target.value = e.target.value.replace(/[^\dA-Z]/g, ""))
    );
    if (e.target.value) {
      setExpenseListHide(true);
    } else {
      setExpenseListHide(false);
    }
  };

  const getPackage = useCallback(
    async (packageId) => {
      setLoading(true);
      try {
        const response = await axiosPrivate.get(
          `/EmploymentDetail/${packageId}`
        );
        const fields = ["employerName", "payee", "incomeFrom", "taxFrom"];

        const packages = {
          employerName: response.data.result.name,
          payee: response.data.result.paye,
          incomeFrom: response.data.result.incomeFromP60_P45,
          taxFrom: response.data.result.taxFromP60_P45,
        };

        fields.forEach((field) => setValue(field, packages[field]));

        if (response.data.result.expenses.length > 0) {
          setExpensesList([
            ...response.data.result.expenses.map((n) => {
              return { id: n.id, description: n.description, amount: n.amount };
            }),
          ]);
        } else {
          setExpensesList([{ description: "", amount: 0 }]);
        }

        setUrls([
          ...response.data.result.attachments.map((n) => {
            return { url: n.url, id: n.id };
          }),
        ]);
        setOverallexpensesValue(response.data.result.totalExpenses);
      } catch (err) {
        // console.log(err);
        setLoading(false);
      }
      setLoading(false);
    },
    [axiosPrivate, setValue]
  );

  useEffect(() => {
    if (packageId) {
      // get user and set form fields
      getPackage(packageId);
    }
  }, [packageId, getPackage]);

  return (
    <div className="Employment">
      
      {isLoading ? (
        <CircularProgress />
      ) : (
        <form>
          <ToastContainer />
          <Container component="main" maxWidth="lg">
            <div className="back-button" onClick={() => navigate(-1)}>
              <ArrowBackIosNewIcon className="back-icon" />
              <h5 className="title is-5">Back</h5>
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
                      error={!!errors.employerName?.message}
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
                      onChange={(e) =>
                        setValue(
                          "incomeFrom",
                          (e.target.value = e.target.value.replace(
                            /[^\dA-Z]/g,
                            ""
                          ))
                        )
                      }
                      // {...register("incomeFrom")}
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
                      // {...register("taxFrom")}
                      onChange={(e) =>
                        setValue(
                          "taxFrom",
                          (e.target.value = e.target.value.replace(
                            /[^\dA-Z]/g,
                            ""
                          ))
                        )
                      }
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
                    <UploadFiles handleUpload={handleUpload} />
                    {packageId && (
                      <>
                        <ol style={{ padding: "1rem" }}>
                          {urls.map((n) => (
                            <li key={n.id}>
                              <a
                                target={"_blank"}
                                href={n.url}
                                rel="noreferrer"
                              >
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

export default Employment;
