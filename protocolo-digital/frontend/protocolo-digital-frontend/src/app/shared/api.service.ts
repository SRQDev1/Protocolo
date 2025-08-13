import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {}

  private withUser(options: any = {}) {
    const user = localStorage.getItem('usuario');
    const headers: any = options['headers'] || {};
    if (user) {
      headers['X-User-Id'] = JSON.parse(user).id;
    }
    return { ...options, headers };
  }

  get<T>(url: string, options?: any): Observable<T> {
    return this.http.get<T>(
      `${this.baseUrl}${url}`,
      this.withUser(options)
    ).pipe(catchError(err => this.handle(err))) as unknown as Observable<T>;
  }

  post<T>(url: string, body: any, options?: any): Observable<T> {
    return this.http.post<T>(
      `${this.baseUrl}${url}`,
      body,
      this.withUser(options)
    ).pipe(catchError(err => this.handle(err))) as unknown as Observable<T>;
  }

  put<T>(url: string, body: any, options?: any): Observable<T> {
    return this.http.put<T>(
      `${this.baseUrl}${url}`,
      body,
      this.withUser(options)
    ).pipe(catchError(err => this.handle(err))) as unknown as Observable<T>;
  }

  delete<T>(url: string, options?: any): Observable<T> {
    return this.http.delete<T>(
      `${this.baseUrl}${url}`,
      this.withUser(options)
    ).pipe(catchError(err => this.handle(err))) as unknown as Observable<T>;
  }

  private handle(err: any) {
    if (err.status === 403) {
      this.router.navigate(['/acesso-negado']);
    }
    return throwError(() => err);
  }
}
