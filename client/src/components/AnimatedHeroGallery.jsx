// AnimatedHeroGallery.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight, FaCircle, FaRegCircle } from "react-icons/fa";
import "./AnimatedHeroGallery.css";

export default function AnimatedHeroGallery({
  slides = [],
  intervalMs = 5000,
  effect = "fade",
  height = 520,
}) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const hoveringRef = useRef(false);
  const count = slides.length;
  const navigate = useNavigate();

  const next = () => setIndex((i) => (i + 1) % count);
  const prev = () => setIndex((i) => (i - 1 + count) % count);
  const goTo = (i) => setIndex(i % count);

  const handleCtaClick = (c, e) => {
    e.preventDefault();
    console.log("CTA clicked:", c);
    alert("Button clicked!");
    if (c.action === "route" && c.href) navigate(c.href);
  };

  useEffect(() => {
    if (!count) return;
    clearInterval(timerRef.current);
    if (!hoveringRef.current) timerRef.current = setInterval(next, intervalMs);
    return () => clearInterval(timerRef.current);
  }, [index, count, intervalMs]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleMouseEnter = () => {
    hoveringRef.current = true;
    clearInterval(timerRef.current);
  };
  const handleMouseLeave = () => {
    hoveringRef.current = false;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(next, intervalMs);
  };

  const safeSlides = useMemo(() => slides.filter(Boolean), [slides]);
  if (!safeSlides.length) return null;

  return (
    <div
      className="position-relative overflow-hidden rounded-4"
      style={{ height, maxHeight: "70vh" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-roledescription="carousel"
    >
      {safeSlides.map((s, i) => {
        const isActive = i === index;
        return (
          <div
            key={i}
            className={`gallery-slide ${effect} ${isActive ? "active" : ""}`}
            aria-hidden={!isActive}
          >
            <img
              src={s.image}
              alt={s.alt || s.title || `Slide ${i + 1}`}
              className="w-100 h-100"
              style={{ objectFit: "cover" }}
              draggable={false}
            />
            <div className="slide-content">
              {s.badge && <span className="badge bg-warning text-dark mb-2">{s.badge}</span>}
              {s.title && <h1 className="text-white fw-bold mb-2">{s.title}</h1>}
              {s.subtitle && <p className="text-white-50 fs-5 mb-4">{s.subtitle}</p>}
              <div className="d-flex flex-wrap gap-2">
                {s.cta?.map((c, j) => {
                  const label = c.label || "Action";
                  const variant = c.variant === "outline" ? "btn-outline-light" : "btn-light";
                  if (c.action) {
                    return (
                      <button key={j} className={`btn ${variant}`} onClick={(e) => handleCtaClick(c, e)}>
                        {label}
                      </button>
                    );
                  }
                  return (
                    <Link key={j} to={c.href || "#"} className={`btn ${variant}`} onClick={(e) => handleCtaClick(c, e)}>
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}

      {/* navigation arrows */}
      {safeSlides.length > 1 && (
        <>
          <button className="hero-nav hero-nav--prev" onClick={prev}>
            <FaChevronLeft />
          </button>
          <button className="hero-nav hero-nav--next" onClick={next}>
            <FaChevronRight />
          </button>
        </>
      )}

      {/* dots */}
      {safeSlides.length > 1 && (
        <div className="hero-dots">
          {safeSlides.map((_, i) => (
            <button key={i} className={`dot ${i === index ? "active" : ""}`} onClick={() => goTo(i)} />
          ))}
        </div>
      )}

      {/* local CSS */}
      <style>{`
        .gallery-slide {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          transition: opacity 0.7s ease;
          pointer-events: none; /* prevent clicks on inactive slides */
        }
        .gallery-slide.active {
          opacity: 1;
          pointer-events: auto; /* allow clicks */
        }
        .slide-content {
          position: absolute;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          max-width: 720px;
          padding-left: 6rem;
          z-index: 10;
        }
          .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 0;
  background: rgba(255,255,255,0.6);
  padding: 0;
  margin: 0 4px;
  display: inline-block;
  vertical-align: middle;
}
.dot.active {
  background: #fff;
  transform: scale(1.2);
}
      `}</style>
    </div>
  );
}
