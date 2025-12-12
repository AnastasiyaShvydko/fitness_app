// // CartPage.jsx
// import { useMemo, useState } from "react";
// import { Row, Col, ListGroup, Button, Form } from "react-bootstrap";


// const CURRENCY = "CAD";
// const fmt = new Intl.NumberFormat("en-CA", { style: "currency", currency: CURRENCY });

// export default function Cart({cart, setCart}) {
//   //const {  add, removeOneBySku, removeAllBySku, clear } = useCart();

//   // Группируем одинаковые товары (по sku) в линии
//   const lines = useMemo(() => {
//     const map = new Map();
//     for (const item of cart) {
//       const key = item.sku ?? item.id ?? item.slug;
//       if (!key) continue;
//       if (!map.has(key)) {
//         map.set(key, {
//           sku: key,
//           title: item.title ?? item.name ?? "Product",
//           price: Number(item.price ?? item.variantPrice ?? 0),
//           image: item.images?.[0] ?? item.baseImages?.[0] ?? item.image ?? "",
//           item,
//           qty: 0,
//         });
//       }
//       map.get(key).qty += 1;
//     }
//     return [...map.values()];
//   }, [cart]);

//   const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);

//   // Shipping / promo
//   const [shippingKey, setShippingKey] = useState("standard");
//   const shippingMap = { standard: 5, express: 15, pickup: 0 };
//   const shipping = shippingMap[shippingKey] ?? 0;

//   const [code, setCode] = useState("");
//   const discount = code.trim().toUpperCase() === "SAVE10" ? subtotal * 0.1 : 0;

//   const total = Math.max(0, subtotal + shipping - discount);

//   return (
//     <Row className="g-4">
//       <Col lg={8}>
//         <h4 className="mb-3">Shopping Cart</h4>
//         {lines.length === 0 ? (
//           <p>Your cart is empty.</p>
//         ) : (
//           <ListGroup variant="flush">
//             {lines.map(line => (
//               <ListGroup.Item key={line.sku} className="d-flex align-items-center justify-content-between">
//                 <div className="d-flex align-items-center">
//                   {line.image ? (
//                     <img src={line.image} alt={line.title} width={60} height={60} style={{ objectFit: "cover", borderRadius: 8 }} />
//                   ) : (
//                     <div style={{ width: 60, height: 60, background: "#eee", borderRadius: 8 }} />
//                   )}
//                   <div className="ms-3">
//                     <div className="fw-semibold">{line.title}</div>
//                     <div className="text-muted">{fmt.format(line.price)}</div>
//                   </div>
//                 </div>

//                 <div className="d-flex align-items-center">
//                   <Button variant="light"  disabled={line.qty <= 0} aria-label="Decrease">
//                     −
//                   </Button>
//                   <span className="mx-2" style={{ minWidth: 24, textAlign: "center" }}>{line.qty}</span>
//                   <Button variant="light"  aria-label="Increase">
//                     +
//                   </Button>
//                 </div>

//                 <div className="fw-semibold">{fmt.format(line.price * line.qty)}</div>

//                 <Button variant="link" className="text-danger ms-2" >
//                   ×
//                 </Button>
//               </ListGroup.Item>
//             ))}
//           </ListGroup>
//         )}

//         {lines.length > 0 && (
//           <div className="mt-3">
//             <Button variant="outline-danger" >Clear cart</Button>
//           </div>
//         )}
//       </Col>

//       <Col lg={4}>
//         <div className="p-3 rounded-3" style={{ background: "#f7f7f8" }}>
//           <h5 className="mb-3">Summary</h5>
//           <div className="d-flex justify-content-between mb-2">
//             <span>Items</span>
//             <span>{lines.reduce((n, l) => n + l.qty, 0)}</span>
//           </div>
//           <div className="d-flex justify-content-between mb-2">
//             <span>Subtotal</span>
//             <span>{fmt.format(subtotal)}</span>
//           </div>

//           <Form.Group className="mb-2">
//             <Form.Label className="small text-muted">Shipping</Form.Label>
//             <Form.Select value={shippingKey} onChange={e => setShippingKey(e.target.value)}>
//               <option value="standard">Standard — {fmt.format(shippingMap.standard)}</option>
//               <option value="express">Express — {fmt.format(shippingMap.express)}</option>
//               <option value="pickup">Pickup — {fmt.format(shippingMap.pickup)}</option>
//             </Form.Select>
//           </Form.Group>

//           <Form.Group className="mb-2">
//             <Form.Label className="small text-muted">Promo code</Form.Label>
//             <div className="d-flex gap-2">
//               <Form.Control value={code} onChange={e => setCode(e.target.value)} placeholder="Enter code" />
//               <Button variant="outline-secondary" onClick={() => setCode(code.trim())}>Apply</Button>
//             </div>
//             {discount > 0 && <div className="text-success small mt-1">Applied 10% off</div>}
//           </Form.Group>

//           <hr />

//           <div className="d-flex justify-content-between mb-3">
//             <span className="fw-semibold">Total</span>
//             <span className="fw-semibold">{fmt.format(total)}</span>
//           </div>

//           <Button variant="dark" className="w-100">Checkout</Button>
//         </div>
//       </Col>
//     </Row>
//   );
// }
// src/pages/Cart.jsx
import { useEffect, useMemo, useState } from "react";
import { Row, Col, ListGroup, Button, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";



const CURRENCY = "CAD";
const fmt = new Intl.NumberFormat("en-CA", { style: "currency", currency: CURRENCY });

export default function Cart({user}) {
    const navigate = useNavigate();
  // --- LS helpers (внутри файла)
  const readCart = () => {
    try { return JSON.parse(localStorage.getItem("cart")) || []; }
    catch { return []; }
  };
  const writeCart = (next) => {
    localStorage.setItem("cart", JSON.stringify(next));
    // уведомляем текущую вкладку и другие компоненты без перезагрузки
    window.dispatchEvent(new CustomEvent("cart:update"));
  };

  // --- state
  const [cart, setCart] = useState(readCart);

  // persist + оповещение
  useEffect(() => { writeCart(cart); }, [cart]);

  // слушаем внешние изменения: другая вкладка (storage) или наш кастомный ивент
  useEffect(() => {
    const onStorage = (e) => { if (e.key === "cart") setCart(readCart()); };
    const onCustom  = () => setCart(readCart());
    window.addEventListener("storage", onStorage);
    window.addEventListener("cart:update", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cart:update", onCustom);
    };
  }, []);

  // --- бизнес-логика в этом же файле
  const add = (item) => setCart(prev => [...prev, item]);
  const removeOneBySku = (sku) =>
    setCart(prev => {
      let removed = false;
      return prev.filter(it => (it.sku === sku && !removed) ? (removed = true, false) : true);
    });
  const removeAllBySku = (sku) => setCart(prev => prev.filter(it => it.sku !== sku));
  const clear = () => setCart([]);

  // группировка строк по SKU
  const lines = useMemo(() => {
    const map = new Map();
    for (const it of cart) {
      const key = it?.sku ?? it?.id ?? it?.slug;
      if (!key) continue;
      if (!map.has(key)) {
        map.set(key, {
          sku: key,
          title: it.title ?? it.name ?? "Product",
          price: Number(it.price ?? it.variantPrice ?? 0),
          image: it.images?.[0] ?? it.baseImages?.[0] ?? it.image ?? "",
          item: it,
          qty: 0,
        });
      }
      map.get(key).qty += 1;
    }
    return [...map.values()];
  }, [cart]);

  // суммы
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const [shippingKey, setShippingKey] = useState("standard");
  const shippingMap = { standard: 5, express: 15, pickup: 0 };
  const shipping = shippingMap[shippingKey] ?? 0;

  const [code, setCode] = useState("");
  const discount = code.trim().toUpperCase() === "SAVE10" ? subtotal * 0.1 : 0;
  const total = Math.max(0, subtotal + shipping - discount);

  const handleCheckout = () =>
  navigate("/checkout", { state: { lines, subtotal, shipping, discount, total } });
  return (
    <Row className="g-4">
      <Col lg={8}>
        <h4 className="mb-3">Shopping Cart</h4>
        {lines.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <ListGroup variant="flush">
            {lines.map(line => (
              <ListGroup.Item key={line.sku} className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  {line.image
                    ? <img src={line.image} alt={line.title} width={60} height={60} style={{ objectFit: "cover", borderRadius: 8 }} />
                    : <div style={{ width: 60, height: 60, background: "#eee", borderRadius: 8 }} />
                  }
                  <div className="ms-3">
                    <div className="fw-semibold">{line.title}</div>
                    <div className="text-muted">{fmt.format(line.price)}</div>
                  </div>
                </div>

                <div className="d-flex align-items-center">
                  <Button variant="light" onClick={() => removeOneBySku(line.sku)} disabled={line.qty <= 0} aria-label="Decrease">−</Button>
                  <span className="mx-2" style={{ minWidth: 24, textAlign: "center" }}>{line.qty}</span>
                  <Button variant="light" onClick={() => add(line.item)} aria-label="Increase">+</Button>
                </div>

                <div className="fw-semibold">{fmt.format(line.price * line.qty)}</div>

                <Button variant="link" className="text-danger ms-2" onClick={() => removeAllBySku(line.sku)}>×</Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}

        {lines.length > 0 && (
          <div className="mt-3">
            <Button variant="outline-danger" onClick={clear}>Clear cart</Button>
          </div>
        )}
      </Col>

      <Col lg={4}>
        <div className="p-3 rounded-3" style={{ background: "#f7f7f8" }}>
          <h5 className="mb-3">Summary</h5>
          <div className="d-flex justify-content-between mb-2">
            <span>Items</span><span>{lines.reduce((n, l) => n + l.qty, 0)}</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span>Subtotal</span><span>{fmt.format(subtotal)}</span>
          </div>

          <Form.Group className="mb-2">
            <Form.Label className="small text-muted">Shipping</Form.Label>
            <Form.Select value={shippingKey} onChange={e => setShippingKey(e.target.value)}>
              <option value="standard">Standard — {fmt.format(shippingMap.standard)}</option>
              <option value="express">Express — {fmt.format(shippingMap.express)}</option>
              <option value="pickup">Pickup — {fmt.format(shippingMap.pickup)}</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label className="small text-muted">Promo code</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control value={code} onChange={e => setCode(e.target.value)} placeholder="Enter code" />
              <Button variant="outline-secondary" onClick={() => setCode(code.trim())}>Apply</Button>
            </div>
            {discount > 0 && <div className="text-success small mt-1">Applied 10% off</div>}
          </Form.Group>

          <hr />
          <div className="d-flex justify-content-between mb-3">
            <span className="fw-semibold">Total</span><span className="fw-semibold">{fmt.format(total)}</span>
          </div>
          <Button variant="dark" className="w-100" onClick={handleCheckout}>Checkout</Button>
        </div>
      </Col>
    </Row>
  );
}
