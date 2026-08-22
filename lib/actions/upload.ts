"use server";

import { requirePermission } from "@/lib/authz";
import { logAudit } from "@/lib/rbac";
import { put } from "@vercel/blob";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const imageTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
} as const;

type SupportedImageType = keyof typeof imageTypes;

function isSupportedImageType(value: string): value is SupportedImageType {
  return value in imageTypes;
}

function hasExpectedSignature(bytes: Uint8Array, type: SupportedImageType) {
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return [0x89, 0x50, 0x4e, 0x47].every((value, index) => bytes[index] === value);
  if (type === "image/webp") {
    return String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  }
  return String.fromCharCode(...bytes.slice(4, 8)) === "ftyp" && ["avif", "avis"].includes(String.fromCharCode(...bytes.slice(8, 12)));
}

export async function uploadImage(formData: FormData): Promise<{ url: string }> {
  const actor = await requirePermission({ action: "manage", resource: "products" });
  const value = formData.get("image");

  if (!(value instanceof File) || value.size === 0) {
    throw new Error("Choose an image to upload.");
  }
  if (!isSupportedImageType(value.type)) {
    throw new Error("Only JPEG, PNG, WebP, and AVIF images are accepted.");
  }
  if (value.size > MAX_IMAGE_BYTES) {
    throw new Error("Image files must be 5 MB or smaller.");
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Image storage is not configured.");
  }

  const bytes = new Uint8Array(await value.arrayBuffer());
  if (!hasExpectedSignature(bytes, value.type)) {
    throw new Error("The uploaded file does not match its declared image type.");
  }

  const pathname = `products/${crypto.randomUUID()}.${imageTypes[value.type]}`;
  const blob = await put(pathname, value, { access: "public", addRandomSuffix: false });

  await logAudit(actor.id, actor.role, "upload", "products", {
    objectKey: pathname,
    contentType: value.type,
    byteSize: value.size,
  });

  return { url: blob.url };
}
