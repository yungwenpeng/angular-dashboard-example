import { Component, OnInit, OnDestroy } from '@angular/core';

import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

let dataSetup = {
  labels: [],
  datasets: [
    {
      label: 'Plant Temperature',
      data: [],
      fill: false,
      borderColor: 'rgb(227, 230, 67)',
      tension: 0.1
    },
    {
      label: 'Plant Humidity',
      data: [],
      fill: false,
      borderColor: 'rgb(51, 104, 255)',
      tension: 0.1
    }
  ]
};

interface timeIntervalItem {
  value: number;
  viewValue: string;
}


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})


export class DashboardComponent implements OnInit {

  public canvasTimeseries: any;          // HTML canvas
  public chartTimeseries: any;             // chart object for Chart.js

  // form input of new sensor value
  public lastestHumidityReading: any;
  public lastestTemperatureReading: any;

  public intervalId : any;

  selectedValue: any;
  timeIntervals: timeIntervalItem[] = [
    {value: 5, viewValue: '5'},
    {value: 10, viewValue: '10'},
    {value: 20, viewValue: '20'},
    {value: 30, viewValue: '30'},
  ];

  constructor() { }

  ngOnInit(): void {
    //console.log('ngOnInit');
    this.initTimeseriesChart();

    this.start();
  }

  ngOnDestroy(): void {
    //console.log('ngOnDestroy');
    this.destroy();
  }

  start() {
    this.intervalId = setInterval(() => {
      let d = new Date();
      let timestamp = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
      //console.log("datatime: " + timestamp);
      this.randomizeSensorReadings();
      this.addDataToChart(this.chartTimeseries, timestamp,
            this.lastestTemperatureReading, this.lastestHumidityReading);
    }, 300);
  }

  randomizeSensorReadings() {
    this.lastestHumidityReading = this.generateRandomInt(40, 70);
    this.lastestTemperatureReading = this.generateRandomInt(10, 50);
  }

  generateRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  initTimeseriesChart() {
    this.canvasTimeseries = document.getElementById('chartTimeseries');

    this.chartTimeseries = new Chart(this.canvasTimeseries, {
      type: 'line',
      data: dataSetup,
      options: {
        scales: {
          y: { beginAtZero: true, display: true }
        }
      }
    });
  }

  addDataToChart(chart, label, temperature, humidity) {
    let limit = this.selectedValue;
    console.log('limit: ' + limit);
    //console.log('temperature - ' + temperature + ',humidity - ' + humidity);
    chart.data.labels.push(label);

    chart.data.datasets.forEach((dataset) => {
      if ((dataset.label).includes('Temperature')) {
        dataset.data.push(temperature);
      } else {
        dataset.data.push(humidity);
      }
    });
    chart.update();
    if (chart.data.labels.length > limit) {
      chart.data.labels.splice(0, chart.data.labels.length - limit);
    }
    chart.data.datasets.forEach((dataset) => {
      console.log('length: ' + dataset.data.length + ', ' + dataset.label + ':' + dataset.data);
      if (dataset.data.length > limit) {
        dataset.data.splice(0, dataset.data.length - limit);
        //dataset.data.shift();
        console.log('length: ' + dataset.data.length + ', ' + dataset.label + ':' + dataset.data);
      }
      //console.log('dataset: ' + JSON.stringify(dataset, null, 4) + ', ' + dataset.data);
    });
    //chart.update();
  }

  destroy(){
    this.chartTimeseries.destroy();
    clearInterval(this.intervalId);
  }

  render(){
    this.ngOnInit();
  }

}
