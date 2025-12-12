
import { useEffect, useState } from "react";
import { Container, Card } from "react-bootstrap";
import SearchBar from "../components/SearchBar";
import { useSearchParams } from "react-router-dom";

export default function SearchPage(){
    const [params, setParams] = useSearchParams();
  const q = (params.get("q") || "").trim(); 
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (!q) { setItems([]); return; }
    const url = `/api/search?${new URLSearchParams({ q })}`;
    const ctrl = new AbortController();
    console.log("→ GET", url);
    setLoading(true);
    fetch(url, { signal: ctrl.signal })
      .then(r => r.json())
      .then(setItems)
      .catch(err => { if (err.name !== "AbortError") console.error(err); setItems([]); })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [q]);

  return (
    <Container className="my-4">
   <h1>Hi</h1>
   <p>{items.lengt}{q}</p>
      {items.map((it, i) => (
        <Card key={i} className="mb-2 p-3">
          <div className="fw-semibold">{it.title}</div>
          <div className="text-muted small">{it.description}</div>
          {"score" in it && <div className="small">score: {it.score?.toFixed?.(4)}</div>}
        </Card>
      ))}
    </Container>
  );
}
