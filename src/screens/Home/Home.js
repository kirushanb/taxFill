import React, { useEffect, useState } from "react";
import "./Home.scss";
import reactLogo from "../../static/react-logo.json";
import Hero from "../../components/Home/Hero/Hero";
import Cards  from "../../components/Home/Cards/Cards";
import UK from "../../components/Home/UK/UK";
import Footer from "../../components/Home/Footer/Footer";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import lottie from "lottie-web";
import loadingAnim from "../../static/working.json";


const Home = () => {


  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();


 useEffect(() => {
    if(loading){
      lottie.loadAnimation({
        container: document.querySelector("#loading"),
        animationData: loadingAnim,
      });
    }
  }, [loading]);

  
  useEffect(() => {
    
      // let isMounted = true;
      // const controller = new AbortController();
      
      const getUsers = async () => {
        setLoading(true);
          try {
              const response1 = await axios.get('https://tax.api.cyberozunu.com/api/v1.1/Authentication/Client-token?id=474FA9DA-28DB-4635-B666-EB5B6C662537&key=uwODmcIAA0e2dwKD8ifprQ%3D%3D',{headers: {"Access-Control-Allow-Origin": "*"}});
              const config = {
                headers: { Authorization: `Bearer ${response1.data.result.token}`, "Access-Control-Allow-Origin": "*" }  
            };
              const response2 = await axios.get('https://tax.api.cyberozunu.com/api/v1.1/Package',config);
             
              setCards(response2.data?.result?.data)
              setLoading(false);
          } catch (err) {
           
              console.error(err);
              setLoading(false);
              // navigate('/', { state: { from: location }, replace: true });
          }
      }

      getUsers();
     

      // return () => {
      //     isMounted = false;
      //     controller.abort();
      // }
  }, [])

  return (
    <div className="Home">
     { loading?
      <div id="loading" className="loading" /> :
      <><Hero/>
      <Cards list={cards}/>
      <UK/>
      <Footer/></> }
    </div>
  );
};

export default Home;
