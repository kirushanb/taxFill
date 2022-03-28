import React, { useEffect } from 'react'
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import './PaymentFilure.scss'

const PaymentFilure = () => {
  const [cookies, setCookie,removeCookie] = useCookies(["payment"]);
  const navigate = useNavigate();
  useEffect( () => {
   
    if(cookies.payment){
      removeCookie("payment");
      navigate("/account")
    }
    if(!cookies.payment){
      navigate("/account")
    }

  },[])

  return (
    <div className="Result">
    <div className="ResultTitle" role="alert">
      Payment not successful, Please try again!
    </div>
    <div className="ResultMessage">
      {/* Thanks for trying Stripe Elements. No money was charged, but we
      generated a PaymentMethod: {"paymentMethod.id"} */}
    </div>
    {/* <ResetButton onClick={reset} /> */}
  </div>
  )
}

export default PaymentFilure