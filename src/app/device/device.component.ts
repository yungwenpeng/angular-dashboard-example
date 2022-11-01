import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { Device } from '../models/device';
import { AuthenticationService } from '../services/authentication.service';
import { DeviceService } from '../services/device.service';
import jwt_decode from 'jwt-decode';
import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.css'],
  providers: [DeviceService]
})

export class DeviceComponent {
  public lineChartType: ChartType = 'line';
  public lineChartOptions: ChartConfiguration['options'] = {
    animation: { duration: 0 },
    plugins: { legend: { display: false } },
    elements: { point: { radius: 0 } }
  };

  devices$: Subject<Array<Device>>;
  LoginUserFirstName: string = "DummyFName";

  constructor(private authenticationService: AuthenticationService, private DeviceService: DeviceService) {
    const decodedToken: any = jwt_decode(localStorage['token'])
    this.LoginUserFirstName = decodedToken['sub'].slice(0, decodedToken['sub'].lastIndexOf("@"))
    this.devices$ = DeviceService.devices$;
  }

  logout() {
    this.authenticationService.logout();
  }

}
