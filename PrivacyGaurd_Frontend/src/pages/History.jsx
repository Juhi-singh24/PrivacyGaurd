import "./History.css";
import formatDate from "../utils/formatDate";"../utils/formatDate";
import API from "../api/axiosInstance";
import { useState } from "react";
import { useEffect } from "react";
import { FiClock } from "react-icons/fi";
import { FiChevronRight } from "react-icons/fi";
import { useNavigate} from "react-router-dom";



export function History() {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();
  const [errorMessage , setErrorMessage] = useState('');


  useEffect(() => {
    API
      .get("/api/history",{
        withCredentials:true
      })

      .then((response) => {
        setHistory(response.data.read_data);
      })

      .catch((error) => {
        setErrorMessage(error.response?.data?.message || "Unable to connect to the server. Please try again later.");
        console.log(error);
      });
  }, []);

  function handlehistory(id){

    navigate(`/analysis/${id}`);
  
  }

  return (
    <>
      <section className="history">

        {errorMessage && <p className="error_mess">{errorMessage}</p>}
        <p className="heading">
          <span className="history_icon">
            <FiClock />
          </span>
          History
        </p>
        <p className="heading_tagline">
          View your past analysis and revisit the permission insights for the
          application.
        </p>
        {history.map((read) => (
          <div key={read._id} className="application_history">
            <div className="container">
              <div className="container1">
                <p className="app_name">{read.name}</p>
                <p className="app_purpose">{read.purpose}</p>
                <p className="app_time">{formatDate(read.createdAt)}</p>
              </div>

              <div className="container2">
                <p className="app_permission">Permissions</p>
                <p className="perm">{read.permissions.join(' , ')}</p>

              </div>

              <div className="container3">
                <p className="compat">{read.overallAnalysis.compatibility}</p>
                <p className="priva">{read.overallAnalysis.privacyRisk}</p>
              </div>

              
                <button className='arrow'onClick={() => handlehistory(read._id)}>
                  <FiChevronRight className="arrow_icon"/>
                </button>
              </div>
            </div>
        
        ))}
      </section>
    </>
  );
}
