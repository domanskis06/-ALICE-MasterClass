import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiService } from './api.service';
import { map } from 'rxjs/operators';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private apiService: ApiService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const token = sessionStorage.getItem(ApiService.TOKEN_KEY);

    if (token === null) {
      return this.router.parseUrl('/login');
    } else {
      this.apiService.setAuthToken(token);

      return true;
    }
  }


  // canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<UrlTree | boolean> {
  //   return this.apiService.isAuthenticated().pipe(map((isAuth) => {
  //     if (isAuth) {
  //       return true;
  //     } else {
  //       return this.router.parseUrl('/login');
  //     }
  //   }));
  // }
}