import { useState } from "react";
import { useParams } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import API from "../api/axiosInstance";
import "./ForgetPassword.css";


export function ResetPassword() {
  const [password, setPassword] = useState("");
  const { resetToken } = useParams();
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isShowConfirmPassword,setIsShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [update, setUpdate] = useState(false);

  function handleShowPassword(){
    setIsShowPassword(prev => !prev);
  }

  function handleConfirmPassword(){
    setIsShowConfirmPassword(prev=>!prev);
  }



  function handleSubmit(e){
    e.preventDefault();
    setError("");

    if (password.trim() === "" || password.length < 8) {
      setError("password");
      setErrorMessage("Please fill the password of atleast 8 characters");
      return;
    } else if (
      confirmPassword === "" ||
      confirmPassword.length < 8 ||
      confirmPassword !== password
    ) {
      setError("confirmPassword");
      setErrorMessage("Please fill the same password as you filled above");
      return;
    } else {
      setUpdate(true);
      API
        .post("/api/reset-password", {
          password,
          resetToken,
        })
        .then((response) => {
          setSuccessMessage(response.data.message);
        })
        .catch((error) => {
          if (error.response) {
            console.log(error.response?.data);
          }

          setError("general");
          setErrorMessage("Unable to connect to the server");
        })

        .finally(() => {
          setUpdate(false);
        });
    }
  }

  return (
    <>
      <section className="forget-form">
        {error === "general" && (
          <p className="errormm">{errorMessage}</p>
        )}

        <form className="forget" onSubmit={handleSubmit}>
          <div className="imagepriv">
            <img
              className="privacy_ico"
              src="https://cdn-icons-png.flaticon.com/256/6337/6337462.png"
              alt="image"
            />
            <h3 className="heaading_pri">PrivacyGaurd</h3>
          </div>

          <p className="tagline_lo">
            Create a new password for your PrivacyGuard account.
          </p>

          <div className="input_bo">
            <FaLock className="user_icon" />

            <input
              className="input_box"
              type = {isShowPassword ? "text" : "password"}
              value={password}
              placeholder="Enter your new password"
              onChange={(e) => {
                setPassword(e.target.value);

                if (
                  e.target.value.trim() !== "" &&
                  e.target.value.length >= 8
                ) {
                  setError("");
                }
              }}
            />

             <button className="password-butt" type='button' onClick={handleShowPassword}>{isShowPassword ? <FaEye className="eye_open"/> : <FaEyeSlash className="eye_close"/>}</button>


          </div>

          {error === "password" && <p className="errorm">{errorMessage}</p>}

          <div className="input_bo">
            <FaLock className="user_icon" />

            <input
              className="input_box"
              type = {isShowConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              placeholder="Confirm your new password"
              onChange={(e) => {
                setConfirmPassword(e.target.value);

                if (
                  e.target.value.trim() !== "" &&
                  e.target.value.length >= 8
                ) {
                  setError("");
                }
              }}
            />

             <button className="password-butt" type='button' onClick={handleConfirmPassword}>{isShowConfirmPassword? <FaEye className="eye_open"/> : <FaEyeSlash className="eye_close"/>}</button>

          </div>

          {error === "confirmPassword" && (
            <p className="errorm">{errorMessage}</p>
          )}

          {successMessage && <p className="success">{successMessage}</p>}

          {update === true ? (
            <p className="sending">Updating Password...</p>
          ) : (
            <button className="reset-butt" type="submit">
              Change Password
            </button>
          )}
        </form>
      </section>
    </>
  );
}
