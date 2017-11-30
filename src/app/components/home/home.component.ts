import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../../services/employee.service';
import { Chart } from 'chart.js';
import * as moment from 'moment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  dailyReport: any[] = [];
  totalEmployees = 0;
  pendingEmployees = 0;
  weekAttendance = 0;
  monthAttendance = 0;
  yearAttendance = 0;

  constructor(private service: EmployeeService) { }

  ngOnInit() {

    // Initialize charts
    const ctx = document.getElementById('chart');
    const pie = document.getElementById('pie_chart');
    

    this.service.getAssistanceFromAllByDate(moment().format('YYYY-MM-DD')).subscribe(result => {
      this.dailyReport = result['result'];
    });

    this.service.getEmployeeStatistics().subscribe( result => {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ["Docente", "Administrativo", "Servicio general", "Vigilancia"],
          datasets: [
            {
              label: "Numero de empleados",
              backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9"],
              data: [result['Docentes'],result['Administrativos'],result['Servicio General'], result['Vigilancia']]
            }
          ]
        },
        options: {
          legend: { display: false },
          title: {
            display: false,
            text: 'Estadísticas',
            fontFamily: 'Metropolis',
            fontColor: '#000',
            fontStyle: '200',
            fontSize: 18,
            position: 'top',
            padding: 25
          },
          layout: {
            padding: {
              top: 20
            }
          },
          responsive: false
        }
      });
      new Chart(pie, {
        type: 'pie',
        data: {
          labels: ["A tiempo", "A destiempo"],
          datasets: [{
            label: "Population (millions)",
            backgroundColor: ["#AADB1E","#FAC400"],
            data: [result['Porcentaje Asistencias a tiempo'],result['Porcentaje Asistencias a destiempo']]
          }]
        },
        options: {
          layout: {
            padding: {
              top: 20,
              left: 200
            }
          },
          legend: { display: true, position: 'right'},
          title: {
            display: false,
            text: 'Estadística'
          },
          responsive: false,
        }
    });
      this.totalEmployees = result['Empleados'];
      this.pendingEmployees = result['Por Asociar'];
      this.weekAttendance = result['Porcentaje de puntualidad esta semana'];
      this.monthAttendance = result['Porcentjae de puntualidad este mes'];
      this.yearAttendance = result['Porcentaje de puntualidad este ano'];
    });


  }
}
