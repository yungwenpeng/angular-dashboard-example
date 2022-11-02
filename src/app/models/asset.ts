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
  constructor(public toName: string, public toid: string,
    public toEntityType: string) {
  }
}