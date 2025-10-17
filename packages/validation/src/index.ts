import z from "zod";

const ALLOWED_VIDEO_EXTENSIONS = ["mp4", "webm", "mov", "mkv"];

export const PreSignedUrlSchema = z.object({
  filename: z
    .string()
    .min(1)
    .refine((filename) => {
      const extension = filename.split(".").pop();
      return extension && ALLOWED_VIDEO_EXTENSIONS.includes(extension);
    }),
});

export type PreSignedURL = z.infer<typeof PreSignedUrlSchema>;
