import React from 'react'
import Header from './Header/Header'
import "./Layout.scss"

const Layout = ({children}) => {
  return (
    <div className='Layout'>
        <Header></Header>
        <div className='layout-body-component'>{children}</div>
    </div>
   
  )
}

export default Layout