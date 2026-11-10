import { useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import "./ForgetPassword.css";
import API from "../api/axiosInstance";

export function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loader, setLoader] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (email.trim() === "") {
      setError("email");
      setErrorMessage("Invalid, please fill your email address");
      return;
    } else {
      setLoader(true);
      API
        .post("/api/forgot-password", {
          Email: email,
        })

        .then((response) => {
          setSuccessMessage(response.data.message);
        })

        .catch((error) => {
          if (error.response) {
            console.log(error.response?.data);
          }

          setError("general");
          setErrorMessage("Unable to connect due to some internal error");
          return;
        })

        .finally(() => {
          setLoader(false);
        });
    }
  }

  return (
    <>
      <section className="forget-form">
        {error === "general" && <p className="errormm">{errorMessage}</p>}

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
            Enter your email, and we'll send you a secure link to reset your
            password.
          </p>

          <div className="input_valid">
            <FaEnvelope className="user_icon" />

            <input
              className="email"
              type="email"
              value={email}
              placeholder="Enter your gmail address"
              onChange={(e) => {
                setEmail(e.target.value);

                if (e.target.value.trim() !== "") {
                  setError("");
                }
              }}
            />
          </div>

          {error === "email" && <p className="errorm">{errorMessage}</p>}

          {successMessage && <p className="success">{successMessage}</p>}

          {loader === true ? (
            <p className="sending">Sending...</p>
          ) : (
            <button className="reset-butt" type="submit">
              Send Reset Link
            </button>
          )}
        </form>
      </section>
    </>
  );
}
