import { Component, OnInit, OnDestroy } from '@angular/core';

import { Chart, registerables } from 'chart.js';

import { environment } from '../../environments/environment';

// for @angular/fire : start
// AngularFire v7.0 has a compatibility layer that supports the AngularFire v6.0 API
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { debounceTime } from 'rxjs/operators';
// for @angular/fire : end

// for firebase/firestore : start
// Initialize Cloud Firestore through Firebase
import { getFirestore, collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { initializeApp } from "firebase/app"
// for firebase/firestore : end

Chart.register(...registerables);

let documentPath = '### YOUR PATH ###';

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

// for firebase/firestore : start
// Initialize Firebase
const firebaseApp = initializeApp(environment.firebaseConfig);
const db = getFirestore();
// for firebase/firestore : end

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

  // for @angular/fire : start
  //constructor(private firestore: AngularFirestore ) { }
  // for @angular/fire : end
  // for firebase/firestore : start
  constructor() { }
  // for firebase/firestore : end

  ngOnInit(): void {
    //console.log('ngOnInit');
    this.initTimeseriesChart();

    // for @angular/fire : start
    /*
    this.firestore.collection(documentPath,
      ref => ref.orderBy('timestamp', 'desc').limit(1))
            .valueChanges()
            .pipe(debounceTime(200))
            .subscribe(
              measurement => {
                console.log('latestMeasurement:', measurement[0]);
                const d = new Date(measurement[0]['timestamp'] * 1000);
                let timestamp = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
                console.log( timestamp );
                this.addDataToChart(this.chartTimeseries, timestamp,
                                    measurement[0]['temperature'], measurement[0]['humidity']);
                this.lastestTemperatureReading = measurement[0]['temperature'];
                this.lastestHumidityReading = measurement[0]['humidity'];
              }
            );
    */
    // for @angular/fire : end

    // for firebase/firestore : start
    const measurementsRef = collection(db, documentPath);
    const measurementsDoc = query(measurementsRef, orderBy("timestamp", "desc"), limit(1));
    const unsubscribe = onSnapshot(measurementsDoc, (querySnapshot) => {
      querySnapshot.forEach((measurement) => {
        let jsonTmp = JSON.parse(JSON.stringify(measurement.data()))
        console.log('latestMeasurement1: ', measurement.id, " => ", jsonTmp);
        const d = new Date(jsonTmp['timestamp'] * 1000);
        let timestamp = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
        //console.log( timestamp );
        this.addDataToChart(this.chartTimeseries, timestamp, jsonTmp['temperature'], jsonTmp['humidity']);
        this.lastestTemperatureReading = jsonTmp['temperature'];
        this.lastestHumidityReading = jsonTmp['humidity'];
      });
    });
    // for firebase/firestore : end

    //this.start();
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
