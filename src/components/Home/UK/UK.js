import React from "react";
import logo from "./UK-Map.png";
import './UK.scss'
const UK = () => {
  return (
    <div className="UK">
        <div className="image-wrapper">
        <img src={logo}></img>
        </div>
        <div className="content-wrapper">
        <p className="title is-2">Online Tax Pay In United Kingdom</p>
        <p className="title is-4">Tax online provides the facility to pay your tax from home!</p>
        <p className="subtitle is-5">We give you the options for different type of the tax with reasonable and affordable price. We keep on notifying you with the process of your application, so you do not need to worry on the process. </p>
        <p className="title is-4">Try us today!</p>
        </div>
    </div>
  );
};

export default UK;
