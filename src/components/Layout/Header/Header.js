import { AccountCircle } from "@mui/icons-material";
import { Avatar, Button, IconButton, Menu, MenuItem } from "@mui/material";
import React, { useContext, useEffect } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../../context/AuthProvider";
import useAuth from "../../../hooks/useAuth";

import "./Header.scss";

const Header = () => {
  const navigate = useNavigate();
  const { auth, setAuth } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [cookies, setCookie] = useCookies(["user"]);
 
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    
    setAuth({});
    setCookie("user", "", {
      path: "/"
    });
    navigate('/');
  }

  const handleAccount = () => {
    navigate('/account')
  }


  
  

  

  return (
    <div className="Header">
      <div className="desktop">
        <h1 className="title" onClick={()=> navigate('/')}>TaxFill</h1>
        <div className="nav-items">
          {!auth.accessToken ? (
            <div>
              <button
                className="button is-ghost"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
              <button
                className="button is-success is-outlined is-rounded "
                onClick={() => navigate("/signup")}
              >
                Get Started
              </button>
            </div>
          ) : (
            <div>

            <Avatar src="/broken-image.jpg" onClick={handleMenu}/>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleAccount}>Account</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
