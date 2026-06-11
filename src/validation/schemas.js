import { z } from "zod";

const emailField = z
  .string()
  .trim()
  .min(1, "Email is required")
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address");

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required"),
});

export const employeeSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: emailField,
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z
    .string()
    .trim()
    .min(7, "Phone number must be at least 7 digits")
    .regex(/^[0-9+\-\s]+$/, "Phone number can only contain digits"),
  department: z.string().min(1, "Please select a department"),
  designation: z.string().trim().min(1, "Designation is required"),
  joiningDate: z.string().min(1, "Joining date is required"),
  status: z.enum(["active", "inactive"]),
});

export const departmentSchema = z.object({
  name: z.string().trim().min(2, "Department name must be at least 2 characters"),
  head: z.string().trim().min(1, "Department head is required"),
});

export const leaveSchema = z
  .object({
    type: z.enum(["sick", "casual", "paid", "unpaid"]),
    from: z.string().min(1, "Start date is required"),
    to: z.string().min(1, "End date is required"),
    reason: z.string().trim().min(3, "Please give a reason (at least 3 characters)"),
  })
  .refine((d) => !d.from || !d.to || new Date(d.to) >= new Date(d.from), {
    message: "End date must be on or after the start date",
    path: ["to"],
  });

export const changePasswordSchema = z.object({
  current: z.string().min(1, "Current password is required"),
  next: z.string().min(6, "New password must be at least 6 characters"),
});

export const taskReportSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  description: z.string().trim().min(5, "Please describe the task (at least 5 characters)"),
  date: z.string().min(1, "Date is required"),
  status: z.enum(["completed", "in-progress", "pending"]),
});

// Validate `data` against `schema`.
// Returns { valid, data, errors } where errors is { field: "message" }.
export function validate(schema, data) {
  const result = schema.safeParse(data);
  if (result.success) {
    return { valid: true, data: result.data, errors: {} };
  }
  const errors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return { valid: false, data: null, errors };
}
