// src/pages/Checkout.jsx
import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Card, ListGroup, Form, Button, Alert } from "react-bootstrap";
import { apiFetch } from "../api/apiClient";

const CURRENCY = "CAD";
const fmt = new Intl.NumberFormat("en-CA", { style: "currency", currency: CURRENCY });

// --- Cart helpers
function readCart() {
  try { return JSON.parse(localStorage.getItem("cart")) || []; } catch { return []; }
}
function writeCart(next) {
  localStorage.setItem("cart", JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("cart:update"));
}

export default function Checkout({user,setUser}) {
  // cart state + sync
  const [cart, setCart] = useState(readCart);
  useEffect(() => { const onAny = (e) => setCart(readCart());
    window.addEventListener("storage", onAny);
    window.addEventListener("cart:update", onAny);
    return () => { window.removeEventListener("storage", onAny); window.removeEventListener("cart:update", onAny); };
  }, []);

  // group lines by sku
  const lines = useMemo(() => {
    const map = new Map();
    for (const it of cart) {
      const key = it?.sku ?? it?.id ?? it?.slug;
      if (!key) continue;
      if (!map.has(key)) {
        map.set(key, {
          sku: key,
          title: it.title ?? it.name ?? "Item",
          price: Number(it.price ?? it.variantPrice ?? 0),
          image: it.images?.[0] ?? it.baseImages?.[0] ?? it.image ?? "",
          qty: 0,
        });
      }
      map.get(key).qty += 1;
    }
    return [...map.values()];
  }, [cart]);

  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const [shippingKey, setShippingKey] = useState("standard");
  const shippingMap = { standard: 5, express: 15, pickup: 0 };
  const shipping = shippingMap[shippingKey] ?? 0;

  const [code, setCode] = useState("");
  const discount = code.trim().toUpperCase() === "SAVE10" ? subtotal * 0.1 : 0;
  const total = Math.max(0, subtotal + shipping - discount);

 useEffect(() => {
    const u = user || location.state?.user || null;
    if (!u) return;
    setForm(f => ({
      ...f,
      email:      f.email      || u.email      || "",
      phone:      f.phone      || u.phone      || "",
      firstName:  f.firstName  || u.firstName  || u.given_name || "",
      lastName:   f.lastName   || u.lastName   || u.family_name|| "",
      address1:   f.address1   || u.address?.line1   || "",
      address2:   f.address2   || u.address?.line2   || "",
      city:       f.city       || u.address?.city    || "",
      province:   f.province   || u.address?.province|| f.province,
      postal:     f.postal     || u.address?.postal  || "",
      country:    f.country    || u.address?.country || f.country,
      // billingSame оставляем как есть; при желании можно тоже заполнить зеркально
    }));
  }, [user, location.state])


  // form state
  const [form, setForm] = useState({
    email: "", phone: "",
    firstName: "", lastName: "",
    address1: "", address2: "", city: "", province: "ON", postal: "", country: "CA",
    billingSame: true,
    bill_firstName: "", bill_lastName: "", bill_address1: "", bill_address2: "", bill_city: "", bill_province: "ON", bill_postal: "", bill_country: "CA",
    notes: "",
    paymentMethod: "card", // "card" | "pickup"
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  // very light validation (Canada postal, required fields)
  const caPostal = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
  function validate() {
    if (!lines.length) return "Your cart is empty.";
    if (!form.email) return "Email is required.";
    if (!form.firstName || !form.lastName) return "Name is required.";
    if (shippingKey !== "pickup") {
      if (!form.address1 || !form.city || !form.province || !form.postal) return "Complete shipping address.";
      if (!caPostal.test(form.postal)) return "Postal code looks invalid (e.g., M5V 3L9).";
    }
    if (!form.billingSame) {
      if (!form.bill_firstName || !form.bill_lastName || !form.bill_address1 || !form.bill_city || !form.bill_province || !form.bill_postal) {
        return "Complete billing address.";
      }
      if (!caPostal.test(form.bill_postal)) return "Billing postal code looks invalid.";
    }
    return "";
  }

  // submit order
async function placeOrder() {
  const v = validate();
  if (v) { setError(v); return; }
  setError(""); setBusy(true);

  const payload = {
    customer: { email: form.email, phone: form.phone, name: `${form.firstName} ${form.lastName}`.trim() },
    shippingMethod: shippingKey,
    shippingAddress: shippingKey === "pickup" ? null : {
      firstName: form.firstName, lastName: form.lastName,
      address1: form.address1, address2: form.address2, city: form.city,
      province: form.province, postal: form.postal, country: form.country
    },
    billingAddress: form.billingSame ? "same" : {
      firstName: form.bill_firstName, lastName: form.bill_lastName,
      address1: form.bill_address1, address2: form.bill_address2, city: form.bill_city,
      province: form.bill_province, postal: form.bill_postal, country: form.bill_country
    },
    notes: form.notes,
    items: lines.map(l => ({ sku: l.sku, title: l.title, unitPrice: l.price, qty: l.qty })),
    amounts: { subtotal, shipping, discount, total, currency: CURRENCY },
    paymentMethod: form.paymentMethod
  };

  try {
    if (form.paymentMethod === "card") {
      const res = await apiFetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Checkout error: ${res.status}`);
      const { url } = await res.json();
      window.location.href = url;              // переход на Stripe Hosted Checkout
    } else {
      // Pay on pickup (создаём заказ сразу)
      const res = await apiFetch("/api/checkout/place-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Place order error: ${res.status}`);
      writeCart([]);                            // очистить локальную корзину
      window.location.href = "/thank-you";      // страница благодарности
    }
  } catch (e) {
    setError(e.message || "Failed to start checkout.");
  } finally {
    setBusy(false);
  }
}


  return (
    <Container className="my-4">
      <Row className="g-4">
        <Col lg={7}>
          <h4 className="mb-3">Checkout</h4>
          {error && <Alert variant="danger">{error}</Alert>}

          <Card className="mb-3">
            <Card.Body>
              <h5>Contact</h5>
              <Row className="g-3 mt-1">
                <Col md={8}><Form.Control name="email" value={form.email} onChange={onChange} placeholder="Email" /></Col>
                <Col md={4}><Form.Control name="phone" value={form.phone} onChange={onChange} placeholder="Phone (optional)" /></Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <h5>Shipping address</h5>
              <Row className="g-3 mt-1">
                <Col md={6}><Form.Control name="firstName" value={form.firstName} onChange={onChange} placeholder="First name" /></Col>
                <Col md={6}><Form.Control name="lastName"  value={form.lastName}  onChange={onChange} placeholder="Last name" /></Col>
                <Col xs={12}><Form.Control name="address1" value={form.address1} onChange={onChange} placeholder="Address" /></Col>
                <Col xs={12}><Form.Control name="address2" value={form.address2} onChange={onChange} placeholder="Apt, suite (optional)" /></Col>
                <Col md={6}><Form.Control name="city" value={form.city} onChange={onChange} placeholder="City" /></Col>
                <Col md={3}>
                  <Form.Select name="province" value={form.province} onChange={onChange}>
                    {["AB","BC","MB","NB","NL","NS","NT","NU","ON","PE","QC","SK","YT"].map(p => <option key={p} value={p}>{p}</option>)}
                  </Form.Select>
                </Col>
                <Col md={3}><Form.Control name="postal" value={form.postal} onChange={onChange} placeholder="Postal code" /></Col>
                <Col md={6}><Form.Select name="country" value={form.country} onChange={onChange}><option value="CA">Canada</option></Form.Select></Col>
              </Row>

              <Form.Check className="mt-3"
                type="checkbox" label="Billing same as shipping"
                name="billingSame" checked={form.billingSame} onChange={onChange} />

              {!form.billingSame && (
                <div className="mt-3">
                  <h6>Billing address</h6>
                  <Row className="g-3">
                    <Col md={6}><Form.Control name="bill_firstName" value={form.bill_firstName} onChange={onChange} placeholder="First name" /></Col>
                    <Col md={6}><Form.Control name="bill_lastName"  value={form.bill_lastName}  onChange={onChange} placeholder="Last name" /></Col>
                    <Col xs={12}><Form.Control name="bill_address1" value={form.bill_address1} onChange={onChange} placeholder="Address" /></Col>
                    <Col xs={12}><Form.Control name="bill_address2" value={form.bill_address2} onChange={onChange} placeholder="Apt, suite (optional)" /></Col>
                    <Col md={6}><Form.Control name="bill_city" value={form.bill_city} onChange={onChange} placeholder="City" /></Col>
                    <Col md={3}><Form.Select name="bill_province" value={form.bill_province} onChange={onChange}>
                      {["AB","BC","MB","NB","NL","NS","NT","NU","ON","PE","QC","SK","YT"].map(p => <option key={p} value={p}>{p}</option>)}
                    </Form.Select></Col>
                    <Col md={3}><Form.Control name="bill_postal" value={form.bill_postal} onChange={onChange} placeholder="Postal code" /></Col>
                    <Col md={6}><Form.Select name="bill_country" value={form.bill_country} onChange={onChange}><option value="CA">Canada</option></Form.Select></Col>
                  </Row>
                </div>
              )}

              <Form.Group className="mt-3">
                <Form.Label className="small text-muted">Notes (optional)</Form.Label>
                <Form.Control as="textarea" rows={3} name="notes" value={form.notes} onChange={onChange} placeholder="Delivery notes, access code…" />
              </Form.Group>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <h5>Shipping</h5>
              <Form.Select value={shippingKey} onChange={e => setShippingKey(e.target.value)}>
                <option value="standard">Standard — {fmt.format(shippingMap.standard)}</option>
                <option value="express">Express — {fmt.format(shippingMap.express)}</option>
                <option value="pickup">Pickup — {fmt.format(shippingMap.pickup)}</option>
              </Form.Select>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Body>
              <h5>Payment</h5>
              <Form.Check type="radio" name="paymentMethod" id="pm-card" label="Credit/Debit card (Stripe Checkout)"
                value="card" checked={form.paymentMethod === "card"} onChange={onChange} />
              <Form.Check type="radio" name="paymentMethod" id="pm-pickup" label="Pay on pickup"
                value="pickup" checked={form.paymentMethod === "pickup"} onChange={onChange} className="mt-2" />
              <div className="small text-muted mt-2">Card details are collected securely on Stripe.</div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card>
            <Card.Body>
              <h5>Order summary</h5>
              <ListGroup variant="flush" className="mt-2 mb-3">
                {lines.map(l => (
                  <ListGroup.Item key={l.sku} className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-semibold">{l.title}</div>
                      <div className="small text-muted">Qty {l.qty} × {fmt.format(l.price)}</div>
                    </div>
                    <div className="fw-semibold">{fmt.format(l.price * l.qty)}</div>
                  </ListGroup.Item>
                ))}
              </ListGroup>

              <Form.Group className="mb-2">
                <Form.Label className="small text-muted">Promo code</Form.Label>
                <Form.Control value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter code" />
              </Form.Group>

              <div className="d-flex justify-content-between">
                <span>Subtotal</span><span>{fmt.format(subtotal)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Shipping</span><span>{fmt.format(shipping)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Discount</span><span>{fmt.format(discount)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fs-5 mb-3">
                <span className="fw-semibold">Total</span><span className="fw-semibold">{fmt.format(total)}</span>
              </div>

              <Button
                variant="dark" className="w-100"
                disabled={!lines.length || busy} onClick={placeOrder}
              >
                {busy ? "Processing…" : "Pay now"}
              </Button>
              <div className="text-center mt-2">
                <a href="/cart" className="small">Back to cart</a>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
