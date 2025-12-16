import React, { useEffect, useState } from "react";
import { FaPowerOff } from "react-icons/fa";
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { fetchApi } from "../api/apiClient";
function AppNavbar({ user, setUser, cart }) {


  const navigate = useNavigate();
  // const [user, setUser] = useState(null);
  const API = import.meta.env.VITE_API_URL;
  useEffect(() => {
    // Check if user is logged in
    fetchApi("/auth/user")
      .then((res) => res.json())
      .then((data) => {
        //if (data.loggedIn) {
          setUser(data);
        //}
      })
      .catch((err) => console.error("Error fetching user:", err));
  }, []);

  const handleLogout = async () => {
    window.location.href = `${API}/auth/logout`;
    // await fetch("/auth/logout", {
    //   method: "POST",
    //   credentials: "include",
    // });
    // setUser(null);
  };

  return (
   <Navbar bg="dark" variant="dark" expand="lg" className="w-100 gap-5">
      <Container className="w-100 gap-5">
        <Navbar.Brand href="/">Fitness App</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" >
          <Nav className="me-auto w-100 justify-content-end gap-3 pe-3">
            <Nav.Link href="/membership">Membership</Nav.Link>
            <Nav.Link href="/events">Events</Nav.Link>
            <Nav.Link href="/store">Store</Nav.Link>
            <Nav.Link href="/about">About Us</Nav.Link>
                        {user && user.isAdmin ? <Nav.Link href="/admin">Admin</Nav.Link> : null}
            <Nav.Link href="/cart" className="d-flex align-items-center">
                <FaShoppingCart size={20} /> <span className="ms-1">{cart?.length ?? 0}</span>
            </Nav.Link>

          </Nav>
          

          {user && user.displayName ? (
            <>
    <span className="text-white ">
      Welcome, {user.displayName}!
    </span>
    <Button variant="outline-light" onClick={handleLogout}>
  <FaPowerOff color="white" />
    </Button>
  </>
          ) : (
         <Button
            variant="outline-light"
            onClick={() => {
            if (user && user.displayName ) {
              navigate("/dashboard");
            } else {
              navigate("/login");
            }
          }       
        }
>
  {user && user.displayName ?  "Go to Dashboard" : "Login"}
</Button>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;

