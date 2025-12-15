export async function uploadImage(file) {
const API = import.meta.env.VITE_API_URL;

  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API}/api/upload/image`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) throw new Error("Upload failed");
  const { url } = await res.json();
  return url; // Cloudinary URL → сохраняешь в Mongo
}