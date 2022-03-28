import React from "react";
import "./Footer.scss";
import lottie from "lottie-web";
import logo1 from "../../../static/logo1.json";
import logo2 from "../../../static/logo2.json";

import logo3 from "../../../static/logo3.json";

import logo4 from "../../../static/logo4.json";

const Footer = () => {
  React.useEffect(() => {
    lottie.loadAnimation({
      container: document.querySelector("#logo1"),
      animationData: logo1,
    });
    lottie.loadAnimation({
      container: document.querySelector("#logo2"),
      animationData: logo4,
    });
    lottie.loadAnimation({
      container: document.querySelector("#logo3"),
      animationData: logo3,
    });
  }, []);

  return (
    <div className="Footer">
      <div className="item">
        <div id="logo3" className="logo" />
        <p className="title is-5">Apply for Tax from  anywhere with easy</p>
      </div>
      <div className="item">
        <div id="logo2" className="logo" />
        <p className="title is-5">Get notified on the process of application</p>
      </div>
      <div className="item">
        <div id="logo1" className="logo" />
        <p className="title is-5">Affordable price</p>
      </div>
    </div>
  );
};

export default Footer;
