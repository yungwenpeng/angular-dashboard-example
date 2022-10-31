import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { apiUrl } from 'src/environments/environment';
import { AuthenticationResponse } from '../models/authentication.response';
import { User } from '../models/user';
import { JwtHelperService } from '@auth0/angular-jwt';



@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {
  private isAuthenticationFailedSubject: Subject<boolean>;
  isAuthenticationFailedObsservable$: Observable<boolean>;

  constructor(private router: Router, private httpClient: HttpClient) {
    this.isAuthenticationFailedSubject = new Subject<boolean>();
    this.isAuthenticationFailedObsservable$ = this.isAuthenticationFailedSubject.asObservable();
  }

  authentication(user: User): void {
    this.httpClient.post<AuthenticationResponse>(apiUrl + "auth/login", user)
      .subscribe(
        {
          next: response => {
            if (response.token !== undefined) {
              console.log(response.token);
              localStorage['token'] = response.token;
              this.router.navigate(['home']);
            } else {
              this.isAuthenticationFailedSubject.next(true);
            }
          },
          error: error => {
            this.isAuthenticationFailedSubject.next(true);
          }
        }
      )
  }

  logout() {
    localStorage.clear();
  }

  isAuthenticated(): boolean {
    const token = localStorage['token'];
    return token != null && token != undefined;
  }

  isTokenExpired(): boolean {
    const helper = new JwtHelperService();
    return helper.isTokenExpired(localStorage['token']);
  }
}
