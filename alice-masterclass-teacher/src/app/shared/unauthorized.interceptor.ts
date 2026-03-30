import { Injectable } from '@angular/core';
import { HttpEvent, HttpErrorResponse, HttpInterceptor, HttpHandler, HttpRequest, HttpStatusCode } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './services/api.service';

@Injectable()
export class UnauthorizedInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(catchError(
      (err: HttpErrorResponse) => {
        if (this.router.url !== '/login' && err.status === HttpStatusCode.Unauthorized) {
          sessionStorage.removeItem(ApiService.TOKEN_KEY);
          this.router.navigate(['/login']);
        }
        return throwError(err);
      }
    ));
  }
}