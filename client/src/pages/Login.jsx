import React from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useState } from "react";
import "./Login.css";

export default function Login({ setUser }) {

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

  const handleEmailLogin = async (e) => {
  e.preventDefault();
  const res = await fetch("http://localhost:5000/auth/signin", {
    method: "POST",
    credentials: "include", // important for cookies
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json(); // wait for backend response
  if (res.ok) {
    console.log("Backend response:", data);
    alert(data.message); // show message from backend
    setUser(data.user);  // update Navbar
    window.location.href = "/"; // optional redirect
  } else {
    alert(data.message || "Login failed");
  }
};
  return (
    <Container fluid className="p-0 vh-100">
      <Row className="h-100 g-0 login-bg" style={{
    backgroundImage: "url('/LoginPicVol2.jpg')"
  
  }}>
        {/* Left side - Image */}
        <Col md={6} className="d-none d-md-block">
          
        </Col>

        {/* Right side - Login form */}
        <Col
          md={6}
          className="d-flex flex-column justify-content-center align-items-center  p-5" style={{backgroundColor:'rgb(253 255 252)', opacity: 0.9 }}
        >
          <h2 className="mb-4">Login</h2>

          <Form style={{ width: "100%", maxWidth: "400px" }} onSubmit={handleEmailLogin}>
  {/* Email/password inputs */}
  <Form.Group controlId="formBasicEmail" className="mb-3">
    <Form.Label>Email address</Form.Label>
    <Form.Control
      type="email"
      placeholder="Enter email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />
  </Form.Group>

  <Form.Group controlId="formBasicPassword" className="mb-3">
    <Form.Label>Password</Form.Label>
    <Form.Control
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />
  </Form.Group>

  <Button variant="primary" type="submit" className="w-100 mb-3">
    Login with Email
  </Button>

  {/* Divider */}
  <div className="d-flex align-items-center my-3">
    <hr className="flex-grow-1" />
    <span className="mx-2 text-muted">or</span>
    <hr className="flex-grow-1" />
  </div>

  {/* Google login button */}
  <Button
    variant="outline-dark"
    className="w-100"
    onClick={() => (window.location.href = "/auth/google")}
  >
    <img
      src="https://developers.google.com/identity/images/g-logo.png"
      alt="Google"
      style={{ width: "20px", marginRight: "10px" }}
    />
    Login with Google
  </Button>

  {/* Sign up link */}
  <div className="text-center mt-3">
    Don’t have an account? <Link to="/signup">Sign up here</Link>
  </div>
</Form>
        </Col>
      </Row>
    </Container>
  );
}
