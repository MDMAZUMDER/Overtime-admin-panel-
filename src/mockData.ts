import { Employee, OvertimeRequest } from './types';

export const mockEmployees: Employee[] = [
  { id: 1, name: "Alex Chen", department: "Engineering", status: 'ACTIVE', weeklyOvertime: 6.5, initial: "AC" },
  { id: 2, name: "Jamie Rivera", department: "Product", status: 'ACTIVE', weeklyOvertime: 3.2, initial: "JR" },
  { id: 3, name: "Taylor Smith", department: "Sales", status: 'ON_BREAK', weeklyOvertime: 0.0, initial: "TS" },
  { id: 4, name: "Morgan Lee", department: "Engineering", status: 'ACTIVE', weeklyOvertime: 8.0, initial: "ML" }
];

export const initialPendingRequests: OvertimeRequest[] = [
  { id: 1, employeeId: 1, employeeName: "Alex Chen", employeeInitial: "AC", hours: 2.5, date: "Oct 12, 2023", reason: "Urgent bug fix for production deployment." },
  { id: 2, employeeId: 2, employeeName: "Jamie Rivera", employeeInitial: "JR", hours: 1.5, date: "Oct 13, 2023", reason: "Finalizing product roadmap for Q4." },
  { id: 3, employeeId: 4, employeeName: "Morgan Lee", employeeInitial: "ML", hours: 4.0, date: "Oct 14, 2023", reason: "Server migration and infrastructure scaling." }
];

export const weeklyTrendData = [4.5, 6.0, 5.2, 7.8, 9.0, 8.5, 6.2];
