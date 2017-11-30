/**
 * Created by seardy on 11/16/17.
 */

import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Employee} from "../models/Employee";
import { EmployeeResponse } from '../models/Employee';
import { HttpParams } from '@angular/common/http';

@Injectable()
export class EmployeeService {

  filter = {
    name: ""
  };

  endpoint = 'http://localhost:5000/';


  constructor(private http: HttpClient) {}

  getEmployees() {
    return this.http.get(this.endpoint + 'empleados');
  }

  getEmployeeById(id){
    return this.http.get<EmployeeResponse>(this.endpoint + 'empleados/' + id);
  }

  createEmployee(employee: Employee) {
      const data = {
        name: `${employee.name} ${employee.lastName}`,
        identificacion: employee.identificacion,
        rol: employee.rol,
        photoUrl: '/assets/teacher.jpg'
      };
      return this.http.post(this.endpoint + 'empleados', data);
  }

  createEmployeeRules(employee: Employee, rules: any[]) {
    const datos = [];
    rules.forEach((item, index) => {
      datos.push({
        dia: parseInt(item.dia),
        tipo: 'in',
        hora: item.hora_in
      });
      datos.push({
        dia: parseInt(item.dia),
        tipo: 'out',
        hora: item.hora_out
      });
    })
    const data = {
      datos: datos
    };
    console.log(data);
    return this.http.post(this.endpoint + 'empleados/' + employee.identificacion + '/reglas', data);
  }

  getAssistanceFromAllByDate(date: string){
      let params = new HttpParams().set('date', date);
      return this.http.get(`${this.endpoint}empleados/asistencias`, {params: params});
  }

  getEmployeeStatistics(){
    return this.http.get(this.endpoint + 'estadisticas');
  }

  getCurrentWeekAttendance(id){
    let params = new HttpParams().set('weekly', 'now');
    return this.http.get(`${this.endpoint}empleados/${id}/asistencias`, {params: params});
  }

  updateEmployee(employee: Employee){
      return this.http.put(`${this.endpoint}empleados/${employee.identificacion}`, employee );
  }

  deleteEmployee(employee: Employee){
      return this.http.delete(`${this.endpoint}empleados/${employee.identificacion}`);
  }

  addRule(employee: Employee, rule){
    let data = [];
    data.push({
      dia: parseInt(rule.dia),
      tipo: 'in',
      hora: rule.hora_in
    });
    data.push({
      dia: parseInt(rule.dia),
      tipo: 'out',
      hora: rule.hora_out
    });
    return this.http.post(`${this.endpoint}empleados/${employee.identificacion}/reglas`, { datos: data});
  }


  deleteRule(employeeId, ruleId){
    return this.http.delete(`${this.endpoint}empleados/${employeeId}/reglas/${ruleId}`);
  }

}
