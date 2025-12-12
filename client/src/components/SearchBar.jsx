import { Form, InputGroup, Button, Spinner } from "react-bootstrap";
import { FiSearch, FiX } from "react-icons/fi";

export default function SearchBar({
  value,
  onChange,          // (nextValue: string) => void
  onSubmit,          // (e) => void
  placeholder = "Search…",
  loading = false,
  autoFocus = false,
  className = "",
}) {
  return (
    <Form role="search" onSubmit={onSubmit} className={className}>
      <InputGroup>
        <InputGroup.Text aria-hidden="true"><FiSearch /></InputGroup.Text>
        <Form.Control
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          aria-label="Search"
        />
        {value && (
          <Button
            variant="outline-secondary"
            onClick={() => onChange("")}
            aria-label="Clear search"
          >
            <FiX />
          </Button>
        )}
        <Button type="submit" variant="dark" disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : "Search"}
        </Button>
      </InputGroup>
    </Form>
  );
}
