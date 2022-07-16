import { AccountCircle } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import MenuIcon from "@mui/icons-material/Menu";
import { Menu, MenuItem } from "@mui/material";
import MuiAppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import MuiDrawer from "@mui/material/Drawer";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./Dashboard.scss";
import DataTable from "./DataTable";
import { mainListItems } from "./routes";


const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

function DashboardContent() {
  const [open, setOpen] = React.useState(false);
  const [auth, setAuth] = React.useState(true);
  const [anchorEl, setAnchorEl] = React.useState(null);
  
  const navigate = useNavigate();

  const [cookies, setCookie, removeCookie] = useCookies(["user"]);


  

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const toggleDrawer = () => {
    setOpen(!open);
  };

 

  const handleLogout = () => {
    // toast("User Logged Out Successfully");
    setAuth({});
    setCookie("user", "", {
      path: "/"
    });
    setCookie("refreshToken", "", {
      path: "/"
    });
  //  window.location.href='/'
  }
  React.useEffect( () => {
   
    if(cookies.order){
      removeCookie("order");
   
    }
   

  },[cookies.order, removeCookie])
  
 
  return (
    <>
      <Box sx={{ display: "flex" }}>
      <ToastContainer />
        <CssBaseline />
        <AppBar
          position="absolute"
          open={open}
          style={{ background: "#2a2d3e" }}
        >
          <Toolbar
            sx={{
              pr: "24px", // keep right padding when drawer closed
            }}
          >
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                marginRight: "36px",
                ...(open && { display: "none" }),
              }}
            >
              <MenuIcon />
            </IconButton>
            {
              <Typography
                component="h1"
                variant="h6"
                color="inherit"
                noWrap
                sx={{ flexGrow: 1, cursor:"pointer" }}
                onClick={()=> navigate('/')}
              >
                TaxFill
              </Typography>
            }
            {auth && (
              <div>
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  {/* <MenuItem onClick={handleProfile}>Profile</MenuItem> */}
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </div>
            )}
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open} style={{ border: "#2a2d3e" }}>
          <Toolbar
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              px: [1],
            }}
            style={{ background: "#2a2d3e", borderColor: "#2a2d3e" }}
          >
            {/* {open && 
            <Typography
          component="h1"
          variant="h6"
          color="white"
          noWrap
          sx={{ flexGrow: 1 }}
          
        >
           TaxFill
        </Typography>} */}
            <IconButton onClick={toggleDrawer} onMouseEnter={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          {/* <Divider /> */}
          <List component="nav" sx={{ padding: 1, marginTop: "1.5rem" }}>
            {mainListItems}
            {/* <Divider sx={{ my: 1 }} /> */}
            {/* {secondaryListItems} */}
          </List>
        </Drawer>
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === "light"
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: "100vh",
            overflow: "auto",
          }}
        >
          <Toolbar />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={12} lg={12}>
                <Paper
                  sx={{
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "1rem",
                  }}
                >
                  <div className="header-button">
                    <p className="title is-4">Past Orders</p>
                    <button className="button is-success" onClick={()=>navigate('/addnew')}>
                      <AddIcon />
                      Add New
                    </button>
                  </div>
                  <div className="data-table">
                    <DataTable />
                    
                    
                    
                  </div>
                </Paper>
              </Grid>

              {/* <Grid item xs={12} md={4} lg={3}>
                <Paper
                  sx={{
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    height: "82vh",
                    borderRadius: "1rem",
                  }}
                >
                  <PieChartComponent/> */}
                  {/* <Deposits /> */}
                {/* </Paper>
              </Grid> */}
              {/* Recent Orders */}
            </Grid>
            {/* <Copyright sx={{ pt: 4 }} /> */}
          </Container>
        </Box>
      </Box>
    </>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}
