// src/utils/fileUtils.ts

export type AttachmentType = "image" | "pdf" | "word" | "excel" | "csv" | "other";

/**
 * Maps a file extension to the corresponding AttachmentType.
 *
 * @param {string} extension - The file extension (e.g., "jpg", "pdf").
 * @returns {AttachmentType} The corresponding AttachmentType.
 */
export const mapExtensionToAttachmentType = (extension: string): AttachmentType => {
  const ext = extension.toLowerCase();
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return "image";
  if (["pdf"].includes(ext)) return "pdf";
  if (["docx", "doc"].includes(ext)) return "word";
  if (["xlsx", "xls"].includes(ext)) return "excel";
  if (["csv"].includes(ext)) return "csv";
  return "other";
};
