import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable()
export class TokenInterceptorService implements HttpInterceptor {
  constructor() { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage["token"];
    let newHeaders = req.headers;
    if (token) {
      newHeaders = newHeaders.append('X-Authorization', `Bearer ${localStorage['token']}`);
    }
    const authReq = req.clone({ headers: newHeaders });
    return next.handle(authReq);
  }
}
