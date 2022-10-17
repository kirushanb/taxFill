import {
  Card,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { axiosPrivate } from "../../../api/axios";
import "./CalculateTax.scss";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

const CalculateTax = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [list, setList] = useState({});

  const navigate = useNavigate();
  const params = useParams();
  const getData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosPrivate.get(
        `https://tax.api.cyberozunu.com/api/v1.1/Order/calculate-tax?orderId=${params.orderId}`
      );
      setList(response.data.result);
      console.log(response.data.result);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      // navigate('/', { state: { from: location }, replace: true });
      setIsLoading(false);
    }
  }, [params.orderId, axiosPrivate]);

  useEffect(() => {
    if (params.orderId) {
      getData();
    }
  }, [getData, navigate, params.orderId]);

  const getTotalIncomes = () => {
    if (!list["totalIncomes"]) {
      return [];
    }
    const nonSaving =
      list["totalIncomes"] &&
      list["totalIncomes"].reduce((prev, curr) => prev + curr.nonSaving, 0);
    const saving =
      list["totalIncomes"] &&
      list["totalIncomes"].reduce((prev, curr) => prev + curr.saving, 0);
    const divident =
      list["totalIncomes"] &&
      list["totalIncomes"].reduce((prev, curr) => prev + curr.divident, 0);
    return [
      ...list["totalIncomes"],
      {
        description: "Total",
        nonSaving: nonSaving,
        saving: saving,
        divident: divident,
      },
    ];
  };

  const getPersonalAllowance = () => {
    if (!list["personalAllowance"]) {
      return [];
    }
    return [
      {
        description: "Personal allowance",
        value1: list["personalAllowance"],
        value2: "",
      },
      {
        description: "Total Allowances",
        value1: "",
        value2: list["personalAllowance"],
      },
    ];
  };

  const getPersonalAllowanceDeductions = () => {
    if (!list["personalAllowanceDeductions"]) {
      return [];
    }
    const income =
      list["personalAllowanceDeductions"] &&
      list["personalAllowanceDeductions"].reduce(
        (prev, curr) => prev + curr.income,
        0
      );
    const deductionAndAllowance =
      list["personalAllowanceDeductions"] &&
      list["personalAllowanceDeductions"].reduce(
        (prev, curr) => prev + curr.deductionAndAllowance,
        0
      );
    const taxableAmount =
      list["personalAllowanceDeductions"] &&
      list["personalAllowanceDeductions"].reduce(
        (prev, curr) => prev + curr.taxableAmount,
        0
      );
    return [
      ...list["personalAllowanceDeductions"],
      {
        description: "Total",
        income: income,
        deductionAndAllowance: deductionAndAllowance,
        taxableAmount: taxableAmount,
      },
    ];
  };

  const getRateBands = () => {
    if (!list["rateBands"]) {
      return [];
    }

    return [...list["rateBands"]];
  };

  const getRateBandsPercentage = () => {
    if (!list["rateBands"]) {
      return [];
    }

    const totalDue =
      parseFloat(list["rateBands"][0]["basicRateBand"]) *
        (parseInt(list["rateBands"][0]["basicRateBandPercentage"]) / 100) +
      parseFloat(list["rateBands"][1]["basicRateBand"]) *
        (parseInt(list["rateBands"][1]["basicRateBandPercentage"]) / 100) +
      parseFloat(list["rateBands"][2]["basicRateBand"]) *
        (parseInt(list["rateBands"][2]["basicRateBandPercentage"]) / 100) +
      (parseFloat(list["rateBands"][0]["higherRateBand"]) *
        (parseInt(list["rateBands"][0]["higherRateBandPercentage"]) / 100) +
        parseFloat(list["rateBands"][1]["higherRateBand"]) *
          (parseInt(list["rateBands"][1]["higherRateBandPercentage"]) / 100) +
        parseFloat(list["rateBands"][2]["higherRateBand"]) *
          (parseInt(list["rateBands"][2]["higherRateBandPercentage"]) / 100)) +
      (parseFloat(list["rateBands"][0]["additionalRateBand"]) *
        (parseInt(list["rateBands"][0]["additionalRateBandPercentage"]) / 100) +
        parseFloat(list["rateBands"][1]["additionalRateBand"]) *
          (parseInt(list["rateBands"][1]["additionalRateBandPercentage"]) /
            100) +
        parseFloat(list["rateBands"][2]["additionalRateBand"]) *
          (parseInt(list["rateBands"][2]["additionalRateBandPercentage"]) /
            100)) -
      list["rateBands"].reduce((prev, curr) => prev + curr.allowance, 0);
    return [
      {
        description: "Non savings income",
        value1: [
          {
            description: "Personal allowance",
            value1: list["rateBands"][0]["allowance"],
            value2: list["rateBands"][0]["allowance"],
          },
          {
            description: "Basic",
            value1: `${list["rateBands"][0]["basicRateBand"]} @ ${list["rateBands"][0]["basicRateBandPercentage"]}% =`,
            value2:
              parseFloat(list["rateBands"][0]["basicRateBand"]) *
              (parseInt(list["rateBands"][0]["basicRateBandPercentage"]) / 100),
          },
          {
            description: "Higher",
            value1: `${list["rateBands"][0]["higherRateBand"]} @ ${list["rateBands"][0]["higherRateBandPercentage"]}% =`,
            value2:
              parseFloat(list["rateBands"][0]["higherRateBand"]) *
              (parseInt(list["rateBands"][0]["higherRateBandPercentage"]) /
                100),
          },
          {
            description: "Additional",
            value1: `${list["rateBands"][0]["additionalRateBand"]} @ ${list["rateBands"][0]["additionalRateBandPercentage"]}% =`,
            value2:
              parseFloat(list["rateBands"][0]["additionalRateBand"]) *
              (parseInt(list["rateBands"][0]["additionalRateBandPercentage"]) /
                100),
          },
        ],
      },
      {
        description: "Savings income",
        value1: [
          {
            description: "PSA",
            value1: list["rateBands"][1]["allowance"],
            value2: list["rateBands"][1]["allowance"],
          },
          {
            description: "Basic",
            value1: `${list["rateBands"][1]["basicRateBand"]} @ ${list["rateBands"][1]["basicRateBandPercentage"]}% =`,
            value2:
              parseFloat(list["rateBands"][1]["basicRateBand"]) *
              (parseInt(list["rateBands"][1]["basicRateBandPercentage"]) / 100),
          },
          {
            description: "Higher",
            value1: `${list["rateBands"][1]["higherRateBand"]} @ ${list["rateBands"][1]["higherRateBandPercentage"]}% =`,
            value2:
              parseFloat(list["rateBands"][1]["higherRateBand"]) *
              (parseInt(list["rateBands"][1]["higherRateBandPercentage"]) /
                100),
          },
          {
            description: "Additional",
            value1: `${list["rateBands"][1]["additionalRateBand"]} @ ${list["rateBands"][1]["additionalRateBandPercentage"]}% =`,
            value2:
              parseFloat(list["rateBands"][1]["additionalRateBand"]) *
              (parseInt(list["rateBands"][1]["additionalRateBandPercentage"]) /
                100),
          },
        ],
      },
      {
        description: "Dividend income",
        value1: [
          {
            description: "Dividend Allowance",
            value1: list["rateBands"][2]["allowance"],
            value2: list["rateBands"][2]["allowance"],
          },
          {
            description: "Basic",
            value1: `${list["rateBands"][2]["basicRateBand"]} @ ${list["rateBands"][2]["basicRateBandPercentage"]}% =`,
            value2:
              parseFloat(list["rateBands"][2]["basicRateBand"]) *
              (parseInt(list["rateBands"][2]["basicRateBandPercentage"]) / 100),
          },
          {
            description: "Higher",
            value1: `${list["rateBands"][2]["higherRateBand"]} @ ${list["rateBands"][2]["higherRateBandPercentage"]}% =`,
            value2:
              parseFloat(list["rateBands"][2]["higherRateBand"]) *
              (parseInt(list["rateBands"][2]["higherRateBandPercentage"]) /
                100),
          },
          {
            description: "Additional",
            value1: `${list["rateBands"][2]["additionalRateBand"]} @ ${list["rateBands"][2]["additionalRateBandPercentage"]}% =`,
            value2:
              parseFloat(list["rateBands"][2]["additionalRateBand"]) *
              (parseInt(list["rateBands"][2]["additionalRateBandPercentage"]) /
                100),
          },
        ],
      },
      {
        description: "Total Income Tax Due",
        value1: [
          {
            description: "",
            value1: "",
            value2: totalDue,
          },
        ],
      },
    ];
  };

  const getRentalIncomeTaxAdjustment = () => {
    if (!list["rentalIncomeTaxAdjustment"]) {
      return [];
    }

    return [
      {
        description: "Total Income Tax Due",
        value1: "",
        value2: "",
        value3: list["rentalIncomeTaxAdjustment"]["totalIncomeTaxDue"],
      },
      {
        description: "Relief for finance costs",
        value1: `${list["rentalIncomeTaxAdjustment"]["reliefForFinancialCost"]} @ ${list["rentalIncomeTaxAdjustment"]["reliefForFinancialCostCalculationPercentage"]}% =`,
        value2:
          parseFloat(
            list["rentalIncomeTaxAdjustment"]["reliefForFinancialCost"]
          ) *
          (parseInt(
            list["rentalIncomeTaxAdjustment"][
              "reliefForFinancialCostCalculationPercentage"
            ]
          ) /
            100),
        value3: "",
      },
      {
        description: "Total allowances, reliefs and tax reductions",
        value1: "",
        value2:
          parseFloat(
            list["rentalIncomeTaxAdjustment"]["reliefForFinancialCost"]
          ) *
          (parseInt(
            list["rentalIncomeTaxAdjustment"][
              "reliefForFinancialCostCalculationPercentage"
            ]
          ) /
            100),
        value3: "",
      },
      {
        description: "Income tax due after reliefs and tax reductions",
        value1: "",
        value2: "",
        value3: list["rentalIncomeTaxAdjustment"]["totalIncomeTaxDue"],
      },
    ];
  };

  const getClassNIC = () => {
    if (!list["classNIC"]) {
      return [];
    }

    return [
      {
        description: "Income tax due per above",
        value1: "",
        value2: "",
        value3: list["classNIC"]["previousTaxDue"],
      },
      {
        description: "Class 4 NIC",
        value1: "",
        value2: list["classNIC"]["class4NIC"],
        value3: "",
      },
      {
        description: "Class 2 NIC",
        value1: "",
        value2: list["classNIC"]["class2NIC"],
        value3: "",
      },
      {
        description: "Total NIC",
        value1: "",
        value2: "",
        value3:
          parseFloat(list["classNIC"]["class4NIC"]) +
          parseFloat(list["classNIC"]["class2NIC"]),
      },
      {
        description: "Income tax plus national insurance",
        value1: "",
        value2: "",
        value3: list["classNIC"]["totalIncomeTaxDue"],
      },
      {
        description: "Total Income Tax Due",
        value1: "",
        value2: "",
        value3: list["classNIC"]["totalIncomeTaxDue"],
      },
    ];
  };

  const getTaxPaidAtSource = () => {
    if (!list["taxPaidAtSource"]) {
      return [];
    }

    return [
      {
        description: "Total tax paid at source",
        value1: list["taxPaidAtSource"]["totalTaxPaidAtSource"],
        value2: "",
      },
      {
        description: "Total tax deduction",
        value1: "",
        value2: list["taxPaidAtSource"]["totalTaxDeduction"],
      },
      {
        description: "Income tax due after deductions",
        value1: "",
        value2: list["taxPaidAtSource"]["incomeTaxDueAfterDeductions"],
      },
    ];
  };

  const getNonUKResidentialPropertyCapitalGain = () => {
    if (!list["nonUKResidentialPropertyCapitalGain"]) {
      return [];
    }

    return [
      {
        description: "Net capital gains chargeable at 20%",
        value1: `${list["nonUKResidentialPropertyCapitalGain"]["capitalGainsChargable"]} @ ${list["nonUKResidentialPropertyCapitalGain"]["percentage"]}% =`,
        value2:
          parseFloat(
            list["nonUKResidentialPropertyCapitalGain"]["capitalGainsChargable"]
          ) *
          (parseInt(list["nonUKResidentialPropertyCapitalGain"]["percentage"]) /
            100),
      },
      {
        description: "Total CGT charged",
        value1: "",
        value2:
          parseFloat(
            list["nonUKResidentialPropertyCapitalGain"]["capitalGainsChargable"]
          ) *
          (parseInt(list["nonUKResidentialPropertyCapitalGain"]["percentage"]) /
            100),
      },
      {
        description: "Capital Gains Tax due",
        value1: "",
        value2:
          parseFloat(
            list["nonUKResidentialPropertyCapitalGain"]["capitalGainsChargable"]
          ) *
          (parseInt(list["nonUKResidentialPropertyCapitalGain"]["percentage"]) /
            100),
      },
      {
        description: "Total Income Tax Due",
        value1: "",
        value2:
          list["nonUKResidentialPropertyCapitalGain"]["totalIncomeTaxDue"],
      },
    ];
  };

  const getUkResidentialPropertyCapitalGain = () => {
    if (!list["ukResidentialPropertyCapitalGain"]) {
      return [];
    }

    return [
      {
        description: "Total Income",
        value1:list["ukResidentialPropertyCapitalGain"]["income"],
        value2:'',
      },
      {
        description: "Starter",
        value1: "",
        value2: '',
      },
      {
        description: "basic",
        value1: `${list["ukResidentialPropertyCapitalGain"]["basicRateBand"]} @ ${list["ukResidentialPropertyCapitalGain"]["basicRateBandPercentage"]}% =`,
        value2: parseFloat(
          list["ukResidentialPropertyCapitalGain"]["basicRateBand"]
        ) *
        (parseInt(list["ukResidentialPropertyCapitalGain"]["basicRateBandPercentage"]) /
          100),
      },
      {
        description: "higher",
        value1: `${list["ukResidentialPropertyCapitalGain"]["higherRateBand"]} @ ${list["ukResidentialPropertyCapitalGain"]["higherRateBandPercentage"]}% =`,
        value2: parseFloat(
          list["ukResidentialPropertyCapitalGain"]["higherRateBand"]
        ) *
        (parseInt(list["ukResidentialPropertyCapitalGain"]["higherRateBandPercentage"]) /
          100),
      },
      {
        description: "Capital Gain Capital",
        value1: '',
        value2: (parseFloat(
          list["ukResidentialPropertyCapitalGain"]["higherRateBand"]
        ) *
        (parseInt(list["ukResidentialPropertyCapitalGain"]["higherRateBandPercentage"]) /
          100)) + parseFloat(
          list["ukResidentialPropertyCapitalGain"]["higherRateBand"]
        ) *
        (parseInt(list["ukResidentialPropertyCapitalGain"]["higherRateBandPercentage"]) /
          100),
      },
      {
        description: "Total Income Tax Due",
        value1: '',
        value2: list["ukResidentialPropertyCapitalGain"]["totalIncomeTaxDue"],
      },
      
    ];
  }

  const getPaymentSummary = () => {
    if (!list["paymentSummary"]) {
      return [];
    }

    return [
      {
        description: list["paymentSummary"]['firstPaymentLabel'],
        value:'',
        
      },
      {
        description: list["paymentSummary"]['firstPayment'] && Object.keys(list["paymentSummary"]['firstPayment'])[0],
        value: list["paymentSummary"]['firstPayment'] && Object.values(list["paymentSummary"]['firstPayment'])[0],
        
      },
      {
        description: list["paymentSummary"]['firstPayment'] && Object.keys(list["paymentSummary"]['firstPayment'])[1],
        value: list["paymentSummary"]['firstPayment'] && Object.values(list["paymentSummary"]['firstPayment'])[1],
        
      },
      {
        description: list["paymentSummary"]['firstPayment'] && Object.keys(list["paymentSummary"]['firstPayment'])[2],
        value: list["paymentSummary"]['firstPayment'] && Object.values(list["paymentSummary"]['firstPayment'])[2],
        
      },
      {
        description: list["paymentSummary"]['secondPaymentLabel'],
        value:'',
        
      },
    ];
  } 

  return (
    <div className="CalculateTax">
      <Card variant="outlined">
        {isLoading ? (
          <CircularProgress />
        ) : (
          <React.Fragment>
            <div className="back-button" onClick={() => navigate("/account")}>
              <ArrowBackIosNewIcon className="back-icon" />
              <h5 className="title is-5">Back</h5>
            </div>
            <div style={{ margin: "1rem" }}>
              <p className="title">Total Income</p>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Non-Savings</TableCell>
                      <TableCell align="right">Savings&nbsp;(g)</TableCell>
                      <TableCell align="right">Dividends&nbsp;(g)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getTotalIncomes()?.map((row) => (
                      <TableRow
                        key={row.name}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                          "&:nth-last-child(2) td": {
                            borderBottom: "2px solid black",
                          },
                          "&:last-child th": { fontWeight: "bold" },
                        }}
                      >
                        <TableCell
                          component="th"
                          scope="row"
                          sx={{ "&:last-child": { fontWeight: "bold" } }}
                        >
                          {row.description}
                        </TableCell>
                        <TableCell align="right">{row.nonSaving}</TableCell>
                        <TableCell align="right">{row.saving}</TableCell>
                        <TableCell align="right">{row.divident}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
            <div style={{ margin: "1rem", marginTop: "2rem" }}>
              <p className="title">Add up Allowances</p>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">£</TableCell>
                      <TableCell align="right">£</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getPersonalAllowance()?.map((row) => (
                      <TableRow
                        key={row.name}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                          "&:nth-last-child(2) td": {
                            borderBottom: "2px solid black",
                          },
                          "&:last-child th": { fontWeight: "bold" },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {row.description}
                        </TableCell>
                        <TableCell align="right">{row.value1}</TableCell>
                        <TableCell align="right">{row.value2}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
            <div style={{ margin: "1rem", marginTop: "2rem" }}>
              <p className="title">
                Take deductions and allowances away from income in order of
                priority
              </p>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Income</TableCell>
                      <TableCell align="right">
                        Deductions & Allowances
                      </TableCell>
                      <TableCell align="right">Taxable Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getPersonalAllowanceDeductions()?.map((row) => (
                      <TableRow
                        key={row.name}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                          "&:nth-last-child(2) td": {
                            borderBottom: "2px solid black",
                          },
                          "&:last-child th": { fontWeight: "bold" },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {row.description}
                        </TableCell>
                        <TableCell align="right">{row.income}</TableCell>
                        <TableCell align="right">
                          {row.deductionAndAllowance}
                        </TableCell>
                        <TableCell align="right">{row.taxableAmount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
            <div style={{ margin: "1rem", marginTop: "2rem" }}>
              <p className="title">
                Assign the taxable income to the available rate bands
              </p>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Non-savings</TableCell>
                      <TableCell align="right">Savings</TableCell>
                      <TableCell align="right">Dividends</TableCell>
                      <TableCell align="right">Lump sums</TableCell>
                      <TableCell align="right">
                        Gains on life policies (with notional tax) etc
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                        "&:nth-last-child(2) td": {
                          borderBottom: "2px solid black",
                        },
                        "&:last-child th": { fontWeight: "bold" },
                      }}
                    >
                      <TableCell component="th" scope="row">
                        {"Income"}
                      </TableCell>
                      <TableCell align="right">
                        {getRateBands()[0]?.income}
                      </TableCell>
                      <TableCell align="right">
                        {getRateBands()[1]?.income}
                      </TableCell>
                      <TableCell align="right">
                        {getRateBands()[2]?.income}
                      </TableCell>
                      <TableCell align="right">{""}</TableCell>
                      <TableCell align="right">{""}</TableCell>
                    </TableRow>

                    <TableRow
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                        "&:nth-last-child(2) td": {
                          borderBottom: "2px solid black",
                        },
                        "&:last-child th": { fontWeight: "bold" },
                      }}
                    >
                      <TableCell component="th" scope="row">
                        {"Personal Savings/Dividend Allowance available"}
                      </TableCell>
                      <TableCell align="right">
                        {getRateBands()[0]?.allowance}
                      </TableCell>
                      <TableCell align="right">
                        {getRateBands()[1]?.allowance}
                      </TableCell>
                      <TableCell align="right">
                        {getRateBands()[2]?.allowance}
                      </TableCell>
                      <TableCell align="right">{""}</TableCell>
                      <TableCell align="right">{""}</TableCell>
                    </TableRow>

                    <TableRow
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                        "&:nth-last-child(2) td": {
                          borderBottom: "2px solid black",
                        },
                        "&:last-child th": { fontWeight: "bold" },
                      }}
                    >
                      <TableCell component="th" scope="row">
                        {"Income in Starter rate band"}
                      </TableCell>
                      <TableCell align="right">{""}</TableCell>
                      <TableCell align="right">{""}</TableCell>
                      <TableCell align="right">{""}</TableCell>
                      <TableCell align="right">{""}</TableCell>
                      <TableCell align="right">{""}</TableCell>
                    </TableRow>

                    <TableRow
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                        "&:nth-last-child(2) td": {
                          borderBottom: "2px solid black",
                        },
                        "&:last-child th": { fontWeight: "bold" },
                      }}
                    >
                      <TableCell component="th" scope="row">
                        {"Income in basic rate band"}
                      </TableCell>
                      <TableCell align="right">
                        {getRateBands()[0]?.basicRateBand}
                      </TableCell>
                      <TableCell align="right">
                        {getRateBands()[1]?.basicRateBand}
                      </TableCell>
                      <TableCell align="right">
                        {getRateBands()[2]?.basicRateBand}
                      </TableCell>
                      <TableCell align="right">{""}</TableCell>
                      <TableCell align="right">{""}</TableCell>
                    </TableRow>

                    <TableRow
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                        "&:nth-last-child(2) td": {
                          borderBottom: "2px solid black",
                        },
                        "&:last-child th": { fontWeight: "bold" },
                      }}
                    >
                      <TableCell component="th" scope="row">
                        {"Income in higher rate band"}
                      </TableCell>
                      <TableCell align="right">
                        {getRateBands()[0]?.higherRateBand}
                      </TableCell>
                      <TableCell align="right">
                        {getRateBands()[1]?.higherRateBand}
                      </TableCell>
                      <TableCell align="right">
                        {getRateBands()[2]?.higherRateBand}
                      </TableCell>
                      <TableCell align="right">{""}</TableCell>
                      <TableCell align="right">{""}</TableCell>
                    </TableRow>

                    <TableRow
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                        "&:nth-last-child(2) td": {
                          borderBottom: "2px solid black",
                        },
                        "&:last-child th": { fontWeight: "bold" },
                      }}
                    >
                      <TableCell component="th" scope="row">
                        {"Income in additional rate band"}
                      </TableCell>
                      <TableCell align="right">
                        {getRateBands()[0]?.additionalRateBand}
                      </TableCell>
                      <TableCell align="right">
                        {getRateBands()[1]?.additionalRateBand}
                      </TableCell>
                      <TableCell align="right">
                        {getRateBands()[2]?.additionalRateBand}
                      </TableCell>
                      <TableCell align="right">{""}</TableCell>
                      <TableCell align="right">{""}</TableCell>
                    </TableRow>
                    <TableRow
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                        "&:nth-last-child(2) td": {
                          borderBottom: "2px solid black",
                        },
                        "&:last-child th": { fontWeight: "bold" },
                      }}
                    >
                      <TableCell component="th" scope="row">
                        {"Total"}
                      </TableCell>
                      <TableCell align="right">
                        {getRateBands()?.length > 0 &&
                          getRateBands()[0]?.length > 0 &&
                          Object.entries(getRateBands()[0])
                            ?.filter(
                              ([key, value]) =>
                                !(
                                  key === "basicRateBandPercentage" ||
                                  key === "higherRateBandPercentage" ||
                                  key === "additionalRateBandPercentage" ||
                                  key === "type"
                                )
                            )
                            ?.reduce((prev, [key, value]) => prev + value, 0)}
                      </TableCell>
                      <TableCell align="right">
                        {getRateBands()?.length > 0 &&
                          getRateBands()[1]?.length > 0 &&
                          Object?.entries(getRateBands()[1])
                            ?.filter(
                              ([key, value]) =>
                                !(
                                  key === "basicRateBandPercentage" ||
                                  key === "higherRateBandPercentage" ||
                                  key === "additionalRateBandPercentage" ||
                                  key === "type"
                                )
                            )
                            ?.reduce((prev, [key, value]) => prev + value, 0)}
                      </TableCell>
                      <TableCell align="right">
                        {getRateBands()?.length > 0 &&
                          getRateBands()[2]?.length > 0 &&
                          Object.entries(getRateBands()[2])
                            .filter(
                              ([key, value]) =>
                                !(
                                  key === "basicRateBandPercentage" ||
                                  key === "higherRateBandPercentage" ||
                                  key === "additionalRateBandPercentage" ||
                                  key === "type"
                                )
                            )
                            .reduce((prev, [key, value]) => prev + value, 0)}
                      </TableCell>
                      <TableCell align="right">{""}</TableCell>
                      <TableCell align="right">{""}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
            <div style={{ margin: "1rem", marginTop: "2rem" }}>
              <p className="title">Calculate the tax due at each rate band</p>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">£</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getRateBandsPercentage()?.map((row) => (
                      <TableRow
                        key={row.name}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                          "&:nth-last-child(2)": {
                            borderBottom: "2px solid black",
                          },
                          "&:last-child th": { fontWeight: "bold" },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {row.description}
                        </TableCell>

                        <TableCell align="right">
                          <TableBody sx={{ width: "100%" }}>
                            {row.value1?.map((row) => (
                              <TableRow
                                key={row.name}
                                sx={{
                                  "&:last-child td, &:last-child th": {
                                    border: 0,
                                  },
                                  "&:nth-last-child(2) td": {
                                    borderBottom: "normal",
                                  },
                                  "&:last-child th": { fontWeight: "normal" },
                                }}
                              >
                                <TableCell
                                  sx={{ width: "150px" }}
                                  component="th"
                                  scope="row"
                                >
                                  {row.description}
                                </TableCell>
                                <TableCell
                                  sx={{ width: "150px" }}
                                  align="right"
                                >
                                  {row.value1}
                                </TableCell>
                                <TableCell
                                  sx={{ width: "150px" }}
                                  align="right"
                                >
                                  {row.value2}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
            <div style={{ margin: "1rem", marginTop: "2rem" }}>
              <p className="title">Apply tax adjustments</p>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">£</TableCell>
                      <TableCell align="right">£</TableCell>
                      <TableCell align="right">£</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getRentalIncomeTaxAdjustment()?.map((row, i) => {
                      if (i === +1) {
                        return (
                          <TableRow
                            key={row.name}
                            sx={{
                              "& td:nth-last-child(2)": {
                                borderBottom: "2px solid black",
                              },
                            }}
                          >
                            <TableCell component="th" scope="row">
                              {row.description}
                            </TableCell>
                            <TableCell align="right">{row.value1}</TableCell>
                            <TableCell align="right">{row.value2}</TableCell>
                            <TableCell align="right">{row.value3}</TableCell>
                          </TableRow>
                        );
                      }
                      return (
                        <TableRow
                          key={row.name}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                            "&:nth-last-child(2) td": {
                              borderBottom: "2px solid black",
                            },
                            "&:last-child th": { fontWeight: "bold" },
                          }}
                        >
                          <TableCell component="th" scope="row">
                            {row.description}
                          </TableCell>
                          <TableCell align="right">{row.value1}</TableCell>
                          <TableCell align="right">{row.value2}</TableCell>
                          <TableCell align="right">{row.value3}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
            <div style={{ margin: "1rem", marginTop: "2rem" }}>
              <p className="title">Calculate Tax Due</p>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">£</TableCell>
                      <TableCell align="right">£</TableCell>
                      <TableCell align="right">£</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getClassNIC()?.map((row, i) => {
                      return (
                        <TableRow
                          key={row.name}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                            "&:nth-last-child(2) td": {
                              borderBottom: "2px solid black",
                            },
                            "&:last-child th": { fontWeight: "bold" },
                          }}
                        >
                          <TableCell component="th" scope="row">
                            {row.description}
                          </TableCell>
                          <TableCell align="right">{row.value1}</TableCell>
                          <TableCell align="right">{row.value2}</TableCell>
                          <TableCell align="right">{row.value3}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
            <div style={{ margin: "1rem", marginTop: "2rem" }}>
              <p className="title">Deduct tax paid etc</p>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">£</TableCell>
                      <TableCell align="right">£</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getTaxPaidAtSource()?.map((row, i) => {
                      return (
                        <TableRow
                          key={row.name}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                            // "&:nth-last-child(2) td": {
                            //   borderBottom: "2px solid black",
                            // },
                            // "&:last-child th": { fontWeight: "bold" },
                          }}
                        >
                          <TableCell component="th" scope="row">
                            {row.description}
                          </TableCell>
                          <TableCell align="right">{row.value1}</TableCell>
                          <TableCell align="right">{row.value2}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
            <div style={{ margin: "1rem", marginTop: "2rem" }}>
              <p className="title">
                Add Capital Gains tax (Non UK Residential Property)
              </p>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">£</TableCell>
                      <TableCell align="right">£</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getNonUKResidentialPropertyCapitalGain()?.map((row, i) => {
                      if (i === +1) {
                        return (
                          <TableRow
                            key={row.name}
                            sx={{
                              "& td:last-child": {
                                borderBottom: "2px solid black",
                              },
                            }}
                          >
                            <TableCell component="th" scope="row">
                              {row.description}
                            </TableCell>
                            <TableCell align="right">{row.value1}</TableCell>
                            <TableCell align="right">{row.value2}</TableCell>
                            
                          </TableRow>
                        );
                      }
                      return (
                        <TableRow
                          key={row.name}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                            "&:nth-last-child(2) td:last-child": {
                              borderBottom: "4px double black",
                              
                            },
                            "&:last-child th": { fontWeight: "bold" },
                          }}
                        >
                          <TableCell component="th" scope="row">
                            {row.description}
                          </TableCell>
                          <TableCell align="right">{row.value1}</TableCell>
                          <TableCell align="right">{row.value2}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
            <div style={{ margin: "1rem", marginTop: "2rem" }}>
              <p className="title">
              Add Capital Gains tax (UK Residential Property)
              </p>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">£</TableCell>
                      <TableCell align="right">£</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getUkResidentialPropertyCapitalGain()?.map((row, i) => {
                      if (i === +1) {
                        return (
                          <TableRow
                            key={row.name}
                            sx={{
                              "& td:last-child": {
                                borderBottom: "2px solid black",
                              },
                            }}
                          >
                            <TableCell component="th" scope="row">
                              {row.description}
                            </TableCell>
                            <TableCell align="right">{row.value1}</TableCell>
                            <TableCell align="right">{row.value2}</TableCell>
                            
                          </TableRow>
                        );
                      }else if (i === +3) {
                        return (
                          <TableRow
                            key={row.name}
                            sx={{
                              "& td:last-child": {
                                borderBottom: "2px solid black",
                              },
                            }}
                          >
                            <TableCell component="th" scope="row">
                              {row.description}
                            </TableCell>
                            <TableCell align="right">{row.value1}</TableCell>
                            <TableCell align="right">{row.value2}</TableCell>
                            
                          </TableRow>
                        );
                      }
                      return (
                        <TableRow
                          key={row.name}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                            "&:nth-last-child(2) td:last-child": {
                              borderBottom: "4px double black",
                              
                            },
                            "&:last-child th": { fontWeight: "bold" },
                          }}
                        >
                          <TableCell component="th" scope="row">
                            {row.description}
                          </TableCell>
                          <TableCell align="right">{row.value1}</TableCell>
                          <TableCell align="right">{row.value2}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
            <div style={{ margin: "1rem", marginTop: "2rem" }}>
              <p className="title">
              Payment Summary
              </p>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">£</TableCell>
                      
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getPaymentSummary()?.map((row, i) => {
                      
                      return (
                        <TableRow
                          key={row.name}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                            
                            "&:last-child th": { fontWeight: "bold" },
                            "&:first-child th": { fontWeight: "bold" },
                          }}
                        >
                          <TableCell component="th" scope="row">
                            {row.description}
                          </TableCell>
                          <TableCell align="right">{row.value}</TableCell>
                          
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </React.Fragment>
        )}
      </Card>
    </div>
  );
};
export default CalculateTax;
