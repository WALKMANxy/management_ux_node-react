// src/utils/iconUtils.ts

import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ArticleIcon from "@mui/icons-material/Article";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export const getIconForFileType = (
  fileName: string,
  fontSize: "small" | "large" = "large",
  iconSize: number = 60
) => {
  const fileExtension = fileName.split('.').pop()?.toLowerCase() || "";
  let IconComponent;

  switch (fileExtension) {
    case "pdf":
      IconComponent = <PictureAsPdfIcon fontSize={fontSize} sx={{ fontSize: iconSize }} />;
      break;
    case "doc":
    case "docx":
    case "xls":
    case "xlsx":
    case "csv":
      IconComponent = <ArticleIcon fontSize={fontSize} sx={{ fontSize: iconSize }} />;
      break;
    default:
      IconComponent = <ArticleIcon fontSize={fontSize} sx={{ fontSize: iconSize }} />;
      break;
  }

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      {IconComponent}
      <Typography
        variant="caption"
        sx={{
          position: 'absolute',
          bottom: 2,
          right: 2,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: '#fff',
          borderRadius: '3px',
          padding: '0 4px',
          fontSize: '0.75rem',
        }}
      >
        .{fileExtension}
      </Typography>
    </Box>
  );
};