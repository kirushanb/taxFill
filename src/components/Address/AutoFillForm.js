import React, { useState, useEffect, useRef } from 'react';
import * as Yup from 'yup';
import { Formik, useFormik, validateYupSchema } from 'formik';
import {
  Box,
  Button,
  FormHelperText,
  Grid,
  TextField,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import GoogleAutoCompelete from './GoogleAutoCompelete';
import GetPostalCode from './GetPostalCode';
import { getQueryStringParam } from '../Dashboard/PackageForms/Employment';


const AutoFillForm = ({
    handleAddress,
    addressComingFrom,
  className,
  setData,
  data,
  ...rest
}) => {
  const [addresses, setAddresses] = useState([]);
  const formRef = useRef();

  const handlechangeWhenAdress = () => {
    handleAddress(formRef?.current?.values);
  
  }
  
  const handleChangeAddress = async (searchValue) => {
    if(!searchValue.target.value){
      return null;
    }
    const results = await GoogleAutoCompelete(searchValue.target.value);
    if (results) {
     
      setAddresses(results);
    }
  }

  const changeAddress = async (value, setFieldValue) => {

        let result = null;
        for(let x = 0; x < addresses.length; x++){
          if(value === addresses[x].description){
            result = await GetPostalCode(addresses[x].place_id);
            // Get Zip code
          }
        }
        if(!result){ return ; }
        setFieldValue('companyAddress', value!==null?value:'');
        let postcode = null;
        for(let i = 0; i < result.address_components.length; i++){
          if(result.address_components[i].types[0] === 'postal_code'){
              postcode = result.address_components[i].long_name;
          }
        }
        setFieldValue('zipCode', postcode!==null?postcode:'');
        // Get city
        let city = null;
        for(let i = 0; i < result.address_components.length; i++){
          if(result.address_components[i].types[0] === 'locality'){
              city = result.address_components[i].long_name;
          }
        }
        if(!city){
          for(let i = 0; i < result.address_components.length; i++){
            if(result.address_components[i].types[0] === 'postal_town'){
                city = result.address_components[i].long_name;
            }
          }
        }
        setFieldValue('city', city!==null?city:'');

        // Get State
        let state = null;
        for(let i = 0; i < result.address_components.length; i++){
          if(result.address_components[i].types[0] === 'administrative_area_level_1'){
            state = result.address_components[i].long_name;
          }
        }
        if(!state){
          for(let i = 0; i < result.address_components.length; i++){
            if(result.address_components[i].types[0] === 'administrative_area_level_2'){
              state = result.address_components[i].long_name;
            }
          }
        }
      setFieldValue('stateOfAddress', state!==null?state:'');
       
        handleAddress(formRef?.current?.values);
  }

	//We can use this function to disable the browser auto complete from the fields because it looks really annoying
  useEffect(() => {
    window.document.querySelector('input[name="companyAddress"]').setAttribute('autocomplete', 'disable');
    window.document.querySelector('input[name="companyAddress"]').setAttribute('aria-autocomplete', 'off');
    window.document.querySelector('input[name="zipCode"]').setAttribute('autocomplete', 'disable');
    window.document.querySelector('input[name="zipCode"]').setAttribute('aria-autocomplete', 'off');
    window.document.querySelector('input[name="city"]').setAttribute('autocomplete', 'disable');
    window.document.querySelector('input[name="city"]').setAttribute('aria-autocomplete', 'off');
    window.document.querySelector('input[name="stateOfAddress"]').setAttribute('autocomplete', 'disable');
    window.document.querySelector('input[name="stateOfAddress"]').setAttribute('aria-autocomplete', 'off');
    
    const packageId = getQueryStringParam("packageId");
    if(packageId){
      if(formRef.current){
        
        formRef.current.setFieldValue(
          "companyAddress",
          addressComingFrom.companyAddress
        );
        formRef.current.setFieldValue(
          "zipCode",
          addressComingFrom.zipCode
        );
        formRef.current.setFieldValue(
          "city",
          addressComingFrom.city
        );
        formRef.current.setFieldValue(
          "stateOfAddress",
          addressComingFrom.stateOfAddress
        );
      }
      
    }
  }, []);

  
  
  return (
    <Formik
      innerRef={formRef}
      enableReinitialize={true}
      initialValues={{
        companyAddress: '',
        zipCode: '',
        city: '',
        stateOfAddress: ''
      }}
    //     validationSchema={Yup.object().shape({
    //     companyAddress: Yup.string().max(255).required('Address is required'),
    //     zipCode: Yup.string().max(255).nullable(),
    //     city: Yup.string().max(255),
    //     stateOfAddress: Yup.string().max(255),
    //   })}
      onSubmit={async (values, {
        setErrors,
        setStatus,
        setSubmitting,
      }) => {
        try {
          console.log(values);
        } catch (err) {
          console.error(err);
          setStatus({ success: false });
          setErrors({ submit: err.message });
          setSubmitting(false);
        }
      }}
    >
      {({
        errors,
        handleBlur,
        handleChange,
        handleSubmit,
        isSubmitting,
        touched,
        values,
        setFieldValue
      }) => (
       
          
            <Grid item xs={12} > 
              <Box  >
                <Grid container spacing={1.5}>
                  <Grid item xs={12}>
                    <Autocomplete
                      options={addresses.map((option) => option.description)}
                      // closeIcon= { () => { return; } }
                      value={values.companyAddress}
                      onInputChange={(event, value) => { changeAddress(value, setFieldValue); }}
                      autoComplete={false}
                      renderInput={(params) => (
                          <TextField {...params} label="Address" name="companyAddress" value={values.companyAddress} onChange={(value) => { handleChangeAddress(value); handlechangeWhenAdress();}} variant="outlined" />
                      )} 
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      error={Boolean(touched.city && errors.city)}
                      fullWidth
                      helperText={touched.city && errors.city}
                      label="City"
                      name="city"
                      onBlur={handleBlur}
                      onChange={(e)=>{handleChange(e); handlechangeWhenAdress();}}
                      value={values.city}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      error={Boolean(touched.stateOfAddress && errors.stateOfAddress)}
                      fullWidth
                      helperText={touched.stateOfAddress && errors.stateOfAddress}
                      label="County"
                      name="stateOfAddress"
                      onBlur={handleBlur}
                      onChange={(e)=>{handleChange(e); handlechangeWhenAdress();}}
                      value={values.stateOfAddress}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      error={Boolean(touched.zipCode && errors.zipCode)}
                      fullWidth
                      helperText={touched.zipCode && errors.zipCode}
                      label="Post Code"
                      name="zipCode"
                      onBlur={handleBlur}
                      onChange={(e)=>{handleChange(e); handlechangeWhenAdress();}}
                      value={values.zipCode}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
                
                {/* {Boolean(touched.tags && errors.tags) && (
                  <Box mt={2}>
                    <FormHelperText error>
                      {errors.tags}
                    </FormHelperText>
                  </Box>
                )} */}
                {/* {Boolean(touched.startDate && errors.startDate) && (
                  <Box mt={2}>
                    <FormHelperText error>
                      {errors.startDate}
                    </FormHelperText>
                  </Box>
                )} */}
                {/* {Boolean(touched.endDate && errors.endDate) && (
                  <Box mt={2}>
                    <FormHelperText error>
                      {errors.endDate}
                    </FormHelperText>
                  </Box>
                )} */}
              </Box>
            </Grid>
          
       
      )}
    </Formik>
  );
};

export default AutoFillForm;