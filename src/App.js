import { useEffect } from "react";
import { useCookies } from "react-cookie";
import { Navigate, Route, Router, Routes } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout/Layout";
import OTP from "./components/Login/OTP/OTP";
import useAuth from "./hooks/useAuth";
import useRefreshToken from "./hooks/useRefreshToken";
import Home from "./screens/Home/Home";
import Login from "./screens/Login/Login";
import Signup from "./screens/Signup/Signup";
import Dashboard from "./components/Dashboard/Dashboard";
import AddNew from "./components/Dashboard/AddNew/AddNew";
import PaymentSuccess from "./components/Dashboard/AddNew/PaymentSuccess";
import PaymentFilure from "./components/Dashboard/AddNew/PaymentFilure";
import RequireAuth from "./util/RequireAuth";
import SelectPackage from "./components/Dashboard/SelectPackage/SelectPackage";
import Employment from "./components/Dashboard/PackageForms/Employment";
import SelfEmployment from "./components/Dashboard/PackageForms/SelfEmployment";
import Pension from "./components/Dashboard/PackageForms/Pension";


function App() {
  const [cookies, setCookie] = useCookies();
  const { setAuth } = useAuth();

  useEffect(() => {
    if (cookies.user) {
      setAuth({ accessToken: cookies.user });
    }
  }, []);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <Home />
          </Layout>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/otp" element={<OTP />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<RequireAuth />}>
        <Route path="/account" element={<Dashboard />} />
      </Route>
      <Route element={<RequireAuth />}>
        <Route
          path="/addnew"
          element={
            <Layout>
              <AddNew />
            </Layout>
          }
        />
      </Route>

      <Route element={<RequireAuth />}>
        <Route
          path="/success"
          element={
            <Layout>
              <PaymentSuccess />
            </Layout>
          }
        />
      </Route>
      <Route element={<RequireAuth />}>
        <Route
          path="/fail"
          element={
            <Layout>
              <PaymentFilure />
            </Layout>
          }
        />
      </Route>

      <Route path="*" element={<RequireAuth />}>
        <Route
          path="select"
          element={
            <Layout>
              <SelectPackage />
            </Layout>
          }
        >
          <Route
            path=":orderId"
            element={
              <Layout>
                <SelectPackage />
              </Layout>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/select" replace />} />
      </Route>
      {/* <Route path="/select" element={<Layout><SelectPackage /></Layout>} /> */}

      <Route path="*" element={<RequireAuth />}>
        <Route
          path="employment"
          element={
            <Layout>
              <Employment />
            </Layout>
          }
        >
          <Route
            path=":orderId"
            element={
              <Layout>
                <Employment />
              </Layout>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/employment" replace />} />
      </Route>

      <Route path="*" element={<RequireAuth />}>
        <Route
          path="selfemployment"
          element={
            <Layout>
              <SelfEmployment />
            </Layout>
          }
        >
          <Route
            path=":orderId"
            element={
              <Layout>
                <SelfEmployment />
              </Layout>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/selfemployment" replace />} />
      </Route>

      <Route path="*" element={<RequireAuth />}>
        <Route
          path="pensionincome"
          element={
            <Layout>
              <Pension />
            </Layout>
          }
        >
          <Route
            path=":orderId"
            element={
              <Layout>
                <Pension />
              </Layout>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/pensionincome" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
