import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { MessageResponse, SocketService } from 'src/app/services/socket.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
export class LoginComponent implements AfterViewInit {

  public name: string;
  @ViewChild('nameInput') nameInputRef!: ElementRef;

  constructor(
    private router: Router,
  ) {
    this.name = `Guest-${Math.round(Math.random() * 1000)}`;
  }
  ngAfterViewInit(): void {
    setTimeout(() => { // Ensure this runs after Angular has updated the view
      this.nameInputRef.nativeElement.focus();
      this.nameInputRef.nativeElement.select();
    });
  }


  public login() {
    if (this.name.includes(" ")) {
      this.name.replace(" ", "-");
    }
    SocketService.messages$.subscribe(this.authMessageParser)
    AuthService.logIn(this.name);

  }
  private authMessageParser = (response: MessageResponse) => {
    const message = JSON.parse(response.data);
    if (message["Success"] == true) {
      this.router.navigate(["lobby"]); 
    }
  }

}
