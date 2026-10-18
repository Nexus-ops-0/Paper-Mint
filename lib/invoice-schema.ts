import { z } from "zod";

const clean = (value: string) =>
  value.replace(/[<>\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim();

const safeText = (min: number, max: number) =>
  z.string().transform(clean).pipe(z.string().min(min).max(max));

export const invoiceSchema = z.object({
  business: safeText(2, 100),
  email: z.string().transform(clean).pipe(z.union([z.literal(""), z.email()])),
  address: safeText(5, 240),
  customer: safeText(2, 100),
  customerAddress: z.string().transform(clean).pipe(z.string().max(240)),
  invoiceNumber: z.string().transform(clean).pipe(z.string().min(1).max(32)),
  issueDate: z.iso.date(),
  dueDate: z.iso.date(),
  taxRate: z.coerce.number().finite().min(0).max(100),
  discount: z.coerce.number().finite().min(0).max(100000000),
  notes: z.string().transform(clean).pipe(z.string().max(300)),
  items: z.array(z.object({
    description: safeText(1, 120),
    quantity: z.coerce.number().finite().positive().max(100000),
    rate: z.coerce.number().finite().min(0).max(100000000),
  })).min(1).max(12),
}).superRefine((invoice, context) => {
  if (invoice.dueDate < invoice.issueDate) {
    context.addIssue({ code: "custom", message: "The due date must be on or after the issue date.", path: ["dueDate"] });
  }
  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  if (invoice.discount > subtotal) {
    context.addIssue({ code: "custom", message: "Discount cannot be greater than the subtotal.", path: ["discount"] });
  }
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;
