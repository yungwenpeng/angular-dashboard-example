import { HttpClient } from "@angular/common/http";
import { Inject, Injectable, LOCALE_ID } from "@angular/core";
import { map, Subject } from "rxjs";
import { Asset } from "../models/asset";
import jwt_decode from 'jwt-decode'
import { apiUrl } from "src/environments/environment";

@Injectable()
export class BuildingService {
    floors: Array<Asset>;
    floors$: Subject<Array<Asset>>;
    decodedToken: any;
    fetchAssetUrl: any;

    constructor(private httpClient: HttpClient, @Inject(LOCALE_ID) private locale: string) {
        this.floors$ = new Subject<Array<Asset>>();
        this.floors = new Array<Asset>();
        this.decodedToken = jwt_decode(localStorage['token']);
        if (this.decodedToken['scopes'][0] === 'CUSTOMER_USER') { // For customer fetch asset info API
            this.fetchAssetUrl = apiUrl + 'customer/' + this.decodedToken['customerId'] + '/assetInfos?pageSize=100&page=0&type=Floor'
        } else if (this.decodedToken['scopes'][0] === 'TENANT_ADMIN') { // For tenant fetch asset info API
            this.fetchAssetUrl = apiUrl + 'tenant/assetInfos?pageSize=100&page=0&type=Floor';
        }
        // Returns a page of building floors assigned to tenant/customer. 
        this.httpClient.get<{ data: Array<{ name: string, id: { id: string } }> }>(this.fetchAssetUrl)
            .pipe(map(response => {
                return response.data.map(asset => new Asset(asset.name, asset.id.id));
            }))
            .subscribe(x => {
                this.floors = x.sort((a, b) => (a.name < b.name) ? 1 : ((b.name < a.name) ? -1 : 0));
                console.log("subscribe x:", x);
                this.floors$.next(this.floors);
                console.log("subscribe floors$:", this.floors$);
            });
    }
}