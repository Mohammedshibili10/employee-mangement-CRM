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
  phone: z
    .string()
    .trim()
    .min(7, "Phone number must be at least 7 digits")
    .regex(/^[0-9+\-\s]+$/, "Phone number can only contain digits"),
  department: z.string().min(1, "Please select a department"),
  designation: z.string().trim().min(1, "Designation is required"),
  joiningDate: z.string().min(1, "Joining date is required"),
  workStartTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM (24-hour)"),
  workEndTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM (24-hour)"),
  status: z.enum(["active", "inactive"]),
});

export const departmentSchema = z.object({
  name: z.string().trim().min(2, "Department name must be at least 2 characters"),
  head: z.string().trim().min(1, "Department head is required"),
});

export const changePasswordSchema = z.object({
  current: z.string().min(1, "Current password is required"),
  next: z.string().min(6, "New password must be at least 6 characters"),
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
