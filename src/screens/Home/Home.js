import axios from "axios";
import lottie from "lottie-web";
import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import Cards from "../../components/Home/Cards/Cards";
import Footer from "../../components/Home/Footer/Footer";
import Hero from "../../components/Home/Hero/Hero";
import UK from "../../components/Home/UK/UK";
import useAuth from "../../hooks/useAuth";
import loadingAnim from "../../static/working.json";
import "./Home.scss";

const Home = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuth();
  const [, setCookie] = useCookies(["client"]);

 

  useEffect(() => {
    if (loading) {
      lottie.loadAnimation({
        container: document.querySelector("#loading"),
        animationData: loadingAnim,
      });
    }
  }, [loading]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

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
          signal: controller.signal,
        };
        setAuth({ accessToken:response1.data.result.token });
        setCookie("client", response1.data.result.token, {
          path: "/",
        });
        setCookie("refreshToken", response1.data.result.token, {
          path: "/"
        });
        const response2 = await axios.get(
          "https://tax.api.cyberozunu.com/api/v1.1/Package",
          config
        );

        setCards(response2.data?.result?.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
        // navigate('/', { state: { from: location }, replace: true });
      }
    };

    getUsers();

    return () => {
        isMounted = false;
        controller.abort();
    }
  }, []);

  return (
    <div className="Home">
      {loading ? (
        <div id="loading" className="loading" />
      ) : (
        <>
          <Hero />
          <Cards list={cards} />
          <UK />
          <Footer />
        </>
      )}
    </div>
  );
};

export default Home;
