// src/pages/ThankYou.jsx
import { useEffect } from "react";
import { Container, Card, Button } from "react-bootstrap";

function writeCart(next){ localStorage.setItem("cart", JSON.stringify(next)); }

export default function ThankYou(){
  useEffect(() => {
    // В учебном режиме можно очистить корзину просто по факту попадания сюда
    writeCart([]);
    window.dispatchEvent(new CustomEvent("cart:update"));
  }, []);

  return (
    <Container className="my-5">
      <Card className="p-4 text-center">
        <h3 className="mb-2">Thank you!</h3>
        <p className="text-muted mb-4">
          Your order is being processed. A confirmation email has been sent.
        </p>
        <div className="d-flex justify-content-center gap-2">
          <Button variant="dark" href="/">Continue shopping</Button>
          <Button variant="outline-secondary" href="/account/orders">View orders</Button>
        </div>
      </Card>
    </Container>
  );
}
