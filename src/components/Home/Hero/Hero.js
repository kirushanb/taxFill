import React from "react";
import "./Hero.scss";
import lottie from "lottie-web";
import reactLogo from "../../../static/react-logo.json";
import { useNavigate } from "react-router-dom";

const list = [
  "Create your profile",
  "Select the packages & Pay online",
  "Submit the documents",
  "Get your work done",
];

const Hero = () => {
    let navigate = useNavigate();
  React.useEffect(() => {
    lottie.loadAnimation({
      container: document.querySelector("#tax-logo"),
      animationData: reactLogo,
    });
  }, []);

  return (
    <div className="Hero">
      <div id="tax-logo" className="tax-logo" />
      <div className="content">
        <h1 className="title is-1">Apply For Online Tax</h1>
        <h3 className="subtitle is-3">
          Tired of contacting an accountant and carrying documents? Try us and
          do your tax with few simple steps
        </h3>
        <div className="list">
          {list.map((n) => (
            <span key={n} className="icon-text">
              <span className="icon is-large">
                <i className="fas fa-arrow-right"></i>
              </span>
              <p className="subtitle is-4">{n}</p>
            </span>
          ))}
        </div>
        <button className="button is-large is-success is-rounded" onClick={()=>navigate('/signup')}><p>Get Started</p><span className="icon is-large">
                <i className="fas fa-arrow-right"></i>
              </span></button>
      </div>
    </div>
  );
};

export default Hero;
