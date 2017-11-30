import {Component, ElementRef, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {Wizard} from 'clarity-angular';
import {Employee} from '../../models/Employee';
import {EmployeeService} from '../../services/employee.service';
import * as moment from 'moment';
import {Router} from "@angular/router";
import { MqttService, MqttMessage } from 'ngx-mqtt';
declare var Timetable: any;

@Component({
  selector: 'app-employee-create',
  templateUrl: './employee-create.component.html',
  styleUrls: ['./employee-create.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class EmployeeCreateComponent implements OnInit {

  @ViewChild('wizard') wizard: Wizard;
  @ViewChild('timetable') table: ElementRef;
  lgOpen = true;

  employee: Employee;
  rules = [];
  status = "Presione empezar para continuar...";

  // Flags
  formValid = false;
  submitFlag = false;
  processingFlag = false;
  fingerprint = true;
  successful = false;
  error = false;
  enrollButton = true;

  hora_entrada: string;
  hora_salida: string;
  dia: string;

  timetable: any;

  constructor(private service: EmployeeService,
              private router: Router,
              private mqttService: MqttService) {
    this.employee = {
        name: '',
        lastName: '',
        identificacion: '',
        rol: '',
        asistencia: [],
        regla: [],
        id: 0
    };
    this.mqttService.connect();
  }

  startEnroll(){
    console.log('enroll...');
    const data = {
      nombre: `${this.employee.name} ${this.employee.lastName}`,
      identificacion: this.employee.identificacion 
    };
    this.enrollButton = false;
    this.mqttService.connect();
    this.mqttService.unsafePublish('enroll/begin', JSON.stringify(data));

  }

  ngOnInit() {
    // MQTT stuff
    this.mqttService.connect();
    this.mqttService.observe('enroll/processing').subscribe( (message: MqttMessage) => {
      this.error = false;
      this.successful = false;
      this.fingerprint = true;
      // colocar el dedo negro
      this.status = "Procesando...";
    });
    this.mqttService.observe('enroll/waiting').subscribe( (message: MqttMessage) => {
      this.status = message.payload.toString();
      this.error = false;
      this.successful = false;
      this.fingerprint = true;
      // volver a colocar el dedo normal
    });
    this.mqttService.observe('enroll/exist').subscribe( (message: MqttMessage) => {
      this.fingerprint = false;
      this.error = true;
      this.successful = false;
      this.status = message.payload.toString();
      this.enrollButton = true;
      // volver a colocar el dedo rojo
    });
    this.mqttService.observe('enroll/distint').subscribe( (message: MqttMessage) => {
      this.status = message.payload.toString();
      this.fingerprint = false;
      this.error = true;
      this.successful = false;
      this.enrollButton = true;
      // volver a colocar el dedo rojo
    });
    this.mqttService.observe('enroll/abort').subscribe( (message: MqttMessage) => {
      alert("ABORT!");
    });
    this.mqttService.observe('enroll/successful').subscribe( (message: MqttMessage) => {
      console.log('aborted...');
      this.fingerprint = false;
      this.successful = true;
      this.error = false;
      this.status = message.payload.toString();
      // volver a colocar el dedo rojo
    });
    //
    this.timetable = new Timetable();
    this.timetable.setScope(6, 18);
    this.timetable.addLocations(['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo']);
    const renderer = new Timetable.Renderer(this.timetable);
    renderer.draw(this.table.nativeElement);
  }

  validateForm(): boolean {
    return this.employee.name.length > 0 &&
           this.employee.lastName.length > 0 &&
           this.employee.identificacion.length > 0;
  }
  onCommit() {
    this.submitFlag = true;
    if (this.validateForm()) {
      this.processingFlag = true;
      this.service.createEmployee(this.employee).subscribe( data => {
        this.processingFlag = false;
        this.wizard.next();
        console.log(data);
      });
    }
    // this.wizard.next();
    // this.wizard.next();
  }
  doCancel() {
    this.wizard.close();
    this.router.navigate(['/employees']);
  }

  assignRule() {
    this.rules.push({
      dia: this.dia,
      hora_in: this.hora_entrada,
      hora_out: this.hora_salida
    });
    this.renderTimetable();
  }
  getDia(dia: String) {
    let day = '';
    switch (dia) {
      case '0': day = 'Lunes'; break;
      case '1': day = 'Martes'; break;
      case '2': day = 'Miercoles'; break;
      case '3': day = 'Jueves'; break;
      case '4': day = 'Viernes'; break;
      case '5': day = 'Sabado'; break;
      case '6': day = 'Domingo'; break;
    }
    return day;
  }
  renderTimetable() {
    this.timetable = new Timetable();
    this.timetable.setScope(6, 18);
    this.timetable.addLocations(['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo']);
    this.rules.forEach((item, index) => {
      this.timetable.addEvent('',
                              this.getDia(item.dia),
                              moment(item.hora_in, 'HH:mm').toDate(),
                              moment(item.hora_out, 'HH:mm').toDate());
    });
    const renderer = new Timetable.Renderer(this.timetable);
    renderer.draw(this.table.nativeElement);
  }
  cleanTimetable() {
    this.rules = [];
    this.renderTimetable();
  }

  submitRules() {
    this.processingFlag = true;
    this.service.createEmployeeRules(this.employee, this.rules).subscribe((response) => {
      console.log(response);
      this.processingFlag = false;
      this.wizard.next();
    });
  }

  finish() {
    this.wizard.close();
    this.router.navigate(['/employees']);
  }


}
