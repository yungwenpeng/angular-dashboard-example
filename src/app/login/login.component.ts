import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  hide : boolean = true;
  
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.minLength(6)]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  IsAuthenticationFailed$: Observable<boolean>;

  constructor(private authenticationService: AuthenticationService, private router: Router, private httpClient: HttpClient) {
    this.IsAuthenticationFailed$ = this.authenticationService.isAuthenticationFailedObsservable$;
  }

  login() {
    this.authenticationService.authentication(this.loginForm.value);
  }

}
