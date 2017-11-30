export interface Employee {
  asistencia: any[];
  id: number;
  identificacion: string;
  name: string;
  lastName: string;
  regla: any[];
  rol: string;
}

export interface EmployeeResponse {
  result: Employee;
}