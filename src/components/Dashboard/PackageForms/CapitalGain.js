import { yupResolver } from "@hookform/resolvers/yup";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import SaveIcon from "@mui/icons-material/Save";
import {
  Box,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React, { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import "react-phone-input-2/lib/material.css";
import { useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";
import "./CapitalGain.scss";

import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import moment from "moment";

export function getQueryStringParam(paramName) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(paramName);
}

const CapitalGain = () => {
  let navigate = useNavigate();

  const axiosPrivate = useAxiosPrivate();
  const [isLoading, setLoading] = React.useState(false);

  const params = useParams();
  const [cookies, setCookie] = useCookies();

  const [assetType, setAssetType] = React.useState("");
  const [assetAcquiredDate, setAssetAcquiredDate] = React.useState("");
  const [initialCost, setInitialCost] = React.useState("");
  const [assetDisposedDate, setAssetDisposedDate] = React.useState("");
  const [valuation, setValuation] = React.useState("");
  const [grossGain, setGrossGain] = React.useState("");

  //checkboxes
  const [
    realTimeTransactionTaxReturnForTheDisposal,
    setRealTimeTransactionTaxReturnForTheDisposal,
  ] = React.useState(false);
  const [
    qualifiedForBusinessAssetDisposalRelief,
    setQualifiedForBusinessAssetDisposalRelief,
  ] = React.useState(false);
  const [connectedToPurchaseOrSeller, setConnectedToPurchaseOrSeller] =
    React.useState(false);
  const [
    receiveAnyOtherReliefsOrElections,
    setReceiveAnyOtherReliefsOrElections,
  ] = React.useState(false);
  const [isBasedOnEstimationOrValuation, setIsBasedOnEstimationOrValuation] =
    React.useState(false);

  const [allowAditionalExpenditure, setAllowAditionalExpenditure] =
    React.useState(false);

  const [isDisposal, setIsDisposal] = React.useState(false);

  const validationSchema = Yup.object().shape({
    assetType: Yup.string().required("Asset Type name must not be empty."),
    description: Yup.string().required("Description name must not be empty."),
    assetAcquiredDate: Yup.string().required(
      "Asset Acquired Date name must not be empty."
    ),
    initialCost: Yup.string().required("Initial cost must not be empty."),
    assetDisposedDate: Yup.string().required(
      "Asset Disposed Date must not be empty."
    ),
    valuation: Yup.string().required("Valuation must not be empty."),
    grossGain: Yup.string().required("Gross Gain / Loss must not be empty."),
    realTimeTransactionTaxReturnForTheDisposal: Yup.boolean(),
    qualifiedForBusinessAssetDisposalRelief: Yup.boolean(),
    connectedToPurchaseOrSeller: Yup.boolean(),
    receiveAnyOtherReliefsOrElections: Yup.boolean(),
    isBasedOnEstimationOrValuation: Yup.boolean(),
    allowAditionalExpenditure: Yup.boolean(),
    isDisposal: Yup.boolean(),
  });

  const formOptions = {
    mode: "onChange",
    resolver: yupResolver(validationSchema),
    defaultValues: {
      assetType: "",
      description: "",
      assetAcquiredDate: "",
      initialCost: "",
      assetDisposedDate: "",
      valuation: "",
      grossGain: "",
      realTimeTransactionTaxReturnForTheDisposal: false,
      qualifiedForBusinessAssetDisposalRelief: false,
      connectedToPurchaseOrSeller: false,
      receiveAnyOtherReliefsOrElections: false,
      isBasedOnEstimationOrValuation: false,
      allowAditionalExpenditure: false,
      isDisposal: false,
    },
  };

  const { register, handleSubmit, formState, reset, setValue } =
    useForm(formOptions);
  const { errors } = formState;

  const packageId = getQueryStringParam("packageId");
  const taxYear = cookies?.order?.taxYear
    ? cookies.order.taxYear
    : getQueryStringParam("reference")
    ? getQueryStringParam("reference")
    : 0;

  const postCall = (data) => {
    const response = axiosPrivate.post("https://tax.api.cyberozunu.com/api/v1.0/CapitalGain", {
      orderId: params.orderId ? params.orderId : cookies.order.oderId,
      assetType: data.assetType,
      description: data.description,
      assetAcquiredDate: data.assetAcquiredDate,
      initialCost:  data.initialCost
      ? parseFloat(data.initialCost.toString().replace(/\,/g, "")).toFixed(2)
      : 0,
      assetDisposedDate: data.assetDisposedDate,
      valuation:  data.valuation
      ? parseFloat(data.valuation.toString().replace(/\,/g, "")).toFixed(2)
      : 0,
      allowAditionalExpenditure: data.allowAditionalExpenditure,
      isDisposal: data.isDisposal,
      grossGain:  data.grossGain
      ? parseFloat(data.grossGain.toString().replace(/\,/g, "")).toFixed(2)
      : 0,
      realTimeTransactionTaxReturnForTheDisposal:
        data.realTimeTransactionTaxReturnForTheDisposal,
      qualifiedForBusinessAssetDisposalRelief:
        data.qualifiedForBusinessAssetDisposalRelief,
      connectedToPurchaseOrSeller: data.connectedToPurchaseOrSeller,
      receiveAnyOtherReliefsOrElections: data.receiveAnyOtherReliefsOrElections,
      isBasedOnEstimationOrValuation: data.isBasedOnEstimationOrValuation,
    });

    return response;
  };

  const putCall = (data) => {
    const response = axiosPrivate.put("https://tax.api.cyberozunu.com/api/v1.0/CapitalGain", {
      id: packageId,
      orderId: params.orderId,
      assetType: data.assetType,
      description: data.description,
      assetAcquiredDate: data.assetAcquiredDate,
      initialCost:  data.initialCost
      ? parseFloat(data.initialCost.toString().replace(/\,/g, "")).toFixed(2)
      : 0,
      assetDisposedDate: data.assetDisposedDate,
      valuation:  data.valuation
      ? parseFloat(data.valuation.toString().replace(/\,/g, "")).toFixed(2)
      : 0,
      allowAditionalExpenditure: data.allowAditionalExpenditure,
      isDisposal: data.isDisposal,
      grossGain:  data.grossGain
      ? parseFloat(data.grossGain.toString().replace(/\,/g, "")).toFixed(2)
      : 0,
      realTimeTransactionTaxReturnForTheDisposal:
        data.realTimeTransactionTaxReturnForTheDisposal,
      qualifiedForBusinessAssetDisposalRelief:
        data.qualifiedForBusinessAssetDisposalRelief,
      connectedToPurchaseOrSeller: data.connectedToPurchaseOrSeller,
      receiveAnyOtherReliefsOrElections: data.receiveAnyOtherReliefsOrElections,
      isBasedOnEstimationOrValuation: data.isBasedOnEstimationOrValuation,
    });

    return response;
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      packageId ? await putCall(data) : await postCall(data);

      setLoading(false);

      reset();
      handleReset();
      setLoading(false);

      if (packageId) {
        navigate(`/edit/${params.orderId}/?reference=${taxYear}`);
      } else {
        if (params.orderId) {
          navigate("/account");
        } else {
          if (cookies.order.selectedPackages.length > 1) {
            const filteredEmployement = cookies.order.selectedPackages.filter(
              (n) => n.package.name === "Capital gain"
            );

            filteredEmployement[0].package.recordsAdded = true;

            const filteredOther = cookies.order.selectedPackages.filter(
              (n) => n.package.name !== "Capital gain"
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
          ? "Capital Gain Details Edited Successfully"
          : "Capital Gain Details Saved Successfully"
      );
    } catch (err) {
      setLoading(false);
      toast.error(err);
    }
  };

  const handleReset = () => {
    setAssetType("");
    setAssetAcquiredDate("");
    setInitialCost("");
    setAssetDisposedDate("");
    setValuation("");
    setGrossGain();
    setRealTimeTransactionTaxReturnForTheDisposal(false);
    setQualifiedForBusinessAssetDisposalRelief(false);
    setConnectedToPurchaseOrSeller(false);
    setReceiveAnyOtherReliefsOrElections(false);
    setIsBasedOnEstimationOrValuation(false);
    setAllowAditionalExpenditure(false);
    setIsDisposal(false);
  };

  const onSubmitAndAddAnother = async (data) => {
    setLoading(true);
    try {
      await postCall(data);

      reset();
      handleReset();
      setLoading(false);
      toast.success("Employment Details Saved Successfully");
    } catch (err) {
      setLoading(false);
      toast.error(err);
    }
  };

  const getPackage = useCallback(
    async (packageId) => {
      setLoading(true);
      try {
        const response = await axiosPrivate.get(`https://tax.api.cyberozunu.com/api/v1.0/CapitalGain/${packageId}`);
        const fields = [
          "assetType",
          "description",
          "assetAcquiredDate",
          "initialCost",
          "assetDisposedDate",
          "valuation",
          "allowAditionalExpenditure",
          "isDisposal",
          "grossGain",
          "realTimeTransactionTaxReturnForTheDisposal",
          "qualifiedForBusinessAssetDisposalRelief",
          "connectedToPurchaseOrSeller",
          "receiveAnyOtherReliefsOrElections",
          "isBasedOnEstimationOrValuation",
        ];

        const packages = {
          assetType: response?.data?.result?.assetType,
          description: response?.data?.result?.description,
          assetAcquiredDate: moment(response?.data?.result?.assetAcquiredDate).format("YYYY-MM-DD"),
          initialCost: response?.data?.result?.initialCost
            .toString()
            .replace(/[^\d.]/g, "")
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            .replace(/(\.\d{1,2}).*/g, "$1"),
          assetDisposedDate: moment(response?.data?.result?.assetDisposedDate).format("YYYY-MM-DD"),
          valuation: response?.data?.result?.valuation
            .toString()
            .replace(/[^\d.]/g, "")
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            .replace(/(\.\d{1,2}).*/g, "$1"),
          allowAditionalExpenditure:
            response?.data?.result?.allowAditionalExpenditure,
          isDisposal: response?.data?.result?.isDisposal,
          grossGain: response?.data?.result?.grossGain
            .toString()
            .replace(/[^\d.]/g, "")
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            .replace(/(\.\d{1,2}).*/g, "$1"),
          realTimeTransactionTaxReturnForTheDisposal:
            response?.data?.result?.realTimeTransactionTaxReturnForTheDisposal,
          qualifiedForBusinessAssetDisposalRelief:
            response?.data?.result?.qualifiedForBusinessAssetDisposalRelief,
          connectedToPurchaseOrSeller:
            response?.data?.result?.connectedToPurchaseOrSeller,
          receiveAnyOtherReliefsOrElections:
            response?.data?.result?.receiveAnyOtherReliefsOrElections,
          isBasedOnEstimationOrValuation:
            response?.data?.result?.isBasedOnEstimationOrValuation,
        };

        fields.forEach((field) => setValue(field, packages[field]));
        setAssetType(packages.assetType);
        setAssetAcquiredDate(packages.assetAcquiredDate);
        setInitialCost(packages.initialCost);
        setAssetDisposedDate(packages.assetDisposedDate);
        setValuation(packages.valuation);
        setGrossGain(packages.grossGain);
        setRealTimeTransactionTaxReturnForTheDisposal(
          packages.realTimeTransactionTaxReturnForTheDisposal
        );
        setQualifiedForBusinessAssetDisposalRelief(
          packages.qualifiedForBusinessAssetDisposalRelief
        );
        setConnectedToPurchaseOrSeller(packages.connectedToPurchaseOrSeller);
        setReceiveAnyOtherReliefsOrElections(
          packages.receiveAnyOtherReliefsOrElections
        );
        setIsBasedOnEstimationOrValuation(
          packages.isBasedOnEstimationOrValuation
        );
        setAllowAditionalExpenditure(packages.allowAditionalExpenditure);
        setIsDisposal(packages.isDisposal);
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
    <div className="CapitalGain">
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
                {taxYear ? `Tax Year ${taxYear - 1}-${taxYear}` : ""}
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
              <p className="title is-3">Capital Gain</p>
              <Box sx={{ mt: 1 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={12}>
                    <InputLabel
                      htmlFor="assetType"
                      required
                      sx={{ fontWeight: "bold" }}
                    >
                      Asset Type
                    </InputLabel>
                    <Select
                      id="demo-simple-select"
                      value={assetType}
                      onChange={(e) => {
                        setValue("assetType", e.target.value);
                        setAssetType(e.target.value);
                      }}
                      fullWidth
                      placeholder="For this disposal, please select the type of asset using the drop down list:"
                    >
                      <MenuItem value={"Listed shares and securities"}>
                        Listed shares and securities
                      </MenuItem>
                      <MenuItem value={"Unlisted shares and securities "}>
                        Unlisted shares and securities
                      </MenuItem>
                      <MenuItem value={"UK Residental Propery"}>
                        UK Residental Propery
                      </MenuItem>
                      <MenuItem value={"Non-UK residential property"}>
                        Non-UK residential property
                      </MenuItem>
                      <MenuItem value={"Other property, assets and gains"}>
                        Other property, assets and gains
                      </MenuItem>
                      <MenuItem value={"Trusts: Gaines attribute to you"}>
                        Trusts: Gaines attribute to you
                      </MenuItem>
                      <MenuItem value={"Carried interest"}>
                        Carried interest
                      </MenuItem>
                      {/* <MenuItem value={10}>Ten</MenuItem>
                      <MenuItem value={20}>Twenty</MenuItem>
                      <MenuItem value={30}>Thirty</MenuItem> */}
                    </Select>
                    <FormHelperText>
                      For this disposal, please select the type of asset using
                      the drop down list:
                    </FormHelperText>
                    <Typography variant="body2" color="error" align="left">
                      {errors.employerName?.message}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <InputLabel
                      htmlFor="description"
                      required
                      sx={{ fontWeight: "bold" }}
                    >
                      Description
                    </InputLabel>
                    <TextField
                      name="description"
                      required
                      fullWidth
                      id="description"
                      //   label="Enter your employer name"
                      placeholder="Enter a brief description of the asset involved"
                      autoFocus
                      error={!!errors.description?.message}
                      {...register("description")}
                    />

                    <Typography variant="body2" color="error" align="left">
                      {errors.description?.message}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={12}>
                    <InputLabel
                      htmlFor="assetAcquiredDate"
                      required
                      sx={{ fontWeight: "bold" }}
                    >
                      Asset Acquired Date
                    </InputLabel>
                    <TextField
                      required
                      fullWidth
                      id="assetAcquiredDate"
                      name="assetAcquiredDate"
                      type={"date"}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      value={assetAcquiredDate}
                      onChange={(e) => {
                        setAssetAcquiredDate(e.target.value);
                        setValue("assetAcquiredDate", e.target.value);
                      }}
                      onKeyDown={(e) => e.preventDefault()}
                    />
                    <Typography variant="body2" color="error" align="left">
                      {errors.assetAcquiredDate?.message}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <InputLabel
                      htmlFor="payee"
                      required
                      sx={{ fontWeight: "bold" }}
                    >
                      Initial Cost
                    </InputLabel>
                    <TextField
                      required
                      fullWidth
                      id="initialCost"
                      name="initialCost"
                      onChange={(e) => {
                        setValue(
                          "initialCost",
                          (e.target.value = e.target.value
                            .replace(/[^\d.]/g, "")
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            .replace(/(\.\d{1,2}).*/g, "$1"))
                        );
                        setInitialCost(e.target.value);
                      }}
                      value={initialCost}
                      // {...register("incomeFrom")}
                      placeholder="Initial cost of the asset (Enter the market value at 31/03/82 if acquired before this date)"
                    />
                    <Typography variant="body2" color="error" align="left">
                      {errors.initialCost?.message}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <InputLabel
                      htmlFor="assetDisposedDate"
                      required
                      sx={{ fontWeight: "bold" }}
                    >
                      Asset Disposed Date
                    </InputLabel>
                    <TextField
                      required
                      fullWidth
                      id="assetDisposedDate"
                      name="assetDisposedDate"
                      type={"date"}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      value={assetDisposedDate}
                      onChange={(e) => {
                        setAssetDisposedDate(e.target.value);
                        setValue("assetDisposedDate", e.target.value);
                      }}
                      onKeyDown={(e) => e.preventDefault()}
                    />
                    <Typography variant="body2" color="error" align="left">
                      {errors.assetDisposedDate?.message}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <InputLabel
                      htmlFor="valuation"
                      required
                      sx={{ fontWeight: "bold" }}
                    >
                      Valuation
                    </InputLabel>
                    <TextField
                      required
                      fullWidth
                      id="valuation"
                      name="valuation"
                      onChange={(e) => {
                        setValue(
                          "valuation",
                          (e.target.value = e.target.value
                            .replace(/[^\d.]/g, "")
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            .replace(/(\.\d{1,2}).*/g, "$1"))
                        );
                        setValuation(e.target.value);
                      }}
                      value={valuation}
                      // {...register("incomeFrom")}
                      placeholder="Disposal proceeds or valuation where appropriate"
                    />
                    <Typography variant="body2" color="error" align="left">
                      {errors.valuation?.message}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={allowAditionalExpenditure}
                          onChange={(e) => {
                            setAllowAditionalExpenditure(e.target.checked);
                            setValue(
                              "allowAditionalExpenditure",
                              e.target.checked
                            );
                          }}
                        />
                      }
                      label="Any Additional Allowable Expenditure?"
                    />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isDisposal}
                          onChange={(e) => {
                            setIsDisposal(e.target.checked);
                            setValue("isDisposal", e.target.checked);
                          }}
                        />
                      }
                      label="Was this disposal acquired under an Employee Shareholder Agreement?"
                    />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <InputLabel
                      htmlFor="grossGain"
                      required
                      sx={{ fontWeight: "bold" }}
                    >
                      Gross Gain / Loss
                    </InputLabel>
                    <TextField
                      required
                      fullWidth
                      id="grossGain"
                      name="grossGain"
                      onChange={(e) => {
                        setValue(
                          "grossGain",
                          (e.target.value = e.target.value
                            .replace(/[^\d.]/g, "")
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            .replace(/(\.\d{1,2}).*/g, "$1"))
                        );
                        setGrossGain(e.target.value);
                      }}
                      value={grossGain}
                      // {...register("incomeFrom")}
                      placeholder="Gross gain/(loss)"
                    />
                    <Typography variant="body2" color="error" align="left">
                      {errors.grossGain?.message}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={realTimeTransactionTaxReturnForTheDisposal}
                          onChange={(e) => {
                            setRealTimeTransactionTaxReturnForTheDisposal(
                              e.target.checked
                            );
                            setValue(
                              "realTimeTransactionTaxReturnForTheDisposal",
                              e.target.checked
                            );
                          }}
                        />
                      }
                      label="Tick this box if you submitted a Real Time Transaction Tax Return for the disposal of this asset"
                    />
                  </Grid>

                  <Grid item xs={12} sm={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={qualifiedForBusinessAssetDisposalRelief}
                          onChange={(e) => {
                            setQualifiedForBusinessAssetDisposalRelief(
                              e.target.checked
                            );
                            setValue(
                              "qualifiedForBusinessAssetDisposalRelief",
                              e.target.checked
                            );
                          }}
                        />
                      }
                      label="Does this gain qualify for Business Asset Disposal Relief?"
                    />
                  </Grid>

                  <Grid item xs={12} sm={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={connectedToPurchaseOrSeller}
                          onChange={(e) => {
                            setConnectedToPurchaseOrSeller(e.target.checked);
                            setValue(
                              "connectedToPurchaseOrSeller",
                              e.target.checked
                            );
                          }}
                        />
                      }
                      label="Tick this box if you are 'connected' to the purchaser or seller of the asset"
                    />
                  </Grid>

                  <Grid item xs={12} sm={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={receiveAnyOtherReliefsOrElections}
                          onChange={(e) => {
                            setReceiveAnyOtherReliefsOrElections(
                              e.target.checked
                            );
                            setValue(
                              "receiveAnyOtherReliefsOrElections",
                              e.target.checked
                            );
                          }}
                        />
                      }
                      label="Tick this box if you are claiming any other reliefs or elections for this asset e.g. Private Residence Relief, EIS Deferral Relief, Roll over / Hold Over relief"
                    />
                  </Grid>

                  <Grid item xs={12} sm={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isBasedOnEstimationOrValuation}
                          onChange={(e) => {
                            setIsBasedOnEstimationOrValuation(e.target.checked);
                            setValue(
                              "isBasedOnEstimationOrValuation",
                              e.target.checked
                            );
                          }}
                        />
                      }
                      label="Tick this box if any of the figures are based on an estimate or valuation"
                    />
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

export default CapitalGain;
