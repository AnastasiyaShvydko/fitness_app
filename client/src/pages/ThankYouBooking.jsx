// src/pages/ThankYou.jsx
import { Container, Card, Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";

export default function ThankYouBooking() {
  const navigate = useNavigate();
  const location = useLocation();

  // Optional: get order ID from query string
  const params = new URLSearchParams(location.search);
  const orderId = params.get("order");

  return (
    <Container className="my-5">
      <Card className="text-center p-4">
        <h2>Thank You!</h2>
        <p>Your trial class has been booked successfully.</p>
        {orderId && <p>Booking ID: <strong>{orderId}</strong></p>}
        <Button variant="dark" onClick={() => navigate("/")}>
          Back to Home
        </Button>
      </Card>
    </Container>
  );
}
