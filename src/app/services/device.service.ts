import { HttpClient } from "@angular/common/http";
import { Inject, Injectable, LOCALE_ID } from "@angular/core";
import { map, Subject } from "rxjs";
import { Device } from "../models/device";
import jwt_decode from 'jwt-decode';
import { apiUrl, webSocketUrl } from "src/environments/environment";
import { webSocket } from "rxjs/webSocket";
import { Message } from "../models/telemetry";
import { formatDate } from "@angular/common";


@Injectable()
export class DeviceService {
    devices: Array<Device>;
    devices$: Subject<Array<Device>>;
    decodedToken: any;
    fetchDeviceUrl: any;

    constructor(private httpClient: HttpClient, @Inject(LOCALE_ID) private locale: string) {
        this.devices$ = new Subject<Array<Device>>();
        this.devices = new Array<Device>();
        this.decodedToken = jwt_decode(localStorage['token']);
        if (this.decodedToken['scopes'][0] === 'CUSTOMER_USER') {
            // For customer fetch device info API
            this.fetchDeviceUrl = apiUrl + 'customer/' + this.decodedToken['customerId'] + '/deviceInfos?pageSize=20&page=0'
        } else if (this.decodedToken['scopes'][0] === 'TENANT_ADMIN') {
            // For tenant fetch device info API
            this.fetchDeviceUrl = apiUrl + 'tenant/deviceInfos?pageSize=20&page=0';
        }
        this.httpClient.get<{ data: Array<{ name: string, id: { id: string } }> }>(this.fetchDeviceUrl)
            .pipe(map(response => {
                return response.data.map(device => new Device(device.name, device.id.id));
            }))
            .subscribe(x => {
                this.devices = x;
                const subject = webSocket(webSocketUrl + "ws/plugins/telemetry?token=" + localStorage['token']);
                this.devices.forEach((device, index) => {
                    let data = {
                        tsSubCmds: [
                            {
                                entityType: "DEVICE",
                                entityId: device.id,
                                scope: "LATEST_TELEMETRY",
                                cmdId: index,
                                keys: "temperature"
                            }
                        ]
                    };
                    subject.next(data);
                });
                console.log("subscribe");
                subject.subscribe({
                    next: (v: any) => {
                        console.log(v);
                        let obj = v as Message;
                        if (obj.data.temperature) {
                            this.devices[obj.subscriptionId].timestamps.push(formatDate(new Date(obj.data.temperature[0][0]), "HH:mm:ss", this.locale));
                            this.devices[obj.subscriptionId].temperature.push(obj.data.temperature[0][1] as number);
                        }
                        if (this.devices[obj.subscriptionId].timestamps.length > 30) {
                            this.devices[obj.subscriptionId].timestamps.shift();
                            this.devices[obj.subscriptionId].temperature.shift();
                        }
                        this.devices[obj.subscriptionId].lineChartData = {
                            datasets: [
                                {
                                    data: this.devices[obj.subscriptionId].temperature
                                }
                            ],
                            labels: this.devices[obj.subscriptionId].timestamps
                        };
                        this.devices$.next(this.devices);
                    },
                    error: (err) => console.error(err),
                    complete: () => console.log('complete')
                });
            });
    }
}
