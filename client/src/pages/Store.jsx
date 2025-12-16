import { useEffect, useState } from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import ProductCard from "../components/ProductCard"; // путь к твоему компоненту
import { apiFetch } from "../../api/apiClient";

const API = import.meta.env.VITE_API_URL;
export default function StorePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/api/store/products`) // бекенд
     .then((res) => res.json()) // Parse response as JSON
    .then((data) => {
     // Add this line
      setProducts(data || []);
      setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Store</h2>
      <Row className="g-4">
        {products.map((p) => (
          <Col key={p.id} xs={12} sm={6} md={4} lg={3}>
            {/* прокидываем данные в карточку */}
            <ProductCard product={p}            
        />
          </Col>
        ))}
      </Row>
    </Container>
  );
}
