import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { EmployeeService } from '../../services/employee.service';
import { EmployeeResponse } from '../../models/Employee';
import { Employee } from '../../models/Employee';
import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import * as moment from 'moment';
import { MqttService, MqttMessage } from 'ngx-mqtt';
import {Paho} from '../../lib/ng2-mqtt';

declare var Timetable: any;

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class EmployeeComponent implements OnInit {

  @ViewChild('ttSetting') ttSetting: ElementRef;
  private timetable : any;
  private setting : any;

  @ViewChild('asistencia') tableAsist: ElementRef;
  private asistenciaTable: any;

  private routeSubscription: any;
  private id: String;
  employee: Employee;
  private rules: any[];
  

  // Flags
  enrollButton = true;
  error = false;
  successful = false;
  fingerprint = true;
  status = "Cuando esté listo presione empezar";
  openModal = false;
  processing = false;


  regla_nueva = {
    dia: '',
    hora_in: '',
    hora_out: ''
  }

  modal: any;
  client: any;
 
  constructor(private route: ActivatedRoute, private router: Router, private service: EmployeeService, private mqttService: MqttService)
  { 
    this.client = new Paho.MQTT.Client("192.168.1.50", 9001, "", "webapp");
    
    this.client.onConnectionLost = (responseObject: Object) => {
      console.log('Connection lost.');
    };
    
    this.client.onMessageArrived = (message: Paho.MQTT.Message) => {
      switch(message.destinationName)
      {
        case 'search/finished': 
        {
            this.processing = false;
            this.router.navigate(['/employees']);
            break;
        }
        case 'enroll/processing': 
        {
            this.error = false;
            this.successful = false;
            this.fingerprint = true;
            this.status = "Procesando...";
            break;
        }
        case 'enroll/waiting': 
        {
            this.status = message.payloadString;
            this.error = false;
            this.successful = false;
            this.fingerprint = true;
            break;
        }
        case 'enroll/exist': 
        {
            this.fingerprint = false;
            this.error = true;
            this.successful = false;
            this.status = message.payloadString;
            this.enrollButton = true;
            break;
        }
        case 'enroll/distint': 
        {
            this.status = message.payloadString;
            this.fingerprint = false;
            this.error = true;
            this.successful = false;
            this.enrollButton = true;
            // volver a colocar el dedo rojo
            break;
        }
        case 'enroll/successful': 
        {
            this.fingerprint = false;
            this.successful = true;
            this.error = false;
            this.status = message.payloadString;
            break;
        }
        
      }
    };
  
    this.client.connect({ onSuccess: this.onConnected.bind(this) });
  }

  ngOnInit() {
    this.mqttService.connect();
    this.mqttService.observe('search/finished');
    this.routeSubscription = this.route.params.subscribe( params => {
        this.id = params['id'];
        this.service.getEmployeeById(this.id).subscribe( data => {
          const response = data;
          this.employee = data.result;
          this.loadSchedule();
        })
        this.service.getCurrentWeekAttendance(this.id).subscribe( data => {
          this.loadWeekSchedule(data['result']);
        });
    });
  }

  loadWeekSchedule(datos){
    let out = [];
    datos.forEach((item, index) => {
        let dia = moment(item.asistencia.fecha,'YYYY-MM-DD HH:mm').toDate().getDay();
        if(!this.existsDayData(out,dia)){
          let data = {
            dia: dia,
            regla: [
            ]
          };
          datos.forEach(element => {
            let aux_dia = moment(element.asistencia.fecha,'YYYY-MM-DD HH:mm').toDate().getDay();
              if(aux_dia == dia){
                // if regla is empty need to add new rule
                if(data.regla.length == 0){
                  data.regla.push({
                    in: element.asistencia.tipo == 'in' ? element.asistencia.hora : null,
                    out: element.asistencia.tipo == 'out' ? element.asistencia.hora : null,
                  });
                }
                else {
                    // fill last in 
                    let last = data.regla[data.regla.length - 1]
                    if( last.in == null){
                        last.in = element.asistencia.hora;
                    }
                    // fill last out
                    else if (last.out == null){
                        last.out = element.asistencia.hora;
                    }
                    // add new regla
                    else {
                      data.regla.push({
                        in: element.asistencia.tipo == 'in' ? element.asistencia.hora : null,
                        out: element.asistencia.tipo == 'out' ? element.asistencia.hora : null,
                      });
                    }
                  }
                }
          });

          out.push(data);
        }
       
    });
    console.log('weekly');
    console.log(out)
    this.renderTimetableWeekly(out);
  }

  renderTimetableWeekly(data) {
    this.asistenciaTable = new Timetable();
    this.asistenciaTable.setScope(0, 23);
    this.asistenciaTable.addLocations(['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo']);
    data.forEach((item) => 
    {
      item.regla.forEach( 
        (element) => {
              if(element.in != null && element.out != null){
                this.asistenciaTable.addEvent( '',
                (this.getDia(item.dia)),
                moment(element.in, 'HH:mm').toDate(),
                moment(element.out, 'HH:mm').toDate());
              }
          });
    });
    const renderer = new Timetable.Renderer(this.asistenciaTable);
    renderer.draw(this.tableAsist.nativeElement);
  }

  renderTimetable(data) {
    this.timetable = new Timetable();
    this.timetable.setScope(0, 23);
    this.timetable.addLocations(['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo']);
    data.forEach((item) => 
    {
      item.regla.forEach( 
        (element) => {
              this.timetable.addEvent( '',
                  (this.getDia(item.dia)),
                  moment(element.in, 'HH:mm').toDate(),
                  moment(element.out, 'HH:mm').toDate());
          });
    });
    const renderer = new Timetable.Renderer(this.timetable);
    renderer.draw(this.ttSetting.nativeElement);
  }

  renderSettingTimetable(data) {
    this.setting = new Timetable();
    this.setting.setScope(0, 23);
    this.setting.addLocations(['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo']);
    data.forEach((item) => 
    {
      item.regla.forEach( 
        (element) => {
              this.setting.addEvent( '',
                  (this.getDia(item.dia)),
                  moment(element.in, 'HH:mm').toDate(),
                  moment(element.out, 'HH:mm').toDate());
          });
    });
    const renderer = new Timetable.Renderer(this.setting);
    renderer.draw(this.ttSetting.nativeElement);
  }

  cleanTimetable() {
    this.rules = [];
    this.loadSchedule();
  }

  assignRule() {
    //this.renderTimetable();
  }

  getDia(dia: number) {
    let day = '';
    switch (dia) {
      case 0 : day = 'Lunes'; break;
      case 1 : day = 'Martes'; break;
      case 2 : day = 'Miercoles'; break;
      case 3 : day = 'Jueves'; break;
      case 4 : day = 'Viernes'; break;
      case 5 : day = 'Sabado'; break;
      case 6 : day = 'Domingo'; break;
    }
    return day;
  }

  existsDayData(data: any[], day: number){
      let exists = false;
      data.forEach(item => {
          if(item.dia === day){
            exists = true;
          }
      });
      return exists;
  }

  getHour(regla: any[], tipo: string){
      for(let i=0; i<regla.length; i++){
        if(regla[i].tipo === tipo){
          return regla[i].hora;
        }
      }
  }

  loadSchedule(){
    let out = [];
    this.employee.regla.forEach((item, index) => {
        if(!this.existsDayData(out,item.dia)){
          let data = {
            dia: item.dia,
            regla: [
            ]
          };
          this.employee.regla.forEach(element => {
              if(element.dia == item.dia){
                // if regla is empty need to add new rule
                if(data.regla.length == 0){
                  data.regla.push({
                    in: element.tipo == 'in' ? element.hora : null,
                    out: element.tipo == 'out' ? element.hora : null,
                  });
                }
                else {
                    // fill last in 
                    let last = data.regla[data.regla.length - 1]
                    if( last.in == null){
                        last.in = element.hora;
                    }
                    // fill last out
                    else if (last.out == null){
                        last.out = element.hora;
                    }
                    // add new regla
                    else {
                      data.regla.push({
                        in: element.tipo == 'in' ? element.hora : null,
                        out: element.tipo == 'out' ? element.hora : null,
                      });
                    }
                  }
                }
          });

          out.push(data);
        }
       
    });
    this.renderTimetable(out);
  }


  loadSettingSchedule(){
    let out = [];
    this.employee.regla.forEach((item, index) => {
        if(!this.existsDayData(out,item.dia)){
          let data = {
            dia: item.dia,
            regla: [
            ]
          };
          this.employee.regla.forEach(element => {
              if(element.dia == item.dia){
                // if regla is empty need to add new rule
                if(data.regla.length == 0){
                  data.regla.push({
                    in: element.tipo == 'in' ? element.hora : null,
                    out: element.tipo == 'out' ? element.hora : null,
                  });
                }
                else {
                    // fill last in 
                    let last = data.regla[data.regla.length - 1]
                    if( last.in == null){
                        last.in = element.hora;
                    }
                    // fill last out
                    else if (last.out == null){
                        last.out = element.hora;
                    }
                    // add new regla
                    else {
                      data.regla.push({
                        in: element.tipo == 'in' ? element.hora : null,
                        out: element.tipo == 'out' ? element.hora : null,
                      });
                    }
                  }
                }
          });

          out.push(data);
        }
       
    });
    this.renderSettingTimetable(out);
  }
  
  beginEnroll(){ 
    console.log('enroll...');
    const data = {
      nombre: `${this.employee.name}`,
      identificacion: this.employee.identificacion 
    }
    // Block enroll button
    this.enrollButton = false;
    // Prepare Mqtt message 
    const message = new Paho.MQTT.Message(JSON.stringify(data));
    message.destinationName = 'enroll/begin';
    // Send message
    this.client.send(message);
  }

  hasFingerEnrolled(){
    return ! (this.employee.id < 0);
  }

  updateEmployee(modal){
    this.processing = true;
    this.service.updateEmployee(this.employee).subscribe(response => {
      this.processing = false;
      modal.close();
    })
  }

  deleteEmployee(modal){
    this.processing = true;
    const message = new Paho.MQTT.Message(this.employee.identificacion);
    message.destinationName = 'delete';
    this.client.send(message);
  }

  addRule(modal){
    this.processing = true;
    this.service.addRule(this.employee, this.regla_nueva).subscribe((response) => {
      this.service.getEmployeeById(this.id).subscribe( data => {
        const response = data;
        this.employee = data.result;
        this.loadSchedule();
        this.processing = false;
        this.regla_nueva = {
          dia: '',
          hora_in: '',
          hora_out: ''
        }
        modal.close();
      })
    })

  }

  deleteRules(modal){
    this.processing = true;
    const last  = this.employee.regla[this.employee.regla.length - 1 ];
    this.employee.regla.forEach((item) => {
      if(item.idRegla === last.idRegla){
        this.service.deleteRule(this.employee.identificacion, item.idRegla).subscribe(response => {
        });
      }
      else {
        this.service.deleteRule(this.employee.identificacion, item.idRegla).subscribe(response => {
          this.service.getEmployeeById(this.id).subscribe( data => {
            const response = data;
            this.employee = data.result;
            this.loadSchedule();
            this.processing = false;
            modal.close();
          })
        });
      }
      
    });

    

  }

  private onConnected():void {
    console.log('Connected to broker.');
    this.client.subscribe('search/finished');
    this.client.subscribe('enroll/processing');
    this.client.subscribe('enroll/waiting');
    this.client.subscribe('enroll/exist');
    this.client.subscribe('enroll/distint');
    this.client.subscribe('enroll/successful');
  }

   // called when a message arrives
  
}
