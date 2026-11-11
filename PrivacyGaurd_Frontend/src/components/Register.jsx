import './Register.css';
import {useState} from "react";
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import {Link} from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import API from '../api/axiosInstance';

export function Register(){

  const [userName,setUserName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [isShowPassword,setIsShowPassword] =useState(false);
  const [errors,setErrors] = useState("");
  const [errorMessage,setErrorMessage] =useState("");
  const navigate = useNavigate();

  function handleShowPassword(){
    setIsShowPassword(prev => !prev)
  }

  

  function handleRegister(e){
    e.preventDefault();
    setErrors("");
    setErrorMessage("");

    if(userName.trim() === ""){
      setErrors("name");
      setErrorMessage("Please fill your full name")
      return;
    }

    else if(email.trim() === ""){
      setErrors("email");
      setErrorMessage("Please fill your email")
      return;
    }

    else if(password.trim() === "" || password.length < 8){
      setErrors("password");
      setErrorMessage("Please fill password of atleast 8 characters")
      return;
    }

    else{
      API.post('/api/register',{
        userName,
        email,
        password
      })
      .then((response) => {
        response.data.message
        navigate('/login')
      })
      .catch((error) => {
        if(error.response){
          const backendError = error.response.data;
        setErrors(backendError.field);
        setErrorMessage(backendError.message);
        console.log(error);

        }
        else{
          setErrors('general');
          setErrorMessage("Cannot connect to server please try again ")
        }
        
      })
    }
    
  }


  return(
    <>

    <section className="register">

      {errors === 'general' && <p className='errormm'>{errorMessage}</p>}

      <form className="register_card" onSubmit={handleRegister}>
        <div className="image_priv">
            <img
              className="privacy_ico"
              src="https://cdn-icons-png.flaticon.com/256/6337/6337462.png"
              alt="image"
            />
            <h3 className = "heaading">PrivacyGaurd</h3>
          </div>
        
        <h3 className='account'>Create your account</h3>
        <h3 className='tag_li'>Get AI-powered insights into your app permissions and privacy risks.</h3>

        

        <div className="input_bo">
        <FaUser className="user_icon" />
        <input 
        className='input_box'
        autoComplete="name"
        type="text" 
        placeholder="Enter your full Name"
        value={userName}
        onChange={(e) => {
          setUserName(e.target.value);

          if (e.target.value.trim() !== "") {
              setErrors("");
            }
        }}

        />
        </div>

      {errors === "name" && (
          <p className="error">{errorMessage}</p>)}
         
      
       <div className="input_bo">
        <FaEnvelope className="user_icon" />
        <input 
        className='input_box'
        autoComplete="email"
        type="email" 
        placeholder="Enter your email address e.g xyz@gmail.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);

          if (e.target.value.trim() !== "") {
              setErrors("");
          }
        }}
         />

       </div>

       
         {errors === "email" && (
          <p className="error">{errorMessage}</p>
        )}

       <div className="input_bo">
        <FaLock className="user_icon" />
        <input
        className="input_box"
        autoComplete="new-password"
        placeholder="Enter your password"
        type = {isShowPassword ? "text" : "password"}
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);

          if (e.target.value.trim() !== "" &&  e.target.value.length >= 8) {
              setErrors("");
            }
        }}

        />

        <button className="password-butt" type='button' onClick={handleShowPassword}>{isShowPassword ? <FaEye className="eye_open"/> : <FaEyeSlash className="eye_close"/>}</button>


       </div>

       {errors === 'password' && (
          <p className='error'>{errorMessage}</p>
        )}

      
  <button className="sub" type="submit">
    Create account
  </button>

  <p className='login_link'>
  Already have an account? <Link to="/login" className='linka'>Login</Link>
</p>

  
</form>

      

    </section>


    </>
  )

}