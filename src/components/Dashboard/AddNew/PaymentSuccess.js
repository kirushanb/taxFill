import React, { useEffect } from 'react'
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import axios from '../../../api/axios';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import './PaymentSuccess.scss'

const PaymentSuccess = () => {
  const [cookies, setCookie, removeCookie] = useCookies(["order"]);
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  useEffect(async () => {
   
    if(cookies.payment){
      const responseSaved= cookies.payment.response;
      const selectedList= cookies.payment.selectedlist;
      
      try {
       
        const response = await axiosPrivate.post("/Order",
       { sessionId:responseSaved.id, 
          paymentIntentId: responseSaved.payment_intent,
          smsNotificationActivated: cookies.payment.checkedEmail,
          emailNotificationActivated: cookies.payment.checkedSMS,
          selectedPackages: [...selectedList.map(n=>{
          return({packageId:n.id});
          })]
          }
        );
        
        // console.log(response?.data.result);
        const oderId = response?.data?.result?.id;
        const selectedPackages=response?.data?.result?.selectedPackages.map(n=> {
          return({package:n.package})});
        // console.log(selectedPackages);
        setCookie("order", {oderId, selectedPackages}, {
          path: "/"
        });
        removeCookie("payment");
        navigate("/select")
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
    }else{
      navigate("/account")
    }
  },[])

  return (
    <div className="Result">
    <div className="ResultTitle" role="alert">
      Payment successful
    </div>
    <div className="ResultMessage">
      {/* Thanks for trying Stripe Elements. No money was charged, but we
      generated a PaymentMethod: {"paymentMethod.id"} */}
    </div>
    {/* <ResetButton onClick={reset} /> */}
  </div>
  )
}

export default PaymentSuccess