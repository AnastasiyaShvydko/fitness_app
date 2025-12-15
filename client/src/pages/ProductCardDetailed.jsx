// ProductCardDetailed.jsx
import { useEffect, useMemo, useState } from "react";
import { Link,useParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

export default function ProductCardDetailed() {
  const [activeVariant, setActiveVariant] = useState(null);
  const [activeImg, setActiveImg] = useState(0);

  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  
  const [cart, setCart] = useState(() =>
  JSON.parse(localStorage.getItem("cart") || "[]")
);

  useEffect(() => {
    fetch(`${API}/api/store/products/${slug}`)
      .then(res => res.json())
      .then(setProduct)
      .catch(console.error);
  }, [slug]);

  const {
    title = "",
    category = "",
    baseImages = [],
    images: rootImages = [],
    variants = []
  } = product ?? {};

  // Инициализация выбранного варианта
  useEffect(() => {
    if (!activeVariant && variants.length) setActiveVariant(variants[0]);
  }, [variants, activeVariant]);





   useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);
  // Источник картинок: variant.images → baseImages → rootImages
  const images = useMemo(() => {
    const vi = activeVariant?.images ?? [];
    if (vi.length) return vi;
    if (baseImages.length) return baseImages;
    if (rootImages.length) return rootImages;
    console.log("Images:", product );
    return [];
    
  }, [activeVariant, baseImages, rootImages]);

  // Сброс индекса, если массив сменился
  useEffect(() => {
    if (activeImg >= images.length) setActiveImg(0);
    
  }, [images.length, activeImg]);

 
  const stock = activeVariant?.stock ?? 0;
  const sku = activeVariant?.sku ?? null;
  //const baseStock = activeVariant?.stock ?? 0;

  const countInCart = useMemo(() => {
  if (!activeVariant) return 0; // если ещё не выбран — просто 0
  return cart.reduce(
    (n, i) => n + (i.sku === activeVariant.sku ? 1 : 0),
    0
  );
}, [cart, activeVariant]);


  const stockLeft = Math.max(0, stock - countInCart);
  if (!product) {
    return (
      <div className="container py-5">
        <h4 className="mb-3">Product not found</h4>
        <Link to="/store">← Back to store</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (stockLeft <= 0) return;   
    if (!activeVariant) return;
    // добавить в cart в localStorage
    // { sku, size, price, quantity }
  
  console.log("Exists:", cart);
  cart.push(activeVariant);
  localStorage.setItem("cart", JSON.stringify(cart));
  setCart(cart);
  alert("Added to cart");}

  const priceText = activeVariant?.price != null ? `$${activeVariant.price.toFixed(2)}` : "";

  return (
    <div className="container py-4">
      <div className="row g-4">
        {/* Left: gallery */}
        <div className="col-md-6">
          <div className="d-flex gap-2 mb-3">
            {images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                width={70}
                height={70}
                style={{
                  objectFit: "cover",
                  cursor: "pointer",
                  border: i === activeImg ? "2px solid #000" : "1px solid #ccc",
                  borderRadius: 8
                }}
                onClick={() => setActiveImg(i)}
              />
            ))}
            {images.length === 0 && <span className="text-muted small">No images</span>}
          </div>

          {images[activeImg] ? (
            <img src={images[activeImg]} alt={title} className="img-fluid rounded" />
          ) : (
            <div className="ratio ratio-1x1 bg-light rounded d-flex align-items-center justify-content-center">
              <span className="text-muted">No image</span>
            </div>
          )}
        </div>

        {/* Right: info */}
        <div className="col-md-6">
          <h2 className="mb-1">{title}</h2>
          <div className="text-muted mb-2">{category}</div>
          <h4 className="mb-3">{priceText}</h4>

          <div className="mb-2 fw-semibold">Sizes</div>
          <div className="d-flex flex-wrap gap-2 mb-3">
            {variants.map(v => (
              <button
                key={v.sku}
                className={`btn btn-outline-dark rounded-circle ${
                  activeVariant?.sku === v.sku ? "active" : ""
                }`}
                style={{ width: 44, height: 44 }}
                onClick={() => {
                  setActiveVariant(v);
                  setActiveImg(0);
                }}
                disabled={stock <= 0}
                title={stock > 0 ? "In stock" : "Out of stock"}
              >
                {v.size}
              </button>
            ))}
          </div>

          <div>In stock: {stockLeft}</div>
        <button disabled={stockLeft <= 0} onClick={handleAddToCart}>
        {stockLeft > 0 ? "Add to cart" : "Sold out"}
        </button>

          <div className="mt-3">
            <Link to="/store">← Back to store</Link>
          </div>
        </div>
      </div>
    </div>
  );
}