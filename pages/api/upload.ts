import type { NextApiRequest, NextApiResponse } from "next";
import mime from "mime";
import { join } from "path";
import * as dateFn from "date-fns";
import { mkdir, stat } from "fs/promises";
import formidable from "formidable";

const FormidableError = formidable.errors.FormidableError;

const parseForm = async (
  req: NextApiRequest
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return await new Promise(async (resolve, reject) => {
    const uploadDir = join(
      process.env.ROOT_DIR || process.cwd(),
      `/uploads/${dateFn.format(Date.now(), "dd-MM-Y")}`
    );

    try {
      await stat(uploadDir);
    } catch (e: any) {
      if (e.code === "ENOENT") {
        await mkdir(uploadDir, { recursive: true });
      } else {
        console.error(e);
        reject(e);
        return;
      }
    }

    const form = formidable({
      maxFiles: 10,
      maxFileSize: 1024 * 1024 * 20, // 20mb
      uploadDir,
      filename: (_name, _ext, part) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const filename = `${part.name || "unknown"}-${uniqueSuffix}.${mime.getExtension(part.mimetype || "") || "unknown"
          }`;
        return filename;
      },
      filter: (part) => {
        return (
          part.name === "file" && (part.mimetype?.includes("image") || false)
        );
      },
    });

    form.parse(req, function (err, fields, files) {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};


const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<{
    data: {
      url?: string | string[];
    } | null;
    error: string | null;
  }>
) => {
  res.status(404)
  return
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({
      data: null,
      error: "Method Not Allowed",
    });
    return;
  }
  try {
    const parsed = await parseForm(req);
    const { files } = parsed
    const file = files.file as formidable.File;
    let url = file.filepath;

    res.status(200).json({
      data: {
        url
      },
      error: null,
    });
  } catch (e: any) {
    if (e instanceof FormidableError) {
      res.status(e.httpCode || 400).json({ data: null, error: e.message });
    } else {
      console.error(e);
      res.status(500).json({ data: null, error: "Internal Server Error" });
    }
  }
};


export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
