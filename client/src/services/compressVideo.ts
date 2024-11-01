/* import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

// Helper function to convert Blob to File
const blobToFile = (blob: Blob, fileName: string): File => {
  return new File([blob], fileName, {
    type: blob.type,
    lastModified: new Date().getTime(),
  });
};

// FFmpeg-based video compression utility function
export const compressVideo = async (
  videoFile: File,
  outputFileName: string
): Promise<File> => {


  const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";
  console.log("Loading FFmpeg...");

  // Create a new FFmpeg instance
  const ffmpeg = new FFmpeg();

  // Load FFmpeg with all required resources
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, "text/javascript")
  });

    // Verify loaded state
    if (!ffmpeg.loaded) {
        throw new Error("FFmpeg failed to load properly");
      }

  console.log("FFmpeg loaded successfully");

  // Write the input video file into FFmpeg's virtual filesystem
  await ffmpeg.writeFile(videoFile.name, await fetchFile(videoFile));
  console.log("Input video file written to virtual FS.");

  console.log("Starting compression...");

  // Run FFmpeg to compress the video
  await ffmpeg.exec([
    "-i",
    videoFile.name,
    "-vcodec",
    "libx264",
    "-crf",
    "28",
    "-preset",
    "medium",
    "-y",
    outputFileName,
  ]);

  console.log("Compression completed.");

  // Read the compressed video
  const compressedVideo = await ffmpeg.readFile(outputFileName);

  console.log("Compressed video read from virtual FS.");

  // Convert Blob to File
  return blobToFile(
    new Blob([compressedVideo], { type: "video/mp4" }),
    outputFileName
  );
};
 */
