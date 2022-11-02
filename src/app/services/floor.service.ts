import { formatDate } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Inject, Injectable, LOCALE_ID } from "@angular/core";
import { map, Subject } from "rxjs";
import { webSocket } from "rxjs/webSocket";
import { apiUrl, webSocketUrl } from "src/environments/environment";
import { EntityRelation } from "../models/asset";

@Injectable()
export class FloorService {
    rooms: Array<EntityRelation>;
    rooms$: Subject<Array<EntityRelation>>;

    constructor(private httpClient: HttpClient, @Inject(LOCALE_ID) private locale: string) {
        this.rooms$ = new Subject<Array<EntityRelation>>();
        this.rooms = new Array<EntityRelation>();
        let fromId: string = localStorage.getItem('floorAssetId') || '';
        // Returns list of relation info objects for the specified entity by the 'from' direction.
        let fetchRoomUrl: string = apiUrl + 'relations/info?fromId=' + fromId + '&fromType=ASSET';
        this.httpClient.get<Array<{ toName: string, to: { entityType: string, id: string } }>>(fetchRoomUrl)
            .pipe(map(response => {
                return response.map(room => new EntityRelation(room.toName, room.to.id, room.to.entityType));
            }))
            .subscribe(x => {
                console.log('subscribe floor rooms asset:', x);
                this.rooms = x.sort((a, b) => (a.toName > b.toName) ? 1 : ((b.toName > a.toName) ? -1 : 0));
                this.rooms.forEach((room, index) => {
                    let url = apiUrl + 'relations/info?fromId=' + room.toid + '&fromType=ASSET';
                    //console.log('subscribe floor rooms asset url:', url);
                    this.httpClient.get<Array<{ toName: string, to: { entityType: string, id: string } }>>(url)
                        .pipe(map(response => {
                            return response.map(roomDevice => new EntityRelation(roomDevice.toName, roomDevice.to.id, roomDevice.to.entityType));
                        }))
                        .subscribe(sc => {
                            if (sc.length != 0) {
                                let roomDevices: any = '';
                                //roomDevices = sc.sort((a,b) => (a.toName > b.toName) ? 1 : ((b.toName > a.toName) ? -1 : 0));
                                sc.forEach((device) => {
                                    roomDevices = device;
                                });
                                const subject = webSocket(webSocketUrl + "ws/plugins/telemetry?token=" + localStorage['token']);
                                let data = {
                                    tsSubCmds: [
                                        {
                                            entityType: "DEVICE",
                                            entityId: roomDevices.toid,
                                            scope: "LATEST_TELEMETRY",
                                            cmdId: index,
                                            keys: "temperature,humidity"
                                        }
                                    ]
                                };
                                subject.next(data);
                                console.log("FloorService subscribe " + roomDevices.toName + " data:", data);
                                subject.subscribe({
                                    next: (v: any) => {
                                        if (v.errorCode == 0) {
                                            if (v.data.temperature) {
                                                this.rooms[v.subscriptionId].timestamps.push(formatDate(new Date(v.data.temperature[0][0]), "HH:mm:ss", this.locale));
                                                this.rooms[v.subscriptionId].deviceName = roomDevices.toName;
                                                this.rooms[v.subscriptionId].deviceId = roomDevices.toid;
                                                this.rooms[v.subscriptionId].temperature.push(v.data.temperature[0][1] as number);
                                                this.rooms[v.subscriptionId].humidity.push(v.data.humidity[0][1] as number);
                                            }
                                        }
                                    },
                                    error: (err) => console.error(err),
                                    complete: () => console.log('complete')
                                });
                            }
                        });
                });
                this.rooms$.next(this.rooms);
            });
    }
}