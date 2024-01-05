import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private static username: String | undefined;

  constructor() { }

  static isLoggedIn() {
    return !!AuthService.username;
  }

  static logIn(name: String) {
    AuthService.username = name;
  }

}
