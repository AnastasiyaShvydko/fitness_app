// components/ProductCard.jsx
import { Card, Button } from "react-bootstrap";
import { FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  const { title, slug, category, rating = 0, baseImages = [], variants = [] } = product;

  // thumb: сначала общая, иначе первая из варианта
  const thumb =
    baseImages[0] ??
    variants.find(v => v?.images?.length)?.images?.[0] ??
    "/img/placeholder.png";

  // цены: min/max по вариантам
  const prices = variants.map(v => Number(v.price)).filter(Number.isFinite);
  const priceFrom = prices.length ? Math.min(...prices) : 0;
  const priceTo   = prices.length ? Math.max(...prices) : 0;
  const priceText = priceFrom === priceTo ? `$${priceFrom.toFixed(2)}` : `$${priceFrom.toFixed(2)}–$${priceTo.toFixed(2)}`;

  // размеры (уникальные)
  const sizes = Array.from(new Set(variants.map(v => v.size).filter(Boolean))).slice(0, 6); // показываем до 6

  return (
    <Card className="h-100 shadow-sm border-0 rounded-4 text-center">
      <Card.Img
        variant="top"
        src={thumb}
        alt={title}
        style={{ height: 160, objectFit: "contain", marginTop: 10 }}
      />
      <Card.Body className="d-flex flex-column">
        <Card.Subtitle className="text-muted small">{category}</Card.Subtitle>
        <Card.Title className="mt-1">{title}</Card.Title>

        {/* Rating */}
        <div className="mb-2">
          {[...Array(5)].map((_, i) => (
            <FaStar key={i} color={i < Math.round(rating) ? "orange" : "lightgray"} />
          ))}
        </div>

        {/* Price */}
        <h5 className="fw-bold mb-2">{priceText}</h5>

        {/* Sizes preview */}
        <div className="d-flex justify-content-center flex-wrap gap-2 mb-3">
          {sizes.map(s => (
            <span key={s} className="badge text-bg-light border">{s}</span>
          ))}
          {variants.length > sizes.length && (
            <span className="badge text-bg-light border">+{variants.length - sizes.length}</span>
          )}
        </div>

        <Button as={Link} to={`/products/${slug}`} className="mt-auto rounded-3">
          View
        </Button>
      </Card.Body>
    </Card>
  );
}
