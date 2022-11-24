import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TreeItem from "@mui/lab/TreeItem";
import TreeView from "@mui/lab/TreeView";
import { CircularProgress } from "@mui/material";
import lottie from "lottie-web";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import loadingAnim from "../../../static/working.json";
import { getQueryStringParam } from '../PackageForms/Employment';
import "./EditPackage.scss";
const defaultPackages = [
  "Employment",
  "Self employment",
  "Pension Income",
  "Partnership",
  "Rental Income",
  "Dividend",
  "Bank interest",
  "Capital gain"
];
const EditPackage = () => {
  const [list, setList] = useState([[]]);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deletepackage, setDeletepackage] = useState("");
  const [deletepackageId, setDeletepackageId] = useState("");
  const navigate = useNavigate();
  const params = useParams();
  const axiosPrivate = useAxiosPrivate();
  const reference = getQueryStringParam("reference");
  useEffect(() => {
    const element = document.querySelector("#loading");
    if (element) {
      lottie.loadAnimation({
        container: element,
        animationData: loadingAnim,
        renderer: "svg", // "canvas", "html"
        loop: true, // boolean
        autoplay: true, // boolean
      });
    }
  }, [loading]);

  const getData = useCallback( async () => {
    setIsLoading(true);
    try {
      const response = await axiosPrivate.get(
        `https://tax.api.cyberozunu.com/api/v1.1/Order/${params.orderId}`
      );
      setList(response.data.result);

      setIsLoading(false);
    } catch (err) {
      console.error(err);
      // navigate('/', { state: { from: location }, replace: true });
      setIsLoading(false);
    }
  },[params.orderId, axiosPrivate]);

  useEffect(() => {
    if (params.orderId) {
      getData();
    } else {
      navigate("/account");
    }
  }, [getData, navigate, params.orderId ]);

  
  const hanclickEdit = (id, packageName) => {
    navigate(
      `/${packageName.toLowerCase().replace(/\s/g, "")}/${
        params.orderId
      }/?packageId=${id}&reference=${reference}`
    );
  };

  const handleAdd = (packageName) => {
    navigate(
      `/${packageName.toLowerCase().replace(/\s/g, "")}/${params.orderId}/?reference=${reference}`
    );
  };

  const hanclickDelete = (id, packageName) => {
    setDeletepackage(packageName);
    setDeletepackageId(id);
    setDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      if (deletepackage.toLowerCase().replace(/\s/g, "") === "employment") {
        await axiosPrivate.delete(
          `https://tax.api.cyberozunu.com/api/v1.1/EmploymentDetail/${deletepackageId}`
        );
      } else if (
        deletepackage.toLowerCase().replace(/\s/g, "") === "selfemployment"
      ) {
        await axiosPrivate.delete(
          `https://tax.api.cyberozunu.com/api/SelfEmployment/${deletepackageId}`
        );
      } else if (
        deletepackage.toLowerCase().replace(/\s/g, "") === "pensionincome"
      ) {
        await axiosPrivate.delete(
          `https://tax.api.cyberozunu.com/api/v1.1/Pension/${deletepackageId}`
        );
      } else if (
        deletepackage.toLowerCase().replace(/\s/g, "") === "partnership"
      ) {
        await axiosPrivate.delete(
          `https://tax.api.cyberozunu.com/api/v1.1/Partnership/${deletepackageId}`
        );
      } else if (
        deletepackage.toLowerCase().replace(/\s/g, "") === "rentalincome"
      ) {
        await axiosPrivate.delete(
          `https://tax.api.cyberozunu.com/api/v1.1/RentalIncome/${deletepackageId}`
        );
      } else if (
        deletepackage.toLowerCase().replace(/\s/g, "") === "dividend"
      ) {
        await axiosPrivate.delete(
          `https://tax.api.cyberozunu.com/api/v1.1/Dividend/${deletepackageId}`
        );
      }else if (
        deletepackage.toLowerCase().replace(/\s/g, "") === "bankinterest"
      ) {
        await axiosPrivate.delete(
          `https://tax.api.cyberozunu.com/api/v1.1/BankDetail/${deletepackageId}`
        );
      }else if (
        deletepackage.toLowerCase().replace(/\s/g, "") === "capitalgain"
      ) {
        await axiosPrivate.delete(
          `https://tax.api.cyberozunu.com/api/v1.1/CapitalGain/${deletepackageId}`
        );
      }
      
      toast.success(`Package deleted successfully`);
      setLoading(false);
      setDeleteModal(false);
      setDeletepackage("");
      setDeletepackageId("");
      getData();
    } catch (err) {
      console.error(err);
      setLoading(false);
      setDeleteModal(false);
      setDeletepackage("");
      setDeletepackageId("");
      if (err.response.data.isError) {
        toast.error(err.response.data.error.detail);
      }
    }
  };

  return (
    <React.Fragment>
      {loading ? (
        <React.Fragment>
          {loading && (
            <div className="EditPackage">
              <div id="loading" className="loading" />
            </div>
          )}
        </React.Fragment>
      ) : (
        <div className="EditPackage">
          <div className="back-button" onClick={()=> navigate("/account")}>
          <ArrowBackIosNewIcon className="back-icon"/><h5 className="title is-5">Back</h5>
          </div>
         
          <p className="title is-3 header">Choose a document to edit: </p>
          <div className="content-wrapper-1">
            <div className="cards-grid-1 container">
              {isLoading ? (
                <CircularProgress />
              ) : (
                <>
                  <TreeView
                    aria-label="file system navigator"
                    defaultCollapseIcon={<ExpandMoreIcon />}
                    defaultExpandIcon={<ChevronRightIcon />}
                    sx={{
                      // height: "100vh",
                      flexGrow: 1,
                      width: "100%",
                      // overflowY: "auto",
                      textAlign: "left",
                    }}
                    
                  >
                    {defaultPackages.map((l, i) => {
                      if (i === 0) {
                        return (
                          <TreeItem
                           nodeId={l + "-" + i+0+"-"}
                           key={l + "-" + i+0+"-"}
                            label={
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                                // key={l + "-" + i+"-"}
                              >
                                <p
                                  style={{
                                    padding: "0.5rem",
                                    margin: "0.5rem",
                                  }}
                                  className="title is-3 package-title"
                                >
                                  {l +
                                    "  " +
                                    "(" +
                                    list["employmentDetails"]?.length +
                                    ")"}
                                </p>
                                {list?.selectedPackages?.find(n=> n.package.name==="Employment") && <button
                                  className="button is-warning"
                                  onClick={() => handleAdd(l)}
                                  style={{ marginRight: "1rem" }}
                                >
                                  Add
                                </button>}
                              </div>
                            }
                          >
                            {list["employmentDetails"]?.map((p, v) => (
                              <TreeItem
                                className="test"
                                nodeId={p.name + "-" + v}
                                key={p.name + "-" + v}
                                label={
                                  <div
                                    // key={p.name + "-" + v + "-"}
                                    className="sigle-line"
                                  >
                                    <p
                                      style={{
                                        padding: "0.5rem",
                                        margin: "0.5rem",
                                      }}
                                      className="subtitle is-5 information-title"
                                    >
                                      {v + 1 + ". " + p.name}
                                    </p>{" "}
                                    <div>
                                      <button
                                        className="button is-success"
                                        onClick={() => hanclickEdit(p.id, l)}
                                        style={{ marginRight: "1rem" }}
                                      >
                                        Edit
                                      </button>{" "}
                                      <button
                                        className="button is-danger"
                                        onClick={() => hanclickDelete(p.id, l)}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                }
                              />
                            ))}
                          </TreeItem>
                        );
                      } else if (i === 1) {
                        return (
                          <TreeItem
                          nodeId={l + "-" + i+1+"-"}
                          key={l + "-" + i+1+"-"}
                            label={
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                                // key={l + "-" + i+"-"}
                              >
                                <p
                                  style={{
                                    padding: "0.5rem",
                                    margin: "0.5rem",
                                  }}
                                  className="title is-3 package-title"
                                >
                                  {l +
                                    "  " +
                                    "(" +
                                    list["selfEmploymentDetails"]?.length +
                                    ")"}
                                </p>
                                {list?.selectedPackages?.find(n=> n.package.name==="Self employment") && <button
                                  className="button is-warning"
                                  onClick={() => handleAdd(l)}
                                  style={{ marginRight: "1rem" }}
                                >
                                  Add
                                </button>}
                              </div>
                            }
                          >
                            {list["selfEmploymentDetails"]?.map((p, v) => (
                              <TreeItem
                                nodeId={p.name + "-" + v}
                                key={p.name + "-" + v}
                                label={
                                  <div
                                    // key={p.name + "-" + v + "-"}
                                    className="sigle-line"
                                  >
                                    <p
                                      style={{
                                        padding: "0.5rem",
                                        margin: "0.5rem",
                                      }}
                                      className="subtitle is-5 information-title"
                                    >
                                      {v + 1 + ". " + p.name}
                                    </p>
                                    <div>
                                      {" "}
                                      <button
                                        className="button is-success"
                                        onClick={() => hanclickEdit(p.id, l)}
                                        style={{ marginRight: "1rem" }}
                                      >
                                        Edit
                                      </button>{" "}
                                      <button
                                        className="button is-danger"
                                        onClick={() => hanclickDelete(p.id, l)}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                }
                              />
                            ))}
                          </TreeItem>
                        );
                      } else if (i === 2) {
                        return (
                          <TreeItem
                          nodeId={l + "-" + i+2+"-"}
                          key={l + "-" + i+2+"-"}
                            label={
                              <div style={{display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'space-between', alignItems:"center"}}
                          // key={l + "-" + i+"-"}
                          >
                              <p
                                style={{ padding: "0.5rem", margin: "0.5rem" }}
                                className="title is-3 package-title"
                              >
                                {l +
                                  "  " +
                                  "(" +
                                  list["pensionDetails"]?.length +
                                  ")"}
                              </p>
                              {list?.selectedPackages?.find(n=> n.package.name==="Pension Income") && <button
                                  className="button is-warning"
                                  onClick={() => handleAdd(l)}
                                  style={{ marginRight: "1rem" }}
                                >
                                  Add
                                </button>}
                              </div>
                            }
                          >
                            {list["pensionDetails"]?.map((p, v) => (
                              <TreeItem
                                nodeId={p.name + "-" + v}
                                key={p.name + "-" + v}
                                label={
                                  <div
                                    // key={p.name + "-" + v + "-"}
                                    className="sigle-line"
                                  >
                                    <p
                                      style={{
                                        padding: "0.5rem",
                                        margin: "0.5rem",
                                      }}
                                      className="subtitle is-5 information-title"
                                    >
                                      {v + 1 + ". " + p.name}
                                    </p>{" "}
                                    <div>
                                      {" "}
                                      <button
                                        className="button is-success"
                                        onClick={() => hanclickEdit(p.id, l)}
                                        style={{ marginRight: "1rem" }}
                                      >
                                        Edit
                                      </button>{" "}
                                      <button
                                        className="button is-danger"
                                        onClick={() => hanclickDelete(p.id, l)}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                }
                              />
                            ))}
                          </TreeItem>
                        );
                      } else if (i === 3) {
                        return (
                          <TreeItem
                          nodeId={l + "-" + i+3+"-"}
                          key={l + "-" + i+3+"-"}
                            label={
                              <div 
                              // key={l + "-" + i+"-"}
                              style={{display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'space-between', alignItems:"center"}}>
                              <p
                                style={{ padding: "0.5rem", margin: "0.5rem" }}
                                className="title is-3 package-title"
                              >
                                {l +
                                  "  " +
                                  "(" +
                                  list["partnershipDetails"]?.length +
                                  ")"}
                              </p>
                              {list?.selectedPackages?.find(n=> n.package.name==="Partnership") && <button
                                  className="button is-warning"
                                  onClick={() => handleAdd(l)}
                                  style={{ marginRight: "1rem" }}
                                >
                                  Add
                                </button>}
                              </div>
                            }
                          >
                            {list["partnershipDetails"]?.map((p, v) => (
                              <TreeItem
                                nodeId={p.name + "-" + v}
                                key={p.name + "-" + v}
                                label={
                                  <div
                                    // key={p.name + "-" + v + "-"}
                                    className="sigle-line"
                                  >
                                    <p
                                      style={{
                                        padding: "0.5rem",
                                        margin: "0.5rem",
                                      }}
                                      className="subtitle is-5 information-title"
                                    >
                                      {v + 1 + ". " + p.name}
                                    </p>{" "}
                                    <div>
                                      {" "}
                                      <button
                                        className="button is-success"
                                        onClick={() => hanclickEdit(p.id, l)}
                                        style={{ marginRight: "1rem" }}
                                      >
                                        Edit
                                      </button>{" "}
                                      <button
                                        className="button is-danger"
                                        onClick={() => hanclickDelete(p.id, l)}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                }
                              />
                            ))}
                          </TreeItem>
                        );
                      } else if (i === 4) {
                        return (
                          <TreeItem
                          nodeId={l + "-" + i+4+"-"}
                          key={l + "-" + i+4+"-"}
                            label={
                              <div 
                              // key={l + "-" + i+"-"}
                              style={{display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'space-between', alignItems:"center"}}>
                              <p
                                style={{ padding: "0.5rem", margin: "0.5rem" }}
                                className="title is-3 package-title"
                              >
                                {l +
                                  "  " +
                                  "(" +
                                  list["rentalIncomeDetails"]?.length +
                                  ")"}
                              </p>
                              {list?.selectedPackages?.find(n=> n.package.name==="Rental Income") &&  <button
                                  className="button is-warning"
                                  onClick={() => handleAdd(l)}
                                  style={{ marginRight: "1rem" }}
                                >
                                  Add
                                </button>}
                              </div>
                            }
                          >
                            {list["rentalIncomeDetails"]?.map((p, v) => (
                              <TreeItem
                                nodeId={p.propertyName + "-" + v}
                                key={p.propertyName + "-" + v}
                                label={
                                  <div
                                    // key={p.propertyName + "-" + v}
                                    className="sigle-line"
                                  >
                                    <p
                                      style={{
                                        padding: "0.5rem",
                                        margin: "0.5rem",
                                      }}
                                      className="subtitle is-5 information-title"
                                    >
                                      {v + 1 + ". " + p.propertyName}
                                    </p>{" "}
                                    <div>
                                      {" "}
                                      <button
                                        className="button is-success"
                                        onClick={() => hanclickEdit(p.id, l)}
                                        style={{ marginRight: "1rem" }}
                                      >
                                        Edit
                                      </button>{" "}
                                      <button
                                        className="button is-danger"
                                        onClick={() => hanclickDelete(p.id, l)}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                }
                              />
                            ))}
                          </TreeItem>
                        );
                      } else if (i === 5) {
                        return (
                          <TreeItem
                          nodeId={l + "-" + i+5+"-"}
                          key={l + "-" + i+5+"-"}
                            label={
                              <div 
                              // key={l + "-" + i+"-"}
                              style={{display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'space-between', alignItems:"center"}}>
                              <p
                                style={{ padding: "0.5rem", margin: "0.5rem" }}
                                className="title is-3 package-title"
                              >
                                {l +
                                  "  " +
                                  "(" +
                                  list["dividendIncomes"]?.length +
                                  ")"}
                              </p>
                              {list?.selectedPackages?.find(n=> n.package.name==="Dividend") && <button
                                  className="button is-warning"
                                  onClick={() => handleAdd(l)}
                                  style={{ marginRight: "1rem" }}
                                >
                                  Add
                                </button>}
                              </div>
                            }
                            
                          >
                            {list["dividendIncomes"]?.map((p, v) => (
                              <TreeItem
                                nodeId={p.companyName + "-" + v}
                                key={p.companyName + "-" + v}
                                label={
                                  <div
                                    // key={p.companyName + "-" + v}
                                    className="sigle-line"
                                  >
                                    <p
                                      style={{
                                        padding: "0.5rem",
                                        margin: "0.5rem",
                                      }}
                                      className="subtitle is-5 information-title"
                                    >
                                      {v + 1 + ". " + p.companyName}
                                    </p>{" "}
                                    <div>
                                      {" "}
                                      <button
                                        className="button is-success"
                                        onClick={() => hanclickEdit(p.id, l)}
                                        style={{ marginRight: "1rem" }}
                                      >
                                        Edit
                                      </button>{" "}
                                      <button
                                        className="button is-danger"
                                        onClick={() => hanclickDelete(p.id, l)}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                }
                              />
                            ))}
                          </TreeItem>
                        );
                      } else if (i === 6) {
                        return (
                          <TreeItem
                          nodeId={l + "-" + i+6+"-"}
                          key={l + "-" + i+6+"-"}
                            label={
                              <div 
                              // key={l + "-" + i+"-"}
                              style={{display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'space-between', alignItems:"center"}}>
                              <p
                                style={{ padding: "0.5rem", margin: "0.5rem" }}
                                className="title is-3 package-title"
                              >
                                {l +
                                  "  " +
                                  "(" +
                                  list["bankInterestIncomes"]?.length +
                                  ")"}
                              </p>
                              {list?.selectedPackages?.find(n=> n.package.name==="Bank interest") && <button
                                  className="button is-warning"
                                  onClick={() => handleAdd(l)}
                                  style={{ marginRight: "1rem" }}
                                >
                                  Add
                                </button>}
                              </div>
                            }
                          >
                            {list["bankInterestIncomes"]?.map((p, v) => (
                              <TreeItem
                                nodeId={p.bankName + "-" + v}
                                key={p.bankName + "-" + v}
                                label={
                                  <div
                                    // key={p.bankName + "-" + v}
                                    className="sigle-line"
                                  >
                                    <p
                                      style={{
                                        padding: "0.5rem",
                                        margin: "0.5rem",
                                      }}
                                      className="subtitle is-5 information-title"
                                    >
                                      {v + 1 + ". " + p.bankName}
                                    </p>{" "}
                                    <div>
                                      {" "}
                                      <button
                                        className="button is-success"
                                        onClick={() => hanclickEdit(p.id, l)}
                                        style={{ marginRight: "1rem" }}
                                      >
                                        Edit
                                      </button>{" "}
                                      <button
                                        className="button is-danger"
                                        onClick={() => hanclickDelete(p.id, l)}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                }
                              />
                            ))}
                          </TreeItem>
                        );
                      }else if (i === 7) {
                        return (
                          <TreeItem
                          nodeId={l + "-" + i+6+"-"}
                          key={l + "-" + i+6+"-"}
                            label={
                              <div 
                              // key={l + "-" + i+"-"}
                              style={{display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'space-between', alignItems:"center"}}>
                              <p
                                style={{ padding: "0.5rem", margin: "0.5rem" }}
                                className="title is-3 package-title"
                              >
                                {l +
                                  "  " +
                                  "(" +
                                  list["capitalGains"]?.length +
                                  ")"}
                              </p>
                              {list?.selectedPackages?.find(n=> n.package.name==="Capital gain") && <button
                                  className="button is-warning"
                                  onClick={() => handleAdd(l)}
                                  style={{ marginRight: "1rem" }}
                                >
                                  Add
                                </button>}
                              </div>
                            }
                          >
                            {list["capitalGains"]?.map((p, v) => (
                              <TreeItem
                                nodeId={p.bankName + "-" + v}
                                key={p.bankName + "-" + v}
                                label={
                                  <div
                                    // key={p.bankName + "-" + v}
                                    className="sigle-line"
                                  >
                                    <p
                                      style={{
                                        padding: "0.5rem",
                                        margin: "0.5rem",
                                      }}
                                      className="subtitle is-5 information-title"
                                    >
                                      {v + 1 + ". " + p.bankName}
                                    </p>{" "}̀̀
                                    <div>
                                      {" "}
                                      <button
                                        className="button is-success"
                                        onClick={() => hanclickEdit(p.id, l)}
                                        style={{ marginRight: "1rem" }}
                                      >
                                        Edit
                                      </button>{" "}
                                      <button
                                        className="button is-danger"
                                        onClick={() => hanclickDelete(p.id, l)}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                }
                              />
                            ))}
                          </TreeItem>
                        );
                      }else{
                        return null;
                      }
                    })}
                  </TreeView>
                  <div className={`modal ${deleteModal ? "is-active" : ""}`}>
                    <div className="modal-background"></div>
                    <div className="modal-content">
                      <div className="icon-outer">
                        <DeleteIcon height="2rem" width="2rem" />
                      </div>
                      <p className="title is-5">
                        Are you sure to want to delete this package?
                      </p>
                      <div className="delete-footer">
                        <button
                          className="button is-danger"
                          onClick={handleConfirmDelete}
                        >
                          Delete
                        </button>
                        <button
                          className="button is-warning"
                          onClick={() => {
                            setDeleteModal((modal) => !modal);
                            setDeletepackage("");
                            setDeletepackageId("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                    <button
                      className="modal-close is-large"
                      aria-label="close"
                      onClick={() => {
                        setDeleteModal((modal) => !modal);
                        setDeletepackage("");
                        setDeletepackageId("");
                      }}
                    ></button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default EditPackage;
