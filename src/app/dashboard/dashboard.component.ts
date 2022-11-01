import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Asset } from '../models/asset';
import { AuthenticationService } from '../services/authentication.service';
import { BuildingService } from '../services/building.service';
import jwt_decode from 'jwt-decode';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [BuildingService]
})

export class DashboardComponent {
  floors$: Subject<Array<Asset>>;
  LoginUserFirstName: string = "DummyFName";

  constructor(private authenticationService: AuthenticationService, private BuildingService: BuildingService,
    private router: Router) {
    const decodedToken: any = jwt_decode(localStorage['token'])
    this.LoginUserFirstName = decodedToken['sub'].slice(0, decodedToken['sub'].lastIndexOf("@"))
    this.floors$ = BuildingService.floors$;
  }

  entryFloor(id: string) {
    localStorage.setItem('floorAssetId', id);
    console.log("entryFloor: ", localStorage.getItem('floorAssetId'));
    this.router.navigate(['dashboard', localStorage.getItem('floorAssetId')]);
  }
}
