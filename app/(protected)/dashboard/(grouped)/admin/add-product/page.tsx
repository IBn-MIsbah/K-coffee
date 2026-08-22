"use client";
import { useState } from "react";
import { uploadImage } from "@/lib/actions/upload";

export default function AddProductPage() {
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  async function handleAction(formData: FormData) {
    setError("");
    setIsUploading(true);
    try {
      const { url } = await uploadImage(formData);
      setImageUrl(url);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form action={handleAction} className="p-8">
      <label htmlFor="product-image" className="mb-2 block font-medium">
        Product image (JPEG, PNG, WebP, or AVIF; maximum 5 MB)
      </label>
      <input id="product-image" type="file" name="image" accept="image/jpeg,image/png,image/webp,image/avif" required />
      <button type="submit" disabled={isUploading} className="ml-3 rounded bg-amber-600 p-2 text-white disabled:cursor-not-allowed disabled:opacity-60">
        {isUploading ? "Uploading…" : "Upload Product Image"}
      </button>

      {error && <p className="mt-3 text-sm text-red-700" role="alert">{error}</p>}

      {imageUrl && (
        <div className="mt-4">
          <p>Image uploaded. Save the product form to attach it to a product.</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Preview"
            className="w-40 h-40 object-cover"
          />
        </div>
      )}
    </form>
  );
}
