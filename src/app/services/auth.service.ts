import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private static username: string | undefined;

  constructor(
    private router: Router
  ) {
   
  }

  static isLoggedIn() {
    return !!AuthService.username;
  }

  static logIn(name: string) {
    SocketService.sendMessage("CONTROL AUTH " + name);
    AuthService.username = name;
  }


}
