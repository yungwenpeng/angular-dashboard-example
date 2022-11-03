import { formatDate } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Inject, Injectable, LOCALE_ID } from "@angular/core";
import { map, Subject } from "rxjs";
import { apiUrl } from "src/environments/environment";
import { EntityAlarm } from "../models/asset";

@Injectable()
export class HighEventHistoryService {
    eventHistories: Array<EntityAlarm>;
    eventHistories$: Subject<Array<EntityAlarm>>;

    constructor(private httpClient: HttpClient, @Inject(LOCALE_ID) private locale: string) {
        this.eventHistories$ = new Subject<Array<EntityAlarm>>();
        this.eventHistories = new Array<EntityAlarm>();
        this.updateData();
    }

    updateData() {
        this.eventHistories$ = new Subject<Array<EntityAlarm>>();
        this.eventHistories = new Array<EntityAlarm>();
        let url = apiUrl + 'alarm/DEVICE/' + localStorage.getItem('deviceId') + '/?pageSize=10&page=0&sortProperty=createdTime&sortOrder=DESC';
        this.httpClient.get<
            {
                data: Array<{
                    name: string, createdTime: string, status: string,
                    id: { entityType: string, id: string }, details: Array<string>,
                    severity: string, startTs: string, type: string, ackTs: string,
                    clearTs: string, endTs: string
                }>
            }>(url)
            .pipe(map(response => {
                return response.data.map(e => new EntityAlarm(
                    e.id.entityType, e.id.id, e.ackTs, e.clearTs, e.createdTime,
                    e.details, e.endTs, e.name, e.severity, e.startTs, e.status, e.type));
            }))
            .subscribe({
                next: (v) => {
                    this.eventHistories = v;
                    v.forEach((event, index) => {
                        this.eventHistories[index].createdTime = formatDate(new Date(event.createdTime), "YYYY/MM/dd h:mm:ss a", this.locale);
                        this.eventHistories[index].startTs = formatDate(new Date(event.startTs), "YYYY/MM/dd h:mm:ss a", this.locale);
                        this.eventHistories[index].endTs = formatDate(new Date(event.endTs), "YYYY/MM/dd h:mm:ss a", this.locale);
                    });

                    console.log("update alarm event:", this.eventHistories);
                    this.eventHistories$.next(this.eventHistories);
                },
                error: (err) => console.error(err),
                complete: () => console.log('update alarm event history complete')
            });
    }
}