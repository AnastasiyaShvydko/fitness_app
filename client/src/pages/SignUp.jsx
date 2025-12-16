import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./SignUp.css"; // Assuming you have a CSS file for styling
import { apiFetch } from "../api/apiClient";

export default function SignUp() {
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await apiFetch("/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Account created successfully! Please log in.");
        window.location.href = "/login";
      } else {
        alert("Error creating account.");
      }
    } catch (error) {
      console.error("Signup error:", error);
    }
  };

  return (
    <div className="container-fluid vh-100 ">
      <div className="row h-100 signup-bg" style={{
 // ensures column stays full height
    backgroundImage: "url('/SignUpPicVol2.jpg')",
  
  }} >
        {/* Left side image */}
<div className="col-md-6 d-none d-md-block p-0 min-vh-100 "   >
  {/* <img
    src="/SignUpPic.png"
    alt="Signup"
    className="w-100 h-100"
    style={{ objectFit: "cover" }}
  /> */}
</div>

        {/* Right side form */}
        <div className="col-md-6 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgb(253 255 252)', opacity: 0.9 }}>
          <div className="w-75">
            <h2 className="mb-4 text-center">Create Account</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-100">
                Sign Up
              </button>
            </form>

            <div className="text-center mt-3">
              Already have an account?{" "}
              <a href="/login" className="text-decoration-none">
                Log in
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
