import { Component } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import jwt_decode from 'jwt-decode';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(private authenticationService: AuthenticationService) {
    console.log('HomeComponent');
    const decodedToken: any = jwt_decode(localStorage['token'])
  }

  logout() {
    this.authenticationService.logout();
  }

}
