import { useState } from "react";
import { IoAdd } from "react-icons/io5";
import { IoSearch } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import API from "../api/axiosInstance";
import {useNavigate} from "react-router-dom";
import "./Applicationform.css";


export function Applicationform({setAppId}) {
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [permission, setPermission] = useState("");
  const [error, setError] = useState("");
  const [spinner,setSpinner] = useState(false);
  const [errorMessage,setErrorMessage] = useState('');
  const navigate = useNavigate();

  function handleAddPermission() {
    if (permission.trim() === "") {
      setError("permissions");
      return;
    }

    setPermissions([...permissions, permission]);
    setPermission("");
    setError("");
  }

  function handlecancel(permissionelement){

    setPermissions(permissions.filter((permissionfil) => (
      permissionfil !== permissionelement
    )))
}

  function handlesubmit(e) {
    e.preventDefault();
    setError("");

    if (name.trim() === "") {
      setError("name");
      return;
    } else if (purpose.trim() === "") {
      setError("purpose");
      return;
    } else if (permissions.length === 0) {
      setError("permissions");
      return;
    } else {
      setSpinner(true);
      console.log("Successfull");
      API
        .post("/api/analyze", {
          name,
          purpose,
          permissions,
        },
        {withCredentials : true}
      )
        .then((response) => {
          setSpinner(false);
          console.log(response.data.analysis);
          navigate(`/analysis/${response.data.id}`,
            {
            state:
            {
             app_id:response.data.id,
              name:name,
              purpose:purpose,
              permission:permissions
          }
        }
          )
          console.log(response.status);
          setAppId(response.data.id);
        })
        .catch((error) => {
          setSpinner(false);
          setErrorMessage(error.response?.data?.message || "Internal Server Error");
          console.log(error);
        });
    }
  }

  return (
    <>
    {errorMessage && <p className='error_mess'>{errorMessage}</p>}
      <form className="application_detail" onSubmit={handlesubmit}>
        <p className="application_tagline">Application Name</p>
        <input
          className="Name"
          type="text"
          placeholder="e.g Calculator, Instagram etc."
          value={name}
          onChange={(e) => {
            setName(e.target.value);

            if (e.target.value.trim() !== "") {
              setError("");
            }
          }}
        />
        {error === "name" && (
          <p className="error">Please fill the Application Name</p>
        )}

        <p className="application_tagline">Application Purpose</p>
        <textarea
          className="Purpose"
          type="text"
          placeholder="Describe what your application does..."
          value={purpose}
          onChange={(e) => {
            setPurpose(e.target.value);

            if (e.target.value.trim() !== "") {
              setError("");
            }
          }}
        />

        {error === "purpose" && (
          <p className="error">Please fill the purpose of your Application</p>
        )}

        <p className="application_tagline">Requested Permission</p>
        <input
          className="Permissions"
          type="text"
          placeholder="e.g Camera, Contact, Location, Microphone etc."
          value={permission}
          onChange={(e) => {
            setPermission(e.target.value);

            if (e.target.value.trim() !== "") {
              setError("");
            }
          }}
        />

        <button className="add" type="button" onClick={handleAddPermission}>
          <IoAdd className="add-icon" />
          Add
        </button>

        <div className="permissionlist">

        {permissions.map((permissionelement) => (
          <p className = "permissionele" key={permissionelement}>
            {permissionelement}
            <button type="button" className="cancel" onClick={() => handlecancel(permissionelement)}><IoClose/></button>
            </p>
        ))}

        </div>

        {error === "permissions" && (
          <p className="error">Please fill the requested permissions </p>
        )}

        {spinner ? <span className="loader"/> :
        <button className="analyze" type="submit">
          <IoSearch className="icon" />
          Analyze Privacy
        </button>
        }
      </form>
    </>
  );
}
