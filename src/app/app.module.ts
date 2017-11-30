import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { EmployeesComponent } from './components/employees/employees.component';
import { EmployeeListComponent } from './components/employee-list/employee-list.component';
import {ClarityModule} from "clarity-angular";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import { HomeComponent } from './components/home/home.component';
import { EmployeeCreateComponent } from './components/employee-create/employee-create.component';
import {FormsModule} from "@angular/forms";
import {EmployeeService} from "./services/employee.service";
import {HttpClientModule} from "@angular/common/http";
import { EmployeeComponent } from './components/employee/employee.component';

import {
  MqttMessage,
  MqttModule,
  MqttService
} from 'ngx-mqtt';
import { MyFilterPipe } from './pipes/MyFilterPipe';
import { LogoutComponent } from './components/logout/logout.component';

 
export const MQTT_SERVICE_OPTIONS = {
  hostname: 'localhost',
  port: 9001
};
 
export function mqttServiceFactory() {
  return new MqttService(MQTT_SERVICE_OPTIONS);
}
 


@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    LoginComponent,
    EmployeesComponent,
    EmployeeListComponent,
    HomeComponent,
    EmployeeCreateComponent,
    EmployeeComponent,
    MyFilterPipe,
    LogoutComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ClarityModule,
    FormsModule,
    HttpClientModule,
    MqttModule.forRoot({
      provide: MqttService,
      useFactory: mqttServiceFactory
    })
  ],
  providers: [EmployeeService],
  bootstrap: [AppComponent]
})
export class AppModule { }
