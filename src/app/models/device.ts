export class Device {
  humidity = new Array<number>();
  temperature = new Array<number>();
  timestamps = new Array<string>();
  lineChartData: any;
  constructor(public name: string, public id: string) { }
}