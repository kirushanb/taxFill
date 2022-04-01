import React, { useEffect, useRef } from "react";
import axios from "axios";
import useFileUpload from "react-use-file-upload";
import { Button, Chip, CircularProgress } from "@mui/material";
import "./UploadFiles.scss";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const UploadFiles = (props) => {
  const {
    files,
    fileNames,
    fileTypes,
    totalSize,
    totalSizeInBytes,
    handleDragDropEvent,
    clearAllFiles,
    createFormData,
    setFiles,
    removeFile,
  } = useFileUpload();
  const axiosPrivate = useAxiosPrivate();
  const inputRef = useRef();
  const [isLoading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const responseAll = await Promise.all(
        files.map(async (n) => {
          const formData = createFormData();

          formData.append("file", n);
          const response = await axiosPrivate.post(
            "/Document/upload-document",
            formData
          );
          return response;
        })
      );

      props.handleUpload(responseAll.map((l) => l.data.result.imageURL));

      setLoading(false);
      toast.success("File Uploaded Successfully");
    } catch (error) {
      console.error("Failed to submit files.");
      setLoading(false);
      toast.error(error);
    }
  };

  return (
    <div className="UploadFiles">
      {isLoading ? (
        <CircularProgress />
      ) : (
        <>
          <div>
            <ToastContainer />
            {/* Provide a drop zone and an alternative button inside it to upload files. */}
            <div
              className="form-container"
              onDragEnter={handleDragDropEvent}
              onDragOver={handleDragDropEvent}
              onDrop={(e) => {
                handleDragDropEvent(e);
                setFiles(e, "a");
              }}
            >
              <CloudUploadIcon fontSize="inherit" sx={{ fontSize: "40px" }} />
              <p>Drag 'n' drop some files here, or click to select files</p>

              <Button
                sx={{ backgroundColor: "#49c68d" }}
                variant="contained"
                onClick={() => inputRef.current.click()}
              >
                Select files
              </Button>

              {/* Hide the crappy looking default HTML input */}
              <input
                ref={inputRef}
                type="file"
                multiple
                style={{ display: "none" }}
                onChange={(e) => setFiles(e, "a")}
              />

              {/* Display the files to be uploaded */}
              <div>
                <ul>
                  {fileNames.map((name,i) => (
                    <li key={name+"-"+i} className='tag'>
                      <span>{name}</span>

                      <span onClick={() => removeFile(name)} className='icon-delete'>
                        <i className="fa fa-times" />
                      </span>
                    </li>
                    // <Chip
                    //   key={name.toString()}
                    //   label={name.toString()}
                    //   onDelete={removeFile(name)}
                    // />
                  ))}
                </ul>

                {/* {files.length > 0 && (
            <ul>
              <li>File types found: {fileTypes.join(', ')}</li>
              <li>Total Size: {totalSize}</li>
              <li>Total Bytes: {totalSizeInBytes}</li>

              <li className="clear-all">
                <button onClick={() => clearAllFiles()}>Clear All</button>
              </li>
            </ul>
          )} */}
              </div>
            </div>
          </div>

          <div className="submit">
            <button className="button is-link" onClick={handleSubmit}>
              Submit
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UploadFiles;
