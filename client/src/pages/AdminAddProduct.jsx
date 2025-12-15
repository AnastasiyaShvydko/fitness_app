import React, { useState } from "react";
import { useRef } from "react";
import { CLOUD_NAME, UPLOAD_PRESET } from "../../config/cloudinary"; // Adjust the path as necessary

export default function AdminAddProduct() {
  const API = import.meta.env.VITE_API_URL;
  const variantFileRef = useRef(null);

  const baseImageFileRef = useRef(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    category: "",
    rating: 0,
    baseImages: [],
    variants: [],
  });

  const [variant, setVariant] = useState({
    sku: "",
    size: "",
    color: "",
    price: "",
    stock: "",
    images: [],
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [variantImageFiles, setVariantImageFiles] = useState([]);
  const [checked, setChecked] = useState(false);
  // Cloudinary config


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleVariantChange = (e) => {
    setVariant({ ...variant, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (files, setImages) => {
    const urls = [];
    for (let file of files) {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", UPLOAD_PRESET);
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: data }
      );
      const json = await res.json();
       if (json.secure_url) urls.push(json.secure_url);
  }
  console.log("Uploaded URLs:", urls);
  return urls; // <-- ВАЖНО
  };
const handleBaseImages = async (e) => {
  const files = Array.from(e.target.files);
  setImageFiles(files);
  const urls = await handleImageUpload(files, () => {});
   console.log("Base image URLs:", urls);
    setForm(f => {
    const next = { ...f, baseImages: urls };
    console.log("FORM after baseImages:", next); // ← тут должны быть urls
    return next;
  });
};

const handleVariantImages = async (e) => {
  const files = Array.from(e.target.files);
  setVariantImageFiles(files);
  const urls = await handleImageUpload(files, () => {});
  console.log("Variant image URLs:", urls);
   setVariant(v => {
    const next = { ...v, images: urls };
    console.log("VARIANT after images:", next);
    return next;
  });
};

  const addVariant = () => {
  const v = {
    ...variant,
    sku:  (variant.sku  || "").trim(),
    size: (variant.size || "").trim(),
    price: Number(variant.price),
    stock: Number(variant.stock || 0),
    images: Array.isArray(variant.images) ? [...variant.images] : []
  };
  if (!v.sku)  return alert("SKU is required");
  if (!v.size) return alert("Size is required");
  if (!Number.isFinite(v.price) || v.price <= 0) return alert("Price is invalid");

  setForm(f => ({ ...f, variants: [...f.variants, v] })); // ✅ пушим копию
  setVariant({ sku:"", size:"ff", color:"", price:"", stock:"", images:[] });
  if (variantFileRef.current) variantFileRef.current.value = ""; // очищаем мини-форму
  setVariantImageFiles([]);
};
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Send form data to backend
    try {
    const res = await fetch(`${API}/api/store/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      alert("Error: " + (data.message || "Unknown error"));
    } else {
    alert("Product added!");
    setForm({
      title: "",
      slug: "",
      description: "",
      category: "",
      rating: 0,
      baseImages: [],
      variants: [],
    });
    if (baseImageFileRef.current) baseImageFileRef.current.value = "";
  }
  } catch (err) {
    alert("Network error: " + err.message);
  }
};

  return (
    <form noValidate onSubmit={handleSubmit} style={{ maxWidth: 600, margin: "2rem auto" }}>
      <h2>Add New Product</h2>
      <input name="title" placeholder="Title" value={form.title} onChange={handleChange}  className="form-control mb-2" />
      <input name="slug" placeholder="Slug" value={form.slug} onChange={handleChange}  className="form-control mb-2" />
      <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className="form-control mb-2" />
      <input name="category" placeholder="Category" value={form.category} onChange={handleChange} className="form-control mb-2" />
      <input name="rating" type="number" placeholder="Rating" value={form.rating} onChange={handleChange} className="form-control mb-2" />
      <label>Base Images:</label>
      <input 
      type="file" 
      multiple 
      ref={baseImageFileRef}
      onChange={handleBaseImages} 
      className="form-control mb-2" />
      <hr />
     <ul className="list-group mb-3">
  {form.variants.map((v, i) => (
    <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
      <span>
        <strong>{v.sku}</strong> · size {v.size}
        {v.color ? ` · ${v.color}` : ""} · ${v.price} · stock {v.stock}
        {v.images?.length ? ` · images: ${v.images.length}` : ""}
      </span>
      <button
        type="button"
        className="btn btn-sm btn-outline-danger"
        onClick={() => setForm(f => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }))}
      >
        Remove
      </button>
    </li>
  ))}
  </ul>
      <h4>Add Variant</h4>
      <input name="sku" placeholder="SKU" value={variant.sku} onChange={handleVariantChange} required className="form-control mb-2" />
      <input name="size" placeholder="Size" value={variant.size} onChange={handleVariantChange} required className="form-control mb-2" />
      <input name="color" placeholder="Color" value={variant.color} onChange={handleVariantChange} className="form-control mb-2" />
      <input name="price" type="number" placeholder="Price" value={variant.price} onChange={handleVariantChange} required className="form-control mb-2" />
      <input name="stock" type="number" placeholder="Stock" value={variant.stock} onChange={handleVariantChange} className="form-control mb-2" />
      <label>Variant Images:</label>
      <input
  ref={variantFileRef}
  type="file"
  multiple
  onChange={handleVariantImages}
  className="form-control mb-2"
/>
      <button type="button" onClick={addVariant} className="btn btn-secondary mb-3">Add Variant</button>
      <div className="d-flex flex-wrap gap-2 mb-2">
  {(variant.images || []).map((src, i) => (
    <div key={i} style={{ position: "relative" }}>
      <img src={src} alt="" width={72} height={72} style={{objectFit:"cover", borderRadius:8}} />
      <button
        type="button"
        className="btn btn-sm btn-danger"
        style={{ }}
        onClick={() =>
          setVariant(v => ({ ...v, images: v.images.filter((_, idx) => idx !== i) }))
        }
        aria-label="Remove image"
      >
        ×
      </button>
    </div>
  ))}
</div>
      <hr />
       
      <button type="submit" className="btn btn-primary">Add Product</button>
    </form>
  );
}