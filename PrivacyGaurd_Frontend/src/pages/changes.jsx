import { useState, useEffect } from "react";
import API from "../api/axiosInstance";
import { useParams } from "react-router-dom";
import "./changes.css";

export function Changes() {
  const { app_id } = useParams();
  const [change, setChange] = useState();

  useEffect(() => {
    API
      .get(`/api/history/${app_id}`,
        {withCredentials: true}
      )

      .then((response) => {
        setChange(response.data.id_data);
        console.log("Fetched document:", JSON.stringify(response.data.id_data, null, 2));
      })

      .catch((error) =>{
        console.log(error);
      }
    )
  }, [app_id]);

  return (
    <>
      <section className="changes">
        {change?.changes ? (

         
          
          <div className="changecontainer">

             <h3 className="analyzed">Changes Analyzed</h3>

          <div className="change_det">
            <h3 className="permm">Permission Analysis</h3>
            <p>
              Added:{" "}
              {change.changes.permissions.added.length > 0
                ? change.changes.permissions.added.join(" , ")
                : "None"}
            </p>
            <p>
              Removed: {" "}
              {change.changes.permissions.removed.length > 0
                ? change.changes.permissions.removed.join(" , ")
                : "None"}
            </p>
            <p>
              Unchanged :{" "}
              {change.changes.permissions.unchanged.length > 0
                ? change.changes.permissions.unchanged.join(" , ")
                : "None"}
            </p>
            </div>

            <hr className="change_line" />


            <div className="change_overall">
              <h3 className="permm">Overall Compatability</h3>
            <p>
              Previous :{" "}
              {change.changes.overall.previousCompatibility}
            </p>
            <p>
              Current :{" "}
              {change.changes.overall.currentCompatibility}
            </p>
           

            </div>

            <hr className="change_line" />

            <div className="change_per">
              <h3 className="permm">Privacy Risk</h3>
               <p>
              Previous Risk :{" "}
              {change.changes.overall.previousPrivacyRisk}
            </p>
            <p>
              Current Risk :{" "}
              {change.changes.overall.currentPrivacyRisk}
            </p>

            </div>
            
          </div>

              
        ) : (
          <div className="nochange">
            <h3>No previous analysis available for this application.</h3>
            <p>
              This is the first analysis, so there are no changes to display.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
