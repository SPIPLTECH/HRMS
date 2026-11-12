import { Schema, models, model } from "mongoose";

const EmployeeSchema = new Schema(
  {
    empId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    bankAccount: { type: String, required: true, trim: true },
    ifsc: { type: String, required: true, trim: true, uppercase: true },
    monthlySalary: { type: Number, required: true, min: 0 },
    tdsPercent: { type: Number, default: 0, min: 0, max: 100 },
    casualAllotted: { type: Number, default: 8, min: 0 },
    sickAllotted: { type: Number, default: 8, min: 0 },
    casualUsed: { type: Number, default: 0 }, // stored, updated on every salary calculation
    sickUsed: { type: Number, default: 0 },
    leaveYear: { type: Number, default: () => new Date().getFullYear() }, // year the used counters belong to
  },
  { timestamps: true }
);

const SalarySchema = new Schema(
  {
    employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    empId: String, name: String, bankAccount: String, ifsc: String,
    month: { type: String, required: true }, // YYYY-MM
    monthlySalary: Number, workingDays: Number, holidays: Number,
    absentDays: Number, halfDays: Number,
    leaveDays: Number,
    casualDays: Number, sickDays: Number,           // leave requested by type
    casualCovered: Number, sickCovered: Number,     // adjusted from allotted balance
    unpaidDays: Number, perDay: Number, deduction: Number,
    grossAfterLeave: Number, tdsPercent: Number, tds: Number, netSalary: Number,
  },
  { timestamps: true }
);
SalarySchema.index({ employee: 1, month: 1 }, { unique: true });

export const Employee = models.Employee || model("Employee", EmployeeSchema);
export const Salary = models.Salary || model("Salary", SalarySchema);
