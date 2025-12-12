// Minimal Cloudinary uploader (no folder/tags)
export async function uploadImages(files) {
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Missing Cloudinary env vars (VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET).");
  }

  const list = Array.from(files || []);
  if (!list.length) return [];

  const uploads = list.map(async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: data,
    });

    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.secure_url) {
      throw new Error(json?.error?.message || `Cloudinary upload failed (${res.status})`);
    }
    return json.secure_url;
  });

  return Promise.all(uploads);
}

export async function uploadImage(file) {
  const [url] = await uploadImages([file]);
  return url;
}
