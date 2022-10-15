import React, { useEffect } from 'react'
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import './PaymentSuccess.scss'

const PaymentSuccess = () => {
  const [cookies, setCookie, removeCookie] = useCookies(["order"]);
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
          taxYear: cookies.payment.taxYear ? parseInt(cookies.payment.taxYear) : 0,
          selectedPackages: [...selectedList.map(n=>{
          return({packageId:n.id});
          })]
          }
        );
       
        const taxYear = response?.data?.result?.taxYear;
        const oderId = response?.data?.result?.id;
        const selectedPackages=response?.data?.result?.selectedPackages.map(n=> {
          return({package:n.package})});
        setCookie("order", {oderId, selectedPackages,taxYear}, {
          path: "/"
        });
        removeCookie("payment");
        navigate("/select")
    } catch (err) {
        console.log(err);
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