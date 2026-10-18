import { z } from "zod";
const clean = (s: string) =>
  s
    .replace(/[<>\u0000-\u001f\u007f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
export const receiptSchema = z
  .object({
    tenant: z.string().transform(clean).pipe(z.string().min(2).max(100)),
    landlord: z.string().transform(clean).pipe(z.string().min(2).max(100)),
    pan: z
      .string()
      .transform((v) => clean(v).toUpperCase())
      .pipe(
        z.union([z.literal(""), z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/)]),
      ),
    address: z.string().transform(clean).pipe(z.string().min(8).max(300)),
    rent: z.coerce.number().finite().positive().max(10000000),
    start: z.string().regex(/^\d{4}-\d{2}$/),
    end: z.string().regex(/^\d{4}-\d{2}$/),
    mode: z.enum(["Cash", "Bank transfer", "UPI", "Cheque", "Other"]),
    stamp: z.boolean(),
  })
  .superRefine((v, ctx) => {
    const [sy, sm] = v.start.split("-").map(Number),
      [ey, em] = v.end.split("-").map(Number),
      n = (ey - sy) * 12 + em - sm + 1;
    if (n < 1 || n > 12)
      ctx.addIssue({
        code: "custom",
        message: "Choose a valid range of up to 12 months",
        path: ["end"],
      });
  });
export type ReceiptInput = z.infer<typeof receiptSchema>;
export function receiptMonths(start: string, end: string) {
  const [sy, sm] = start.split("-").map(Number),
    [ey, em] = end.split("-").map(Number),
    out: string[] = [];
  let y = sy,
    m = sm;
  while (y < ey || (y === ey && m <= em)) {
    out.push(`${y}-${String(m).padStart(2, "0")}`);
    m++;
    if (m === 13) {
      m = 1;
      y++;
    }
  }
  return out;
}
