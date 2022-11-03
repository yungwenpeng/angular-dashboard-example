export class Asset {
  constructor(public name: string, public id: string) {
  }
}

export class EntityRelation {
  roomName: string = '';
  deviceName: string = '';
  deviceId: string = '';
  timestamps = new Array<string>();
  temperature = new Array<number>();
  humidity = new Array<number>();
  notifyStatusImagesUrl: string = '';
  detailsImageUrl: string ='';
  temperatureImageUrl: string ='';
  humidityImageUrl: string ='';
  lineChartData: any;
  constructor(public toName: string, public toid: string,
    public toEntityType: string) {
  }
}

export class EntityAlarm {
  /*ackTs: string = '';
  clearTs: string = '';
  createdTime: string = '';
  details = new Array<string>();
  endTs: string = '';*/
  constructor(
    public entityType:string, public id:string, public ackTs: string, public clearTs: string,
    public createdTime: string, public details: Array<string>, public endTs: string,
    public name: string, public severity: string, public startTs: string, public status: string,
    public type: string
  ) {}
  /*name: string = '';
  severity: string = '';
  startTs: string = '';
  status: string = '';
  type: string = '';*/
}