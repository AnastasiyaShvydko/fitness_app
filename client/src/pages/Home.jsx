// src/pages/Home.jsx
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { FaShoppingCart, FaBolt, FaCalendar, FaMapMarkerAlt, FaStar } from "react-icons/fa";
import { useMemo, useState, useEffect } from "react";
import AnimatedHeroGallery from "../components/AnimatedHeroGallery";
import SearchBar  from "../components/SearchBar";
import { Link, useNavigate } from "react-router-dom";
import BodyMap from "../components/BodySelector";

const VITE_API_URL = import.meta.env.VITE_API_URL;
// const slides = [
//   {
//     image: "https://res.cloudinary.com/dbh4o00x2/image/upload/v1756408426/meghan-holmes-buWcS7G1_28-unsplash_cla9qj.jpg",
//     title: "Train smarter, feel stronger",
//     subtitle: "Join premium classes and events. First month 50% off.",
//     badge: "New",
//     cta: [
//       { label: "Join now", href: "#membership" },
//       { label: "View events", href: "#events", variant: "outline" },
//     ],
//   },
//   {
//     image: "https://picsum.photos/seed/h2/1600/900",
//     title: "Sunrise Yoga · Every Week",
//     subtitle: "Calm mind, strong body — book your mat today.",
//     cta: [{ label: "Book class", href: "/events/yoga" }],
//   },
//   {
//     image: "https://picsum.photos/seed/h3/1600/900",
//     title: "Pro Membership",
//     subtitle: "Unlimited classes, 24/7 access, priority support.",
//     cta: [{ label: "Add to cart", href: "#", onClick: (e)=>{ e.preventDefault(); addToCartLS({ sku:"MEM_PRO", title:"Pro Membership", price:19.99 }); } }],
//   },
// ];
// --- minimal cart helpers (LS + notify current tab)
function readCart() {
  try { return JSON.parse(localStorage.getItem("cart")) || []; } catch { return []; }
}
function writeCart(next) {
  localStorage.setItem("cart", JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("cart:update"));
}
function addToCartLS(item) {
  const arr = readCart();
  arr.push(item);
  writeCart(arr);
}
function buyNow(item) {
  addToCartLS(item);
  window.location.href = "/cart";
}

// --- mock data
const MEMBERSHIPS = [
  {
    sku: "MEM_BASIC",
    title: "Basic Membership",
    price: 9.99,
    period: "/mo",
    features: ["Gym access", "1 class / week", "Email support"],
    images: ["https://picsum.photos/seed/mem1/640/360"]
  },
  {
    sku: "MEM_PRO",
    title: "Pro Membership",
    price: 19.99,
    period: "/mo",
    features: ["24/7 access", "Unlimited classes", "Priority support"],
    badge: "Best Value",
    images: ["https://picsum.photos/seed/mem2/640/360"]
  }
];

const EVENTS = [
  {
    sku: "EVT_YOGA_101",
    title: "Sunrise Yoga",
    date: "Oct 5, 08:00",
    location: "Studio A",
    price: 15,
    images: ["https://picsum.photos/seed/event1/640/360"]
  },
  {
    sku: "EVT_HIIT_201",
    title: "HIIT Blast",
    date: "Oct 7, 18:30",
    location: "Main Hall",
    price: 18,
    images: ["https://picsum.photos/seed/event2/640/360"]
  },
  {
    sku: "EVT_SPIN_301",
    title: "Spin Night Ride",
    date: "Oct 12, 20:00",
    location: "Cycling Room",
    price: 20,
    images: ["https://picsum.photos/seed/event3/640/360"]
  }
];

const REVIEWS = [
  { id: 1, name: "Anna K.", rating: 5, text: "Great trainers, clean space, love the classes!" },
  { id: 2, name: "Mark T.", rating: 4, text: "Pro plan worth it. Events are fun and intense." },
  { id: 3, name: "Sophie L.", rating: 5, text: "Joined last month — already see results!" }
];

export default function Home() {

  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const [slides, setSlides] = useState([]);
useEffect(() => {
  fetch(`${VITE_API_URL}/api/slides`).then(r => r.json()).then(setSlides).catch(()=>setSlides([]));
}, []);

 const onSubmit = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <>
      {/* HERO */}
      {/* <section
        style={{
          backgroundImage: "url('https://picsum.photos/seed/hero/1600/600')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "1rem",
          margin: "1rem",
        }}
      >
        <Container style={{ padding: "6rem 1rem" }}>
          <Row>
            <Col md={8} lg={6} style={{ background: "rgba(0,0,0,0.55)", borderRadius: "1rem", padding: "2rem" }}>
              <h1 className="text-white mb-2">Stronger starts today</h1>
              <p className="text-white-50 mb-4">Join classes, book events, and become a member in one click.</p>
              <div className="d-flex gap-2">
                <a className="btn btn-light" href="#membership"><FaBolt className="me-1" /> Join Now</a>
                <a className="btn btn-outline-light" href="#events">View Events</a>
              </div>
            </Col>
          </Row>
        </Container>
      </section> */}
      <div className="container my-4">
      <AnimatedHeroGallery slides={slides} intervalMs={5000} effect="fade" height={560} />

      <Container className="my-5" id="events">
        <h3 className="mb-3">Upcoming Events</h3>
        <Row className="g-4">
          {EVENTS.map(ev => (
            <Col md={6} lg={4} key={ev.sku}>
              <Card className="h-100 shadow-sm">
                <Card.Img variant="top" src={ev.images[0]} alt={ev.title} style={{ objectFit: "cover", height: 180 }} />
                <Card.Body className="d-flex flex-column">
                  <Card.Title>{ev.title}</Card.Title>
                  <div className="text-muted small mb-2"><FaCalendar className="me-1" />{ev.date} &nbsp; <FaMapMarkerAlt className="me-1" />{ev.location}</div>
                  <div className="mt-auto d-flex justify-content-between align-items-center">
                    <div className="fw-semibold">${ev.price.toFixed(2)}</div>
                    <div className="d-flex gap-2">
                      <Button variant="outline-secondary" onClick={() => addToCartLS({ ...ev, price: ev.price })}>
                        <FaShoppingCart className="me-1" /> Add to cart
                      </Button>
                      <Button variant="dark" onClick={() => buyNow({ ...ev, price: ev.price })}>Buy</Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      <Container className="my-5" id="membership">
        <h3 className="mb-3">Membership</h3>
        <Row className="g-4">
          {MEMBERSHIPS.map(m => (
            <Col md={6} key={m.sku}>
              <Card className="h-100 shadow-sm">
                <Card.Img variant="top" src={m.images[0]} alt={m.title} style={{ objectFit: "cover", height: 200 }} />
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start">
                    <Card.Title className="mb-2">{m.title}</Card.Title>
                    {m.badge && <Badge bg="success">{m.badge}</Badge>}
                  </div>
                  <div className="fs-4 fw-semibold mb-2">${m.price.toFixed(2)} <span className="fs-6 text-muted">{m.period}</span></div>
                  <ul className="mb-4">
                    {m.features.map(f => <li key={f}>{f}</li>)}
                  </ul>
                  <div className="mt-auto d-flex gap-2">
                    <Button variant="outline-secondary" onClick={() => addToCartLS({ ...m, price: m.price })}>
                      <FaShoppingCart className="me-1" /> Add to cart
                    </Button>
                    <Button variant="dark" onClick={() => buyNow({ ...m, price: m.price })}>Buy now</Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
      <Container>
        <div className="ms-md-3 w-100" style={{ maxWidth: 360 }}>
            <SearchBar
              value={q}
              onChange={setQ}
              onSubmit={onSubmit}
              placeholder="Search classes…"
            />
          </div>
      </Container>
       <Container>
        <div className="ms-md-3 w-100" style={{ maxWidth: 360 }}>
            <BodyMap
            />
          </div>
      </Container>

      <Container className="my-5" id="reviews">
        <h3 className="mb-3">Reviews</h3>
        <Row className="g-4">
          {REVIEWS.map(r => (
            <Col md={6} lg={4} key={r.id}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <div className="mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FaStar key={i} className={i < r.rating ? "text-warning" : "text-muted"} />
                    ))}
                  </div>
                  <Card.Text className="mb-2">“{r.text}”</Card.Text>
                  <div className="text-muted small">— {r.name}</div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      <footer className="py-4" style={{ background: "#f7f7f8" }}>
        <Container className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <div>© {new Date().getFullYear()} FitClub</div>
          <div className="d-flex gap-3">
            <a href="/about" className="text-decoration-none text-dark">About</a>
            <a href="/contact" className="text-decoration-none text-dark">Contact</a>
            <a href="/terms" className="text-decoration-none text-dark">Terms</a>
          </div>
        </Container>
      </footer>
      </div>
    </>

  );
}
