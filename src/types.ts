export interface Employee {
  id: number;
  name: string;
  department: string;
  status: 'ACTIVE' | 'ON_BREAK';
  weeklyOvertime: number;
  initial: string;
}

export interface OvertimeRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeInitial: string;
  hours: number;
  date: string;
  reason: string;
}
