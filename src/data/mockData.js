// Simple fake data used across the app (no backend needed)

// A finished onboarding (used for the seed employees)
const fullOnboarding = {
  created: true,
  idGenerated: true,
  whatsappSent: true,
  firstLogin: true,
  profileCompleted: true,
};

export const employees = [
  {
    id: 1,
    empId: "EMP001",
    name: "Aarav Sharma",
    email: "aarav@company.com",
    phone: "9876543210",
    department: "Engineering",
    designation: "Frontend Developer",
    joiningDate: "2023-01-15",
    status: "Active",
    whatsappSent: true,
    onboarding: { ...fullOnboarding },
  },
  {
    id: 2,
    empId: "EMP002",
    name: "Priya Patel",
    email: "priya@company.com",
    phone: "9876543211",
    department: "Human Resources",
    designation: "HR Manager",
    joiningDate: "2022-06-10",
    status: "Active",
    whatsappSent: true,
    onboarding: { ...fullOnboarding },
  },
  {
    id: 3,
    empId: "EMP003",
    name: "Rohan Verma",
    email: "rohan@company.com",
    phone: "9876543212",
    department: "Sales",
    designation: "Sales Executive",
    joiningDate: "2023-09-01",
    status: "Inactive",
    whatsappSent: false,
    onboarding: {
      created: true,
      idGenerated: true,
      whatsappSent: false,
      firstLogin: false,
      profileCompleted: false,
    },
  },
  {
    id: 4,
    empId: "EMP004",
    name: "Sneha Iyer",
    email: "sneha@company.com",
    phone: "9876543213",
    department: "Marketing",
    designation: "Marketing Lead",
    joiningDate: "2021-11-20",
    status: "Active",
    whatsappSent: true,
    onboarding: { ...fullOnboarding },
  },
  {
    id: 5,
    empId: "EMP005",
    name: "Karan Mehta",
    email: "karan@company.com",
    phone: "9876543214",
    department: "Engineering",
    designation: "Backend Developer",
    joiningDate: "2024-02-05",
    status: "Active",
    whatsappSent: true,
    onboarding: {
      created: true,
      idGenerated: true,
      whatsappSent: true,
      firstLogin: true,
      profileCompleted: false,
    },
  },
];

export const departments = [
  { id: 1, name: "Engineering", head: "Karan Mehta", employees: 12 },
  { id: 2, name: "Human Resources", head: "Priya Patel", employees: 4 },
  { id: 3, name: "Sales", head: "Rohan Verma", employees: 8 },
  { id: 4, name: "Marketing", head: "Sneha Iyer", employees: 6 },
];

export const attendance = [
  { id: 1, name: "Aarav Sharma", date: "2026-06-09", checkIn: "09:05", checkOut: "18:10", status: "Present" },
  { id: 2, name: "Priya Patel", date: "2026-06-09", checkIn: "09:30", checkOut: "18:00", status: "Present" },
  { id: 3, name: "Rohan Verma", date: "2026-06-09", checkIn: "-", checkOut: "-", status: "Absent" },
  { id: 4, name: "Sneha Iyer", date: "2026-06-09", checkIn: "10:15", checkOut: "18:20", status: "Late" },
  { id: 5, name: "Karan Mehta", date: "2026-06-09", checkIn: "09:00", checkOut: "18:05", status: "Present" },
];

export const leaveRequests = [
  { id: 1, name: "Aarav Sharma", type: "Sick Leave", from: "2026-06-12", to: "2026-06-13", reason: "Fever", status: "Pending" },
  { id: 2, name: "Sneha Iyer", type: "Casual Leave", from: "2026-06-15", to: "2026-06-16", reason: "Personal work", status: "Approved" },
  { id: 3, name: "Rohan Verma", type: "Earned Leave", from: "2026-06-20", to: "2026-06-25", reason: "Family trip", status: "Rejected" },
  { id: 4, name: "Karan Mehta", type: "Sick Leave", from: "2026-06-11", to: "2026-06-11", reason: "Headache", status: "Pending" },
];

// Data for the logged-in employee view
export const myLeaveHistory = [
  { id: 1, type: "Sick Leave", from: "2026-05-02", to: "2026-05-03", reason: "Fever", status: "Approved" },
  { id: 2, type: "Casual Leave", from: "2026-04-18", to: "2026-04-18", reason: "Personal work", status: "Approved" },
  { id: 3, type: "Earned Leave", from: "2026-06-20", to: "2026-06-25", reason: "Vacation", status: "Pending" },
];

export const myAttendance = [
  { id: 1, date: "2026-06-09", checkIn: "09:05", checkOut: "18:10", status: "Present" },
  { id: 2, date: "2026-06-08", checkIn: "09:10", checkOut: "18:00", status: "Present" },
  { id: 3, date: "2026-06-07", checkIn: "-", checkOut: "-", status: "Weekend" },
  { id: 4, date: "2026-06-06", checkIn: "10:20", checkOut: "18:15", status: "Late" },
  { id: 5, date: "2026-06-05", checkIn: "09:00", checkOut: "18:05", status: "Present" },
];

// The currently "logged in" employee
export const currentEmployee = {
  name: "Aarav Sharma",
  email: "aarav@company.com",
  phone: "9876543210",
  department: "Engineering",
  designation: "Frontend Developer",
  joiningDate: "2023-01-15",
};

// Recent activities shown on the admin dashboard (newest first)
export const activities = [
  { id: 1, text: "Sneha Iyer's profile was updated", time: "2 hours ago" },
  { id: 2, text: "Leave request approved for Aarav Sharma", time: "5 hours ago" },
  { id: 3, text: "New department 'Marketing' added", time: "1 day ago" },
];

// Add a new activity to the top of the list
export function addActivity(text) {
  activities.unshift({ id: Date.now() + activities.length, text, time: "Just now" });
}

// Make the next unique employee id like EMP001, EMP002 ...
export function generateEmployeeId() {
  let max = 0;
  employees.forEach((e) => {
    if (e.empId && e.empId.indexOf("EMP") === 0) {
      const num = parseInt(e.empId.replace("EMP", ""), 10);
      if (num > max) max = num;
    }
  });
  const next = max + 1;
  return "EMP" + String(next).padStart(3, "0");
}

// Create a new employee record from the form data.
// Generates the id + onboarding info and logs the activities.
export function addEmployee(form) {
  const empId = generateEmployeeId();

  const newEmployee = {
    id: Date.now(), // simple unique number
    empId,
    name: form.name,
    email: form.email,
    phone: form.phone,
    department: form.department,
    designation: form.designation,
    joiningDate: form.joiningDate,
    status: form.status,
    whatsappSent: form.sendWhatsApp,
    onboarding: {
      created: true,
      idGenerated: true,
      whatsappSent: form.sendWhatsApp,
      firstLogin: false,
      profileCompleted: false,
    },
  };

  employees.push(newEmployee);

  // Log what just happened (newest added first, so add in reverse order)
  addActivity("Employee onboarding started");
  if (form.sendWhatsApp) addActivity("WhatsApp invitation sent");
  addActivity("Employee ID " + empId + " generated");
  addActivity("Employee " + form.name + " created");

  return newEmployee;
}
