// src/utils/fileUtils.ts

export type AttachmentType = "image" | "pdf" | "word" | "excel" | "csv" | "other";

export const mapExtensionToAttachmentType = (extension: string): AttachmentType => {
  const ext = extension.toLowerCase();
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return "image";
  if (["pdf"].includes(ext)) return "pdf";
  if (["docx", "doc"].includes(ext)) return "word";
  if (["xlsx", "xls"].includes(ext)) return "excel";
  if (["csv"].includes(ext)) return "csv";
  return "other";
};
