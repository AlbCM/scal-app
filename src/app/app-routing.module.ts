import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {DashboardComponent} from './components/dashboard/dashboard.component';
import {LoginComponent} from './components/login/login.component';
import {EmployeesComponent} from './components/employees/employees.component';
import {EmployeeListComponent} from './components/employee-list/employee-list.component';
import {HomeComponent} from './components/home/home.component';
import {EmployeeCreateComponent} from "./components/employee-create/employee-create.component";
import { EmployeeComponent } from './components/employee/employee.component';
import { LogoutComponent } from './components/logout/logout.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent },
  { path: '', component: DashboardComponent, children: [
    { path: 'home', component: HomeComponent },
    { path: 'employee/:id', component: EmployeeComponent },
    { path: 'employees', component: EmployeesComponent , children: [
      { path: '', component: EmployeeListComponent },
      { path: 'new', component: EmployeeCreateComponent },
    ]}
  ] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
