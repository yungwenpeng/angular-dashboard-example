import { formatDate } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Inject, Injectable, LOCALE_ID } from "@angular/core";
import { map, Subject } from "rxjs";
import { webSocket } from "rxjs/webSocket";
import { apiUrl, webSocketUrl } from "src/environments/environment";
import { EntityRelation } from "../models/asset";
import { Message } from "../models/telemetry";

@Injectable()
export class RoomDetailsService {
    roomDetails$: Subject<Array<EntityRelation>>;
    roomDetails: Array<EntityRelation>;
    detailsImageUrl: string = '';

    constructor(private httpClient: HttpClient, @Inject(LOCALE_ID) private locale: string) {
        this.roomDetails$ = new Subject<Array<EntityRelation>>();
        this.roomDetails = new Array<EntityRelation>();
        this.updateData();
    }

    updateData() {
        this.roomDetails$ = new Subject<Array<EntityRelation>>();
        this.roomDetails = new Array<EntityRelation>();
        let fromId: string = localStorage.getItem('roomAssetId') || '';
        let url = apiUrl + 'relations/info?fromId=' + fromId + '&fromType=ASSET';
        this.httpClient.get<Array<{ toName: string, to: { entityType: string, id: string } }>>(url)
            .pipe(map(response => {
                return response.map(roomDevice => new EntityRelation(roomDevice.toName, roomDevice.to.id, roomDevice.to.entityType));
            }))
            .subscribe(sc => {
                if (sc.length != 0) {
                    sc = sc.sort((a, b) => (a.toEntityType < b.toEntityType) ? 1 : ((b.toEntityType < a.toEntityType) ? -1 : 0));
                    sc.forEach((device, index) => {
                        this.roomDetails.push(sc[index]);
                        localStorage.getItem('detailsImageUrl') || this.imageFileChange("../../assets/upload-image-icon.png");
                        const subject = webSocket(webSocketUrl + "ws/plugins/telemetry?token=" + localStorage['token']);
                        let data = {
                            tsSubCmds: [
                                {
                                    entityType: "DEVICE",
                                    entityId: device.toid,
                                    scope: "LATEST_TELEMETRY",
                                    cmdId: index,
                                    keys: "temperature,humidity"
                                }
                            ]
                        };
                        subject.next(data);

                        subject.subscribe({
                            next: (v: any) => {
                                let obj = v as Message;
                                this.roomDetails[obj.subscriptionId].deviceName = device.toName;
                                // Icon From https://uxwing.com/
                                if (obj.errorCode == 0) {
                                    this.roomDetails[obj.subscriptionId].temperature.push(v.data.temperature[0][1] as number);
                                    this.roomDetails[obj.subscriptionId].humidity.push(v.data.humidity[0][1] as number);
                                    this.roomDetails[obj.subscriptionId].timestamps.push(formatDate(new Date(v.data.temperature[0][0]), "HH:mm:ss", this.locale));
                                    this.roomDetails[v.subscriptionId].detailsImageUrl = localStorage.getItem('detailsImageUrl') || '';
                                    this.roomDetails[obj.subscriptionId].notifyStatusImagesUrl = "";
                                    if (v.data.temperature[0][1] >= 27) {
                                        this.roomDetails[v.subscriptionId].temperatureImageUrl = "../../assets/high-temperature-icon.png";
                                        this.roomDetails[obj.subscriptionId].notifyStatusImagesUrl = "../../assets/warnning_icon.png";
                                    } else if (v.data.temperature[0][1] <= 25.5) {
                                        this.roomDetails[v.subscriptionId].temperatureImageUrl = "../../assets/low-temperature-icon.png";
                                    } else {
                                        this.roomDetails[v.subscriptionId].temperatureImageUrl = "../../assets/medium-temperature-icon.png";
                                    }
                                    this.roomDetails[v.subscriptionId].humidityImageUrl = "../../assets/humidity-icon.png";
                                    if (this.roomDetails[obj.subscriptionId].timestamps.length > 12) {
                                        this.roomDetails[obj.subscriptionId].timestamps.shift();
                                        this.roomDetails[obj.subscriptionId].temperature.shift();
                                        this.roomDetails[obj.subscriptionId].humidity.shift();
                                    }
                                    this.roomDetails[obj.subscriptionId].lineChartData = {
                                        datasets: [
                                            {
                                                label: 'Temperature',
                                                data: this.roomDetails[obj.subscriptionId].temperature,
                                                borderColor: 'rgb(227, 107, 59)'
                                            },
                                            {
                                                label: 'Humidity',
                                                data: this.roomDetails[obj.subscriptionId].humidity,
                                                borderColor: 'rgb(54, 162, 235)'
                                            }
                                        ],
                                        labels: this.roomDetails[obj.subscriptionId].timestamps
                                    };
                                } else {
                                    this.roomDetails[v.subscriptionId].detailsImageUrl = "../../assets/architectural-icon.png";
                                    this.roomDetails[obj.subscriptionId].notifyStatusImagesUrl = "";
                                }
                            },
                            error: (err) => console.error(err),
                            complete: () => console.log('complete')
                        });
                        console.log('subscribe roomDetails[', index, ']: ', this.roomDetails[index]);
                    });
                }
                this.roomDetails$.next(this.roomDetails);
            });
    }

    createImageFromBlob(image: Blob) {
        let reader = new FileReader();
        reader.onloadend = function () {
            //console.log('RESULT', reader.result)
            localStorage.setItem('detailsImageUrl', String(reader.result));
        }

        if (image) {
            reader.readAsDataURL(image);
        }
    }

    imageFileChange(imageUrl: string): void {
        this.httpClient.get(imageUrl, { responseType: 'blob' }).subscribe(data => {
            this.createImageFromBlob(data);
        }, error => {
            console.log(error);
        });
    }
}