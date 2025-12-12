export async function uploadImage(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("http://localhost:5000/api/upload/image", {
    method: "POST",
    body: fd,
  });
  if (!res.ok) throw new Error("Upload failed");
  const { url } = await res.json();
  return url; // Cloudinary URL → сохраняешь в Mongo
}