import axios from "axios";
import React, { useEffect, useState } from "react";
import "./SelectPlan.scss";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import lottie from "lottie-web";
import loadingAnim from "../../../static/loading.json";
import { CircularProgress } from "@mui/material";
const SelectPlan = (props) => {
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = React.useState(false);

  // React.useEffect(() => {
  //   if(loading){
  //     lottie.loadAnimation({
  //       container: document.querySelector("#loading-plan"),
  //       animationData: loadingAnim,
  //     });
  //   }
    
    
  // }, [loading]);

  useEffect(async() => {
   
    // let isMounted = true;
    // const controller = new AbortController();

    const getUsers = async () => {
      setLoading(true);
      try {
        const response1 = await axios.get(
          "https://tax.api.cyberozunu.com/api/v1.1/Authentication/Client-token?id=474FA9DA-28DB-4635-B666-EB5B6C662537&key=uwODmcIAA0e2dwKD8ifprQ%3D%3D",
          { headers: { "Access-Control-Allow-Origin": "*" } }
        );
        const config = {
          headers: {
            Authorization: `Bearer ${response1.data.result.token}`,
            "Access-Control-Allow-Origin": "*",
          },
        };
        const response2 = await axios.get(
          "https://tax.api.cyberozunu.com/api/v1.1/Package",
          config
        );
          
        setList(response2.data?.result?.data);
        setLoading(false)
      } catch (err) {
        console.error(err);
        setLoading(false)
      }
    };

    await getUsers();
   
    // return () => {
    //   isMounted = false;
    //   controller.abort();
    // };
  }, []);


  const handleSelected = (item) => {
  
    if(selected.includes(item)){
      const filtered = [...selected].filter(n => n.name!== item.name)
      setSelected(filtered)
      props.handleSelect(filtered)
    }else{
      setSelected([...selected,item])
      props.handleSelect([...selected,item])
    }
   
  }
 
  return (
    <div className="SelectPlan">
      {loading? <CircularProgress />:
      <>
      {list.map((n) => (
        <div key={n.name} className="card" onClick={()=>handleSelected(n)} style={{background: selected.find( single => single['name'] === n.name )?"rgba(1,121,107,0.4)":""}}>
          <span className="icon-text">
            <span className="icon">
              <CheckCircleOutlineIcon style={{color: selected.find( single => single['name'] === n.name )?"green":""}}/>
            </span>
          </span>
          <div className="card-content">
            <div className="content">
              <p className="title is-5">{n.name}</p>
              <p className="title is-5">{"£" + n.price}</p>
            </div>
          </div>
        </div>
      ))}</>}
    </div>
  );
};

export default SelectPlan;
