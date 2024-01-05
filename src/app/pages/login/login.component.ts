import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { SocketService } from 'src/app/services/socket.service';

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
  private authMessageParser = (raw_message: string) => {
    const message = JSON.parse(raw_message);
    if (message["Success"] == true) {
      this.router.navigate(["lobby"]); 
    }
  }

}
