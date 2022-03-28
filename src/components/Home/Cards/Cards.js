import React from 'react'
import { useNavigate } from 'react-router-dom';
import './Cards.scss'
import Content from './Content/Content';


const Cards = (props) => {
  const navigate = useNavigate();
  return (
    <div className='Cards'>
        <p className="title is-3">Get rid of manual process and get your tax process automated!</p>
        <Content list={props.list}/>

        <button onClick={()=> navigate("/signup")} className="button is-warning is-medium "><p>Signup</p><span className="icon is-large">
                <i className="fas fa-arrow-right"></i>
              </span></button>
       
        
        
    </div>
  )
}

export default Cards;
