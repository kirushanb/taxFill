import { CircularProgress } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../../api/axios';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import './SelectPackage.scss';

const SelectPackage = () => {
    const [list, setList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const [cookies, setCookie, removeCookie] = useCookies();
    const navigate = useNavigate();
    const params = useParams();
    const axiosPrivate = useAxiosPrivate();
 
    useEffect(() => {
        setIsLoading(true);
        if(params.orderId){ 
            const getData = async () => {
                try {
                   
                    const response = await axiosPrivate.get(`https://tax.api.cyberozunu.com/api/v1.1/Order/${params.orderId}`);
                  
                   
                   
                   const responseAll=await Promise.all(
                   response.data.result.selectedPackages.map(l=>l.packageId).map(async(element) => {
                    const response2=await axiosPrivate.get(`https://tax.api.cyberozunu.com/api/v1.1/Package/${element}`);
                    return response2;
                   })
                   )
                   
                   setList(responseAll.map(l=> {
                       return({package: l.data.result});
                   }))
                   setIsLoading(false);
                } catch (err) {
                 
                    console.error(err);
                    // navigate('/', { state: { from: location }, replace: true });
                    setIsLoading(false);
                }
            }
          
        getData();
          
        }else if(cookies.order){
            setList(cookies.order.selectedPackages)
            setIsLoading(false);
        }else{
           
            navigate('/account')
        }
        
    
         
      }, [])
    
  return (
    <div className="SelectPackage">
         <p className="title is-3 header">Choose a package to continue: </p>
        <div className='content-wrapper'>
 <div className='cards-grid'>
 {isLoading? <CircularProgress />:
 <>
    {list.map(n=>
        <div key={n.package.name} className='single-card' onClick={()=> params.orderId?navigate(`/${(n.package.name).toLowerCase().replace(/\s/g, '')}/${params.orderId}`) : navigate(`/${(n.package.name).toLowerCase().replace(/\s/g, '')}`)}>
            <span className="icon is-large">
            <i className="fas fa-lg fa-home"></i>
            </span>
            <div className='sigle-card-content'> 
                <p className="title is-4">{n.package.name}</p>
                
           
            </div>
          
           
        </div>
        )}
        </>}
</div>

    </div>
    <button className="button is-success is-rounded footer-button" onClick={()=> navigate('/account')}>Or Later<span className="icon">
    <i className="fas fa-arrow-right"></i>
  </span></button>
        </div>
  )
}

export default SelectPackage