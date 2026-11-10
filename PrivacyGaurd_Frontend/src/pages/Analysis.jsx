import "./Analysis.css";
import { FiBarChart,FiShield,FiSearch} from "react-icons/fi";
import { Link } from "react-router-dom";
import API from "../api/axiosInstance";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";


export function Analysis() {

  const {app_id} = useParams();
  console.log(app_id);
  const [analysis , setAnalysis] = useState(null);
  const [errorMessage , setErrorMessage] = useState('');

  useEffect(() => {

    if(app_id)
  {

    API.get(`/api/history/${app_id}`,{
      withCredentials :true
    })

    .then((response) => {

      setAnalysis(response.data.id_data)

    }

    )

    .catch((error) => {
      setErrorMessage(error.response?.data?.message || "Unable to connect to the server. Please try again later.");
      console.log(error);

    }) 

  }

  else{
    API.get('/api/history/latest',{
      withCredentials:true
    })
    .then((response) => {

      setAnalysis(response.data.latest_data);

    })

    .catch((error) =>{
      setErrorMessage(error.response?.data?.message || "Unable to connect to the server. Please try again later.")
      console.log(error);
    })
  }

   

  }

    ,[app_id]);


    return(
      <>
      <section className="analysis">
        {errorMessage && <p className="error_mess">{errorMessage}</p>}
        {analysis ?

        (
        <div className="head">
        <h1 className="analysis_heading"><FiBarChart className="ana_icon"/>Analysis <span className="colorr">Result</span></h1>
        <p className="analysis_tagline">The analysis of your given information is done by AI </p>

        <div className="applicationdetail">
          <p className="appl_name"><span className="appna">Application Name :</span> {analysis.name}</p>
          <p className = "app_purpose"><span className="appna">Application purpose :</span> {analysis.purpose}</p>
        </div>

        <p className="req"> <span className="anal_icon"><FiSearch/></span>Requested Permission Analysis</p>
        {analysis.permissionAnalysis.map((app) => (

          <div className="details" key={app.permission}>
            <p><span className="change">Permission :</span> {app.permission}</p>
            <p><span className="change">Compatibility :</span> {app.compatibility}</p>
            <p><span className="change">Privacy Risk :</span> {app.privacyRisk}</p>
            <p><span className="change">Explanation :</span> {app.explanation}</p>
            <p><span className="change">Recommendation :</span> {app.recommendation}</p>
          </div>


        ))}

         <p className="overall"><span className="over">Overall Analysis <FiShield /></span></p>
          <div className="overallana">
            <p><span className="change">Overall Compatibility :</span> {analysis.overallAnalysis.compatibility}</p>
            <p><span className="change">Overall Privacy Risk :</span> {analysis.overallAnalysis.privacyRisk}</p>
            <p><span className="change">Overall Explanation :</span> {analysis.overallAnalysis.explanation}</p>
            <p><span className="change">Overall Recommendation :</span> {analysis.overallAnalysis.recommendation}</p>
          </div>

      </div>

        ):

      (<div className="no_details">
            <h3>No Application details <FiBarChart /></h3>
            <button className="butt">
              <Link to="/application" className="link1">
                Click to Analyze Application
              </Link>
            </button>
          </div>

      )

      }
        
      </section>

      </>
    )

}
