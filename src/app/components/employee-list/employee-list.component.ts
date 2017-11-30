import {Component, OnInit} from '@angular/core';
import {EmployeeService} from "../../services/employee.service";
import { Router } from '@angular/router';
import { Employee } from '../../models/Employee';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit {

  employees : Employee[] = [];

  selected : Employee;

  constructor(public service: EmployeeService, private router: Router) { }

  ngOnInit() {
    this.service.getEmployees().subscribe( data => {
      this.employees = data['result'];
      console.log(this.employees)
  });
  }



}
