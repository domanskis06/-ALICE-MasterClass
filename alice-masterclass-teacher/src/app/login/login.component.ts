import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { ApiService } from '../shared/services/api.service';
import { AuthGuard } from '../shared/services/auth.guard';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: false
})
export class LoginComponent implements OnInit {
  private readonly responseType: string = 'code';
  private readonly scope: string = 'openid profile';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private http: HttpClient) { }

  ngOnInit(): void {
    let token;
    
    if (this.skipTokenAuthentication()) {
      token = 'test-token';
    } else {
      token = this.getQueryToken();
    }

    if (token !== null) {
      sessionStorage.setItem(ApiService.TOKEN_KEY, token);

      this.apiService.setAuthToken(token);

      this.router.navigateByUrl('', {replaceUrl: true});

      return;
    }

    token = sessionStorage.getItem(ApiService.TOKEN_KEY);

    if (token !== null) {
      this.apiService.setAuthToken(token);

      this.router.navigateByUrl('', {replaceUrl: true});

      return;
    }

    this.fetchOpenIdConfig().subscribe((data) => {
      // Redirect to CERN SSO
      this.redirectToOAuth(data.authorization_endpoint);
    });
  }

  private skipTokenAuthentication(): boolean {
    return !environment.production;
  }

  private getQueryToken(): string | null {
    if (this.route.snapshot.queryParams) {
      return this.route.snapshot.queryParamMap.get(ApiService.TOKEN_KEY);
    } else {
      return null;
    }
  }

  private fetchOpenIdConfig(): Observable<any> {
    return this.http.get<any>(environment.openIdConfigUrl);
  }

  private redirectToOAuth(authorizationEndpoint: string): void {
    const r = encodeURIComponent(this.responseType);
    const cid = encodeURIComponent(environment.clientId);
    const ruri = encodeURIComponent(environment.redirectUri);
    const s = encodeURIComponent(this.scope);

    const url = `${authorizationEndpoint}?response_type=${r}&client_id=${cid}&redirect_uri=${ruri}&scope=${s}`;

    // Redirect by changing the browser's URL
    window.location.href = url;
  }
}
