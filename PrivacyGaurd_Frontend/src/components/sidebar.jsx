import {
  FiBarChart2,
  FiClock,
  FiRefreshCw,
} from "react-icons/fi";

import { IoHomeOutline } from "react-icons/io5";

import { Link } from "react-router-dom";

import './sidebar.css'

export function Sidebar({appId , isSidebaropen , onClose}) {
  return (
    <>
      <section
  className={`sidebar ${isSidebaropen ? "sidebar-open" : "sidebar-closed"}`}
>
        <div className="project_title">

          <div className="image">
            <img
              className="privacy"
              src="https://cdn-icons-png.flaticon.com/256/10909/10909184.png"
              alt="image"
            />
          </div>

          <div className="title_heading">
            <h2>PrivacyGuard</h2>
            <h3>Permission Analyzer</h3>
          </div>

        </div>
        <div className="title_content">
          <ul>
            <li>
              <IoHomeOutline/> <Link className='link' to="/application" onClick={onClose}>Home</Link>
            </li>
            <li>
              <FiBarChart2 /><Link className='link' to="/analysis" onClick={onClose}>Analyze</Link>
            </li>
            <li>
              <FiClock /><Link className="link" to="/history" onClick={onClose}>History</Link>
            </li>
            <li>
              <FiRefreshCw /><Link className="link" to={`/changes/${appId}`} onClick={onClose}>Changes</Link>
            </li>
      
          </ul>
        </div>

        <div className="tagline">
          <img className="tagline_image" src="https://cdn-icons-png.flaticon.com/256/6337/6337462.png" alt="image"/>
          <h3>Your Privacy Matters</h3>
          <p>We analyze permissions using AI to help you stay in control</p>
        </div>


      </section>
    </>
  );
}
