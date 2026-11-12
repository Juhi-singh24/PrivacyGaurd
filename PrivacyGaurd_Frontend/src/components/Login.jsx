import { useState } from "react";
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import API from "../api/axiosInstance";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {Link} from 'react-router-dom';
import './Login.css';

export function Login(){

  const [userEmailId,setUserEmailId] = useState("");
  const [userPassword,setUserPassword] = useState("");
  const [isShowPassword,setIsShowPassword] = useState(false);
  const [error,setError] = useState("");
  const [errorMessage,setErrorMessage] = useState("");
  const [load,setload] = useState(false);
  const navigate = useNavigate();

  function handleShowPassword(){
    setIsShowPassword(prev => !prev);
  }

  function handleLogin(e){
    e.preventDefault();
    setError('');

    if(userEmailId.trim() === ''){
      setError('user_email');
      setErrorMessage('Please fill the email');
      return;

    }

    else if(userPassword.trim() === '' || userPassword.length < 8){
      setError('user_password');
      setErrorMessage('Please fill the password of atleast 8 character');
      return;
    }

    else {
      setload(true);
      API.post('/api/login',{
        userEmailId,
        userPassword, 
      },
      { withCredentials: true}
    )
      .then((response) => {
        response.data.message
        navigate('/application')

      })
      .catch((error) => {
    
        
        if(error.response){
          console.log("Backend response:", error.response?.data);

          const backend_error = error.response?.data;
        
          setError(backend_error.field);
        setErrorMessage(backend_error.message);
        console.log(error);

        }
        else {
    setError("general");
    setErrorMessage(
  "Unable to connect to the server. Please try again later."
    );
  } 

      })
      .finally(() => {
        setload(false);
      })
    }

  }
  return(
    <>
    <section className="login">

      {error === 'general' && <p className="errormm">{errorMessage}</p>}
      
    
      <form className="login_form" onSubmit={handleLogin}>

        <div className="imagepriv">


            <img
              className="privacy_ico"
              src="https://cdn-icons-png.flaticon.com/256/6337/6337462.png"
              alt="image"
            />
            <h3 className = "heaading_pri">PrivacyGaurd</h3>
          </div>

          <p className="heading_lo">LOGIN</p>
          <p className="tagline_lo">Understand app permissions. Protect your privacy with AI.</p>

          

          <div className="input_valid">
             <FaEnvelope className="user_icon"/>
            <input className="email"
            autoComplete="email"
            type= "email"
            value = {userEmailId}
            placeholder = "Enter the email address"
            onChange = {(e) => {
              setUserEmailId(e.target.value)
          

            if(e.target.value.trim() !== ""){
              setError('');
            }

          }}
            />
          </div>

          {(error === "user_email" ) && <p className="error">{errorMessage}</p>}

           <div className="input_bo">

            <FaLock className="user_icon"/>

            <input className="input_box"
            autoComplete="new-password"
            type = {isShowPassword ? "text" : "password"}
            value = {userPassword}
            placeholder = "Enter the password"
            onChange = {(e) => {
              setUserPassword(e.target.value)
          

            if(e.target.value.trim() !== "" &&  e.target.value.length >= 8){
              setError('');
            }

          }}

          />

          <button className="password-butt" type='button' onClick={handleShowPassword}>{isShowPassword ? <FaEye className="eye_open"/> : <FaEyeSlash className="eye_close"/>}</button>

          
          </div>

          {/*<h3 className="forgett"><Link to='/forget-password' className="linkf">Forget Password ?</Link></h3>*/}

          {(error === "user_password" ) && <p className="error">{errorMessage}</p>}

          {load ? (<span className="spinner"/>) : (<button type='submit' className="login_butt">Log in</button>)}

          <p className="tag_line">Don't have an account? <Link to='/' className="linka">Create account</Link></p>

      </form>

  
    </section>
    </>
  )
}
