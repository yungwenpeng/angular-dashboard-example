import { Component } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import jwt_decode from 'jwt-decode';
import { Location } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  decodedToken: any;
  LoginUserFirstName: string = "";
  navbarItemName: string = "Login";
  constructor(private authenticationService: AuthenticationService, private Location: Location) {
    console.log('isAuthenticated: ', this.authenticationService.isAuthenticated(), ' , isTokenExpired: ',
      this.authenticationService.isTokenExpired()
    )
  }

  isHiddenListItem() {
    if (!this.authenticationService.isAuthenticated() || this.authenticationService.isTokenExpired()) {
      return false;
    } else {
      const decodedToken: any = jwt_decode(localStorage['token'])
      this.LoginUserFirstName = decodedToken['userName']
      this.navbarItemName = this.Location.path().substring(1) || ''
    }
    return true;
  }

  logout() {
    this.authenticationService.logout();
  }

}
