/**
 * Automatically appends quality and format optimization parameters
 * to Cloudinary URLs (f_auto, q_auto) and optional width/height resizing.
 */
export const getOptimizedCloudinaryUrl = (
  url: string | null | undefined,
  width?: number,
  height?: number
): string => {
  if (!url || typeof url !== "string") {
    return "";
  }
  
  if (!url.includes("res.cloudinary.com")) {
    return url;
  }

  // Cloudinary URLs usually follow this structure: .../upload/v12345/folder/image.jpg
  // We want to insert optimization parameters right after the '/upload/' segment.
  const parts = url.split("/upload/");
  if (parts.length === 2) {
    let params = "f_auto,q_auto";
    if (width) params += `,w_${width}`;
    if (height) params += `,h_${height}`;
    return `${parts[0]}/upload/${params}/${parts[1]}`;
  }

  return url;
};
