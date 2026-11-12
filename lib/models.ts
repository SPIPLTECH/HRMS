import mongoose, { Schema, models, model } from "mongoose";

const EmployeeSchema = new Schema(
  {
    empId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    monthlySalary: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

const SalarySchema = new Schema(
  {
    employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    empId: String,
    name: String,
    month: { type: String, required: true }, // YYYY-MM
    monthlySalary: Number,
    workingDays: Number,
    holidays: Number,
    absentDays: Number,
    halfDays: Number,
    leaveDays: Number,     // absent + half*0.5
    leavesCovered: Number, // adjusted from the 8 yearly leaves
    unpaidDays: Number,    // loss of pay days
    perDay: Number,
    deduction: Number,
    netSalary: Number,
  },
  { timestamps: true }
);
SalarySchema.index({ employee: 1, month: 1 }, { unique: true });

export const Employee = models.Employee || model("Employee", EmployeeSchema);
export const Salary = models.Salary || model("Salary", SalarySchema);
export const YEARLY_LEAVES = 8;
