import { Component } from '@angular/core';
import { ApiService } from './shared/services/api.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'alice-masterclass-teacher';

  constructor(private apiService: ApiService) {
    apiService.API_URL = environment.apiUrl;
  }
}
