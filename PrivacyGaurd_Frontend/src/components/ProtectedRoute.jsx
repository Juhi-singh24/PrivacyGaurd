import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const ProtectedRoute = () => {

  const {status} = useContext(AuthContext);

  if(status === "loading"){
    return <p>Checking authentication...</p>
  }

  else if(status === "authenticated"){

    return <Outlet />

  }

  else if(status === "unauthenticated"){
    return <Navigate to='/login' replace/>
  }

  else if(status === "error"){
    return <p>Something went wrong.Please try again</p>
  }
};

export default ProtectedRoute;