// src/pages/BookTrial.jsx
import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/apiClient";


const fmtTime = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(); d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); // locale-friendly
};

const todayISO = () => new Date().toISOString().slice(0, 10);
const plusDaysISO = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);

// Fallback генератор слотов (если API не настроен)
// function defaultSlotsFor(dateStr) {
//   const d = new Date(dateStr + "T12:00:00");
//   const dow = d.getDay(); // 0 Sun … 6 Sat
//   if (dow === 0) return []; // воскресенье — выходной
//   const base = ["09:00", "11:00", "13:00", "15:00", "17:30"];
//   // Пятница укороченный день как пример
//   return dow === 5 ? base.slice(0, 4) : base;
// }

export default function BookTrial() {
  const navigate = useNavigate();

  // ---- form state
  const [date, setDate] = useState(todayISO());
  const [slots, setSlots] = useState([]);
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [slotId, setSlotId] = useState("");

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: ""
  });

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  // ---- hydrate user from LS
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      if (u) {
        setForm(f => ({
          ...f,
          email: f.email || u.email || "",
          phone: f.phone || u.phone || "",
          firstName: f.firstName || u.firstName || u.given_name || "",
          lastName: f.lastName || u.lastName || u.family_name || "",
        }));
      }
    } catch {}
  }, []);

  // ---- load availability for selected date (API -> fallback)
  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoadingSlots(true); setError(""); setTime("");
      try {
        console.log("Fetching slots for date:", date);
      const res = await apiFetch(`/api/slots/available?date=${date}`);
if (res.ok) {
  const json = await res.json();
  console.log("Fetched slots:", json);
  if (!ignore) setSlots(Array.isArray(json) ? json : []);
} else {
  if (!ignore) setSlots(defaultSlotsFor(date));
}
      } catch {
        if (!ignore) setSlots(defaultSlotsFor(date));
      } finally {
        if (!ignore) setLoadingSlots(false);
      }
    })();
    return () => { ignore = true; };
  }, [date]);

  const itemsCount = useMemo(() => slots.length, [slots]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const validate = () => {
    if (!date) return "Please select a date.";
    if (!time) return "Please choose a time slot.";
    if (!form.email) return "Email is required.";
    if (!form.firstName || !form.lastName) return "Full name is required.";
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setError(v); setOk(""); return; }

    setSubmitting(true); setError(""); setOk("");
    try {
      const token = localStorage.getItem("authToken");
      console.log(slotId) // опционально
      const payload = {
        slotId,
        date, time,
        customer: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
         
        },
        notes,
        source: "trial",
      };

      const res = await apiFetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Booking failed (${res.status})`);
      }

      setOk("Your trial class is booked! A confirmation email has been sent.");
      // Навигация на страницу благодарности через пару секунд или сразу:
      setTimeout(() => navigate("/thank-you-booking"), 800);
    } catch (e2) {
      setError(e2.message || "Failed to book. Try another time slot.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="my-4">
      <Row className="g-4">
        <Col lg={7}>
          <h4 className="mb-3">Book a Trial Class</h4>
          {error && <Alert variant="danger">{error}</Alert>}
          {ok && <Alert variant="success">{ok}</Alert>}

          <Card className="mb-3">
            <Card.Body as={Form} onSubmit={submit}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={date}
                      min={todayISO()}
                      max={plusDaysISO(30)}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Time</Form.Label>
                    <div className="d-flex flex-wrap gap-2">
                      {loadingSlots && <Badge bg="secondary">Loading…</Badge>}
                      {!loadingSlots && itemsCount === 0 && (
                        <div className="text-muted">No slots available for this date.</div>
                      )}
                 {!loadingSlots && slots.map((s) => (
                      <Button
                        key={s._id}
                        size="sm"
                        variant={time === s.time ? "dark" : "outline-secondary"}
                        onClick={() => {setTime(s.time);
                          setSlotId(s._id);}
                        }
                        disabled={!s.available}
                      >
                        {fmtTime(s.time)}
                      </Button>
                    ))}
                    </div>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>First name</Form.Label>
                    <Form.Control name="firstName" value={form.firstName} onChange={onChange} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Last name</Form.Label>
                    <Form.Control name="lastName" value={form.lastName} onChange={onChange} required />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" name="email" value={form.email} onChange={onChange} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Phone (optional)</Form.Label>
                    <Form.Control name="phone" value={form.phone} onChange={onChange} />
                  </Form.Group>
                </Col>

                <Col xs={12}>
                  <Form.Group>
                    <Form.Label>Notes (optional)</Form.Label>
                    <Form.Control as="textarea" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any preferences, injuries, or accessibility needs…" />
                  </Form.Group>
                </Col>

                <Col xs={12}>
                  <Button type="submit" variant="dark" disabled={submitting || !time}>
                    {submitting ? "Booking…" : "Book trial"}
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card>
            <Card.Body>
              <h5>What to expect</h5>
              <ul className="mb-3">
                <li>45–60 min guided session</li>
                <li>Bring water and indoor shoes</li>
                <li>Please arrive 10 min early</li>
              </ul>
              <h6 className="mb-2">Your selection</h6>
              <div className="d-flex justify-content-between">
                <span>Date</span><span>{new Date(date).toLocaleDateString()}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Time</span><span>{time ? fmtTime(time) : "-"}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
