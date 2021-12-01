import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) { }

  login({username, password}: {username: string; password: string}) {
    return this.http.post(environment.backUrl + 'visioServer/api-token-auth/', {username, password})
  }

  logout(token: string) {
    return of(true);
  }
}