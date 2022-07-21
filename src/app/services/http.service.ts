import { HttpClient, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { AuthState } from 'src/models/auth/auth.state';

type API = 'api-token-auth' | 'initialize' | 'register' | 'data' | 'payment' | 'subscription';

@Injectable()
export class HttpService implements HttpInterceptor {

  constructor(private store: Store, private http: HttpClient) {}

  post(api: API, body: any) {
    return this.http.post(`${environment.backUrl}/${api}/`, body, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  get(api: API, params: any) {
    return this.http.get(`${environment.backUrl}/${api}/`, {params});
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const { token } = this.store.selectSnapshot(AuthState);
    if ( !token ) return next.handle(req);

    return next.handle(req.clone({
      setHeaders: {
        'Authorization': `Token ${token}`,
      }
    }))  
  }
};