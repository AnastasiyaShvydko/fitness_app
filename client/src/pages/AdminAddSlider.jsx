// AdminSlides.jsx
import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Card, Form, Button, ListGroup, InputGroup, Alert } from "react-bootstrap";

import { uploadImages } from "../utils/upload";
import { apiFetch } from "../api/apiClient";

async function onSlideImageSelect(files) {
  const [url] = await uploadImages(files);
  setDraft(d => ({ ...d, image: url || d.image }));
}
// helpers для <input type="datetime-local">
const toLocalInput = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  const pad = (n) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
};
const fromLocalInput = (s) => (s ? new Date(s) : null);

// начальный шаблон слайда
const emptySlide = {
  image: "",
  title: "",
  subtitle: "",
  badge: "",
  cta: [],               // [{label, href, variant}]
  order: 0,
  isActive: true,
  startAt: "",           // для input (строка)
  endAt: "",             // для input (строка)
  tags: [],
};

export default function AdminSlides() {
  const [slides, setSlides] = useState([]);
  const [draft, setDraft] = useState(emptySlide);
  const [editing, setEditing] = useState(-1);
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

const handleSlideImageUpload = async (e) => {
  const files = e.target.files;
  if (!files?.length) return;
  try {
    setUploading(true);
    const [url] = await uploadImages(files); // util returns array of URLs
    setDraftField("image", url);             // put URL into the form
  } catch (err) {
    setMsg(err.message || "Upload failed");
  } finally {
    setUploading(false);
    e.target.value = ""; // reset input
  }
};

  // загрузка из БД
  useEffect(() => {
    apiFetch("/api/slides")
      .then((r) => r.json())
      .then(setSlides)
      .catch(() => setSlides([]));
  }, []);

  const isValid = useMemo(() => !!draft?.image?.trim(), [draft]);

  const setDraftField = (k, v) => setDraft((d) => ({ ...d, [k]: v }));
  const updateCTA = (i, k, v) =>
    setDraft((d) => {
      const arr = [...(d.cta || [])];
      arr[i] = { ...arr[i], [k]: v };
      return { ...d, cta: arr };
    });

  const addCTA = () =>
    setDraft((d) => ({ ...d, cta: [...(d.cta || []), { label: "", href: "", variant: "light" }] }));
  const removeCTA = (i) =>
    setDraft((d) => ({ ...d, cta: (d.cta || []).filter((_, idx) => idx !== i) }));

  const resetForm = () => {
    setDraft(emptySlide);
    setEditing(-1);
  };

  // CREATE/UPDATE в БД
  const saveSlide = async (e) => {
    e.preventDefault();
    if (!isValid) { setMsg("Image URL is required."); return; }

    const payload = {
      image: draft.image.trim(),
      title: (draft.title || "").trim(),
      subtitle: (draft.subtitle || "").trim(),
      badge: (draft.badge || "").trim(),
      cta: Array.isArray(draft.cta) ? draft.cta.filter(Boolean) : [],
      order: Number(draft.order ?? 0),
      isActive: !!draft.isActive,
      startAt: draft.startAt ? fromLocalInput(draft.startAt) : null,
      endAt: draft.endAt ? fromLocalInput(draft.endAt) : null,
      tags: Array.isArray(draft.tags) ? draft.tags : [],
    };

    const id = slides[editing]?._id;
    const url = id ? `/api/slides/${id}` : `/api/slides`;
    const method = id ? "PUT" : "POST";

    try {
      setSubmitting(true);
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" /*, Authorization: `Bearer ${token}`*/ },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Request failed: ${res.status}`);
      }
      const saved = await res.json();

      if (id) {
        setSlides((prev) => prev.map((s, i) => (i === editing ? saved : s)));
      } else {
        setSlides((prev) => [...prev, saved]);
      }
      setMsg("");
      resetForm();
    } catch (e2) {
      setMsg(e2.message || "Failed to save slide");
    } finally {
      setSubmitting(false);
    }
  };

  // EDIT (подставляем значения, даты -> строка для input)
  const editSlide = (i) => {
    const s = slides[i];
    setDraft({
      image: s.image || "",
      title: s.title || "",
      subtitle: s.subtitle || "",
      badge: s.badge || "",
      cta: Array.isArray(s.cta) ? s.cta : [],
      order: s.order ?? 0,
      isActive: !!s.isActive,
      startAt: toLocalInput(s.startAt || ""),
      endAt: toLocalInput(s.endAt || ""),
      tags: Array.isArray(s.tags) ? s.tags : [],
    });
    setEditing(i);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // DELETE в БД
  const deleteSlide = async (i) => {
    const id = slides[i]?._id;
    if (!id) { setSlides((prev) => prev.filter((_, idx) => idx !== i)); return; }
    if (!confirm("Delete this slide?")) return;
    try {
      const res = await apiFetch(`/api/slides/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error(`Delete failed: ${res.status}`);
      setSlides((prev) => prev.filter((_, idx) => idx !== i));
      if (editing === i) resetForm();
    } catch (e) {
      setMsg(e.message || "Failed to delete");
    }
  };

  // изменение порядка (swap) + PATCH в БД
  const move = async (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= slides.length) return;

    const a = slides[i];
    const b = slides[j];
    const na = Number(b.order ?? j);
    const nb = Number(a.order ?? i);

    // локально
    setSlides((prev) => {
      const arr = [...prev];
      [arr[i], arr[j]] = [arr[j], arr[i]];
      arr[i].order = na;
      arr[j].order = nb;
      return arr;
    });

    // серверу: обновим order обоих
    try {
      await Promise.all([
        apiFetch(`/api/slides/${a._id}/order`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: na }),
        }),
        apiFetch(`/api/slides/${b._id}/order`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: nb }),
        }),
      ]);
    } catch {
      /* опционально показать сообщение/перезагрузить список */
    }
  };

  return (
    <Container className="my-4">
      <h3 className="mb-3">{editing >= 0 ? "Edit slide" : "Add slide"}</h3>
      {msg && <Alert variant="warning">{msg}</Alert>}

      <Card className="mb-4">
        <Card.Body as={Form} onSubmit={saveSlide}>
          <Row className="g-3">
            <Col md={8}>
              <Form.Group className="mb-2">
                <Form.Label>Image URL *</Form.Label>
                <Form.Control
                  value={draft.image}
                  onChange={(e) => setDraftField("image", e.target.value)}
                  placeholder="https://example.com/hero.jpg"
                  required
                />
                  <div className="mt-2 d-flex align-items-center gap-2">
    <Form.Control type="file" accept="image/*" onChange={handleSlideImageUpload} disabled={uploading} />
    {uploading && <span className="text-muted small">Uploading…</span>}
  </div>
  <Form.Text className="text-muted">Paste URL or upload a file — uploaded images auto-fill the URL.</Form.Text>
                <Form.Text className="text-muted">
                  Прямая ссылка (или после загрузки в CDN/Cloudinary).
                </Form.Text>
              </Form.Group>

              <Row className="g-2">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Title</Form.Label>
                    <Form.Control value={draft.title} onChange={(e) => setDraftField("title", e.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Badge</Form.Label>
                    <Form.Control value={draft.badge} onChange={(e) => setDraftField("badge", e.target.value)} placeholder="New / Sale / ..." />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mt-2">
                <Form.Label>Subtitle</Form.Label>
                <Form.Control as="textarea" rows={2} value={draft.subtitle} onChange={(e) => setDraftField("subtitle", e.target.value)} />
              </Form.Group>

              <div className="mt-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-2">CTA buttons</h6>
                  <Button variant="outline-secondary" size="sm" onClick={addCTA}>Add CTA</Button>
                </div>
                {(draft.cta || []).length === 0 && <div className="text-muted small">No CTAs yet.</div>}
                {(draft.cta || []).map((c, i) => (
                  <InputGroup className="mb-2" key={i}>
                    <Form.Control placeholder="Label" value={c.label} onChange={(e) => updateCTA(i, "label", e.target.value)} />
                    <Form.Control placeholder="Href (/membership)" value={c.href} onChange={(e) => updateCTA(i, "href", e.target.value)} />
                    <Form.Select value={c.variant || "light"} onChange={(e) => updateCTA(i, "variant", e.target.value)}>
                      <option value="light">Light</option>
                      <option value="outline">Outline</option>
                      <option value="dark">Dark</option>
                      <option value="primary">Primary</option>
                    </Form.Select>
                    <Button variant="outline-danger" onClick={() => removeCTA(i)}>Remove</Button>
                  </InputGroup>
                ))}
              </div>
            </Col>

            <Col md={4}>
              <Row className="g-2">
                <Col xs={6}>
                  <Form.Group>
                    <Form.Label>Order</Form.Label>
                    <Form.Control type="number" value={draft.order} onChange={(e) => setDraftField("order", e.target.value)} />
                  </Form.Group>
                </Col>
                <Col xs={6} className="d-flex align-items-end">
                  <Form.Check
                    type="switch" id="isActive" label="Active"
                    checked={!!draft.isActive}
                    onChange={(e) => setDraftField("isActive", e.target.checked)}
                  />
                </Col>
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label>Start at</Form.Label>
                    <Form.Control type="datetime-local" value={draft.startAt} onChange={(e) => setDraftField("startAt", e.target.value)} />
                  </Form.Group>
                </Col>
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label>End at</Form.Label>
                    <Form.Control type="datetime-local" value={draft.endAt} onChange={(e) => setDraftField("endAt", e.target.value)} />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Label className="mt-3">Preview</Form.Label>
              <div className="border rounded-3 p-2" style={{ background: "#f8f9fa" }}>
                <div className="ratio ratio-16x9 rounded overflow-hidden mb-2">
                  {draft.image ? (
                    <img src={draft.image} alt="preview" style={{ objectFit: "cover" }} />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center text-muted">No image</div>
                  )}
                </div>
                <div className="small">
                  {draft.badge && <span className="badge bg-warning text-dark me-2">{draft.badge}</span>}
                  <div className="fw-semibold">{draft.title || "Untitled"}</div>
                  <div className="text-muted">{draft.subtitle}</div>
                  {(draft.cta || []).length > 0 && (
                    <div className="mt-2 d-flex flex-wrap gap-2">
                      {draft.cta.map((c, i) => (
                        <span key={i} className={`btn btn-sm ${c.variant === "outline" ? "btn-outline-dark" : "btn-dark"}`}>{c.label || "Button"}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Col>
          </Row>

          <div className="mt-3 d-flex gap-2">
            <Button type="submit" variant="dark" disabled={submitting}>
              {submitting ? "Saving…" : editing >= 0 ? "Save changes" : "Add slide"}
            </Button>
            {editing >= 0 && <Button variant="outline-secondary" onClick={resetForm}>Cancel</Button>}
          </div>
        </Card.Body>
      </Card>

      <h4 className="mb-2">Slides</h4>
      {slides.length === 0 ? (
        <p className="text-muted">No slides yet.</p>
      ) : (
        <ListGroup>
          {slides.map((s, i) => (
            <ListGroup.Item key={s._id || i} className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <div className="me-3 rounded overflow-hidden" style={{ width: 72, height: 48, background: "#eee" }}>
                  {s.image && <img src={s.image} alt="" width={72} height={48} style={{ objectFit: "cover" }} />}
                </div>
                <div>
                  <div className="fw-semibold">{s.title || "(no title)"}</div>
                  <div className="small text-muted">{s.subtitle?.slice(0, 80)}</div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Button size="sm" variant="light" onClick={() => move(i, -1)} disabled={i === 0}>Up</Button>
                <Button size="sm" variant="light" onClick={() => move(i, +1)} disabled={i === slides.length - 1}>Down</Button>
                <Button size="sm" variant="outline-secondary" onClick={() => editSlide(i)}>Edit</Button>
                <Button size="sm" variant="outline-danger" onClick={() => deleteSlide(i)}>Delete</Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Container>
  );
}
