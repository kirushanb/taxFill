import * as React from "react";
import { styled } from "@mui/material/styles";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import SelectPlan from "./SelectPlan";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import "./StepWizard.scss";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { ReactComponent as StripeIcon } from "./img/stripe.svg";
import { ReactComponent as VisaIcon } from "./img/visa.svg";
import { ReactComponent as MasterIcon } from "./img/master.svg";
import StripePaymentForm from "../../Payment/StripePaymentForm";
import axios from "../../../api/axios";
import { useNavigate } from "react-router-dom";
import lottie from "lottie-web";
import loadingAnim from "../../../static/working.json";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useCookies } from "react-cookie";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";

const Accordion = styled((props) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  "&:not(:last-child)": {
    borderBottom: 0,
  },
  "&:before": {
    display: "none",
  },
}));

const AccordionSummary = styled((props) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: "0.9rem" }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, .05)"
      : "rgba(0, 0, 0, .03)",
  flexDirection: "row-reverse",
  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
    transform: "rotate(90deg)",
  },
  "& .MuiAccordionSummary-content": {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: "1px solid rgba(0, 0, 0, .125)",
}));

export default function StepWizard() {
  const [expanded1, setExpanded1] = React.useState("panel1");
  const [expanded2, setExpanded2] = React.useState("panel2");
  const [expanded3, setExpanded3] = React.useState("panel3");
  const [price, setPrice] = React.useState(0);
  const [selectedlist, setSelectedlist] = React.useState([]);
  const [checkedEmail, setCheckedEmail] = React.useState(false);
  const [checkedSMS, setCheckedSMS] = React.useState(false);
  const [payment, setPayment] = React.useState("");
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [cookies, setCookie] = useCookies(["payment"]);
  const handleChange1 = (panel) => (event, newExpanded) => {
    setExpanded1(newExpanded ? panel : false);
  };
  const handleChange2 = (panel) => (event, newExpanded) => {
    setExpanded2(newExpanded ? panel : false);
  };
  const handleChange3 = (panel) => (event, newExpanded) => {
    setExpanded3(newExpanded ? panel : false);
  };

  React.useEffect(() => {
    if(loading){
      lottie.loadAnimation({
        container: document.querySelector("#loading"),
        animationData: loadingAnim,
      });
    }
    
    
  }, [loading]);


  const handleSelect = (selected) => {
   
    setPrice(selected.reduce((previousValue, currentValue) => previousValue + currentValue.price,
    0));
    setSelectedlist(selected)
  }

  const handleAddAmount = (amount) => {
    
    setPrice(price+amount)
  }

  const handleCheckout = async() => {
    if(selectedlist.length === 0){
      return
    }else if(!checkedEmail && !checkedSMS){
      return
    }else if(!payment){
      return
    }

    setLoading(true)
    try {
     
      const response = await axiosPrivate.post("Stripe/create-session",null,{ params: {
        amount: price,
        cancelUrl: "https://tax-fill.web.app/fail",
        successUrl: "https://tax-fill.web.app/success",
      },
     
    }
      );
      console.log(response?.data.result.response.url);
      console.log(response?.data.result.response)
      setCookie("payment", {response:{id:response?.data.result.response.id,payment_intent:response?.data.result.response.payment_intent},selectedlist:selectedlist,checkedEmail,checkedSMS}, {
        path: "/"
      });
      setPrice(0);
      setSelectedlist([]);
      //console.log(JSON.stringify(response));
      const url = response?.data.result.response.url;
      window.location.href=url;
      
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
  }
  setLoading(false)
  }

  const handleSelectPayment = (method) => {
    setPayment(method)
  }
 
  return (
    <div className="StepWizard">
      {loading?<div id="loading" className="loading" />:
      <>
      <div>
       
        <Accordion
          expanded={expanded1==="panel1"}
          onChange={handleChange1("panel1")}
        >
          <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
            <Typography>Select a plan that works for you:</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ width: "max-content" }}>
            <SelectPlan handleSelect={handleSelect}/>
          </AccordionDetails>
        </Accordion>
        <Accordion
        expanded={expanded2==="panel2"}
        onChange={handleChange2("panel2")}
        >
          <AccordionSummary aria-controls="panel2d-content" id="panel2d-header">
            <Typography>
              Select your preffered method of prgress notification:
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox checked={checkedEmail}/>}
                label={
                  <div className="second-accordian">
                    <h6 className="title is-6">Via Email</h6>
                    <h6 className="title is-6 free">Free of cost</h6>
                  </div>
                }
                onChange={(e)=>{setCheckedEmail(e.target.checked);
                }}
              />
              <FormControlLabel
                control={<Checkbox  checked={checkedSMS}/>}
                label={
                  <div className="second-accordian">
                    <h6 className="title is-6">Via SMS</h6>
                    <h6 className="title is-6 cost">{"+£5"}</h6>
                  </div>
                }
                onChange={(e)=>{setCheckedSMS(e.target.checked);
                         
                    if(e.target.checked){
                      handleAddAmount(+5);
                    }else{
                      handleAddAmount(-5);
                    }
                 
                }}
              />
            </FormGroup>
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded3==="panel3"}
          onChange={handleChange3("panel3")}
        >
          <AccordionSummary aria-controls="panel3d-content" id="panel3d-header">
            <Typography>Select your preffered method of payment</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div className="box">
              <span className="icon-text">
                <p className="title is-5">Stripe</p>
                <span className="icon fa-lg">
                  <StripeIcon />
                </span>
                <span className="icon fa-lg">
                  <VisaIcon />
                </span>
                <span className="icon fa-lg">
                  <MasterIcon />
                </span>
              </span>
              {payment === 'stripe' && <CheckCircleOutlineIcon style={{color: "green"}}/>}
              <button className="button is-success is-rounded" onClick={()=>handleSelectPayment('stripe')}>Select</button>
            </div>
            <div className="box">
              <span className="icon-text">
                <p className="title is-5">Bank Transfer</p>
                <span className="icon">
                  <AccountBalanceIcon />
                </span>
               
              </span>
              {payment === 'bank' && <CheckCircleOutlineIcon style={{color: "green"}}/>}
              
              <button className="button is-success is-rounded" onClick={()=>handleSelectPayment('bank')}>Select</button>
            </div>
          </AccordionDetails>
        </Accordion>
      </div>
      <div className="cart">
        <article className="message is-dark">
          <div className="message-header">
            <p>Total cost of your plan</p>
          </div>
          <div className="message-body">
            <div className="total-wrapper">
              {selectedlist.map(n=>
              <div className="total" key={n.name}><p className="title is-6">{n.name}</p><p className="title is-6">{"£" + n.price}</p></div>
                 
                )}
                {checkedEmail && 
                              <div className="total"><p className="title is-6">{"Email notitification"}</p><p className="title is-6 free">{"Free of cost"}</p></div>

                }
                {checkedSMS && 
                              <div className="total"><p className="title is-6">{"SMS notitification"}</p><p className="title is-6">{"£5"}</p></div>

                }
                <div className="total-last">
                <p className="title is-5">Total</p><p className="title is-5">{"£" + price}</p>
                </div>
           
            </div>
         
          <button className="button is-medium is-fullwidth is-success" onClick={handleCheckout}>Checkout</button>
          </div>
        </article>
      </div></>}
    </div>
  );
}
