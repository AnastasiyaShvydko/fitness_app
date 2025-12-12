import React from "react";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const navigate = useNavigate();

  return (
    <>
    <div style={{ padding: "2rem" }}>
      <h2>Admin Dashboard</h2>
      <button
        className="btn btn-primary"
        onClick={() => navigate("/admin/addproduct")}
      >
        Add Product
      </button>
        <button
        className="btn btn-primary"
        onClick={() => navigate("/admin/addslider")}
      >
        Add Slider
      </button>
      
      {/* ...other admin content... */}
    </div>
    </>
  );
}