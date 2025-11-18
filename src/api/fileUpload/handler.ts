
import { ResponseToolkit, Request } from "@hapi/hapi";
import { viewFileFromSharePoint } from "../../shared/sharepoint";



export default {

 async viewFileFromSharePoint(req: Request, h: ResponseToolkit) {
  const { fileId } = req.params as { fileId: string };

  const file = await viewFileFromSharePoint(fileId);

  return h.response(file.stream).type(file.contentType);
 }

}