"use client";
import { useState } from "react";
import { uploadImage } from "@/lib/actions/upload";

export default function AddProductPage() {
  const [imageUrl, setImageUrl] = useState("");

  async function handleAction(formData: FormData) {
    const url = await uploadImage(formData);
    setImageUrl(url);
    // Now you can call your Prisma save function with this URL!
  }

  return (
    <form action={handleAction} className="p-8">
      <input type="file" name="image" accept="image/*" required />
      <button type="submit" className="bg-amber-600 text-white p-2 rounded">
        Upload Product Image
      </button>

      {imageUrl && (
        <div className="mt-4">
          <p>Uploaded Successfully!</p>
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
