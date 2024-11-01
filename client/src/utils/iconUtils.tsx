// src/utils/iconUtils.ts
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ArticleIcon from "@mui/icons-material/Article";
import SmartDisplayIcon from '@mui/icons-material/SmartDisplay';import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export const getIconForFileType = (
  fileName: string,
  fontSize: "small" | "large" = "large",
  iconSize: number = 60
) => {
  const fileExtension = fileName.split('.').pop()?.toLowerCase() || "";
  let IconComponent;

  // List of accepted video file extensions
  const videoExtensions = ["avi", "mov", "mp4", "m4v", "mpg", "mpeg", "webm", "wmv",];

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
      if (videoExtensions.includes(fileExtension)) {
        IconComponent = (
          <SmartDisplayIcon
            fontSize={fontSize}
            sx={{ fontSize: iconSize,  }} // Set icon color to white
          />
        );
      } else {
        IconComponent = <ArticleIcon fontSize={fontSize} sx={{ fontSize: iconSize }} />;
      }
      break;
  }

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        borderRadius: '8px',
        padding: '8px', 
      }}
    >
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
