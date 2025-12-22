
import { ResponseToolkit, Request } from "@hapi/hapi";
import { viewFileFromSharePoint } from "../../shared/sharepoint";


function getExt(mime: string) {
  if (mime.includes("pdf")) return "pdf";
  if (mime.includes("mp4")) return "mp4";
  if (mime.includes("image")) return "jpg";
  return "file";
}
const isVideo = (contentType: string) => {
  return contentType.startsWith("video/");
};

export default {

 async viewFileFromSharePoint(req: Request, h: ResponseToolkit) {
  const { fileId } = req.params;
  const file = await viewFileFromSharePoint(fileId);

  return h
    .response(file.buffer)
    .header("Content-Type", "application/pdf")
    .header("Content-Length", file.contentLength || file.buffer.length)
    .header("Content-Disposition", `inline; filename="preview.${getExt(file.contentType)}"`)
    .header("Access-Control-Allow-Origin", "*")
    .header("Cross-Origin-Resource-Policy", "cross-origin");
},

async streamVideoFromSharePoint(req: Request, h: ResponseToolkit) {
  const { fileId } = req.params;
  const range = req.headers.range;

  console.log("Requested fileId:", fileId);
  console.log("Range header:", range);

  if (!range) {
    console.log("No range header provided, returning 416");
    return h
      .response({ message: "Range header required" })
      .code(416)
      .header("Content-Range", "bytes */0");
  }

  const file = await viewFileFromSharePoint(fileId);
  const buffer = file.buffer;
  const videoSize = Number(file.contentLength || buffer.length);
  const contentType = "video/mp4";

  console.log("Video size:", videoSize);
  console.log("Content-Type:", contentType);

  if (!contentType.startsWith("video/")) {
    console.log("File is not a video");
    return h.response({ error: "File is not a video" }).code(400);
  }

  // Parse the range header: "bytes=start-end"
  const parts = range.replace(/bytes=/, "").split("-");
  let start = parseInt(parts[0], 10);
  let end = parts[1] ? parseInt(parts[1], 10) : start + 1_000_000;

  console.log("Parsed range:", { start, end });

  if (isNaN(start) || start < 0) start = 0;
  if (isNaN(end) || end >= videoSize) end = videoSize - 1;

  if (start >= videoSize) {
    console.log("Requested start is beyond video size, returning 416");
    return h
      .response()
      .code(416)
      .header("Content-Range", `bytes */${videoSize}`);
  }

  const chunk = buffer.slice(start, end + 1);
  const contentLength = end - start + 1;

  console.log("Sending chunk:", { start, end, contentLength });

  return h
    .response(chunk)
    .code(206)
    .header("Content-Range", `bytes ${start}-${end}/${videoSize}`)
    .header("Accept-Ranges", "bytes")
    .header("Content-Length", String(contentLength))
    .header("Content-Type", contentType)
    .header("Content-Disposition", "inline")
    .header("Access-Control-Allow-Origin", "*")
    .header("Cross-Origin-Resource-Policy", "cross-origin");
}




}