import type { NextApiRequest, NextApiResponse } from "next";
import exifParser from 'exif-parser'
import fs from 'fs'
import { parseForm, FormidableError } from "../../lib/parse-form";
import formidable from "formidable";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<{
    data: {
      url?: string | string[];
      exifInfo: any;
    } | null;
    error: string | null;
  }>
) => {
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

    console.log(parsed)
    const file = files.file as formidable.File;
    let url = file.filepath;

    let exifInfo = null
    try {
      const stream = fs.readFileSync(url)
      const parser = exifParser.create(stream)
      exifInfo = parser.parse()
    } catch {
      exifInfo = {}
    } finally {
      fs.rmSync(url)
    }

    res.status(200).json({
      data: {
        exifInfo
      },
      error: null,
    });
  } catch (e) {
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
