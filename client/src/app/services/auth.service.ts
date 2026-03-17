import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

interface LoginResponse {
  token: string;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://website-sajak-kopi.onrender.com/api/auth';
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) { }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  get isLoggedIn$(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  get isLoggedIn(): boolean {
    return this.loggedIn.value;
  }

  get token(): string | null {
    return localStorage.getItem('token');
  }

  get username(): string | null {
    return localStorage.getItem('username');
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap(res => {
          localStorage.setItem('token', res.token);
          localStorage.setItem('username', res.username);
          this.loggedIn.next(true);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.loggedIn.next(false);
  }

  verify(): Observable<{ valid: boolean; username: string }> {
    return this.http.get<{ valid: boolean; username: string }>(`${this.apiUrl}/verify`, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
  }
}
