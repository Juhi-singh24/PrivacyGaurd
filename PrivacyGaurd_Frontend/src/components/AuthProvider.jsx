import {useEffect,useState} from "react";
import { AuthContext } from "./AuthContext";
import API from "../api/axiosInstance";



const AuthProvider = ({children}) => {

const[status,setStatus] = useState("loading");
const[name,setName] = useState("");
const[email,setEmail] = useState("");

useEffect(()=>{

  API.get('/api/me',{withCredentials:true})
  .then((response) => {
    console.log(response.data);
    setStatus("authenticated");
    setName(response.data.user);
    setEmail(response.data.userEmail);

  })

  .catch((error) =>{

    if(error.response?.status === 401){
      setStatus("unauthenticated");
      setName("");
      setEmail("");
    }

    else if(error.response?.status === 500){
      setStatus("error");
    }

    else{
      setStatus("error");
    }

  })



},[]);

  return(
    <AuthContext.Provider value={{

      status,
      name,
      email

    }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider;