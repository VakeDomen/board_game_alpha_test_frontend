import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { LobbyComponent } from './pages/lobby/lobby.component';
import { HeadComponent } from './components/head/head.component';
import { FormsModule } from '@angular/forms';
import { GameComponent } from './pages/game/game.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import { PhaseSetupComponent } from './components/phase-setup/phase-setup.component';
import { PhaseEndComponent } from './components/phase-end/phase-end.component';
import { PhaseMainComponent } from './components/phase-main/phase-main.component';
import { PhaseTriggersComponent } from './components/phase-triggers/phase-triggers.component';
import { PhaseDmgComponent } from './components/phase-dmg/phase-dmg.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LobbyComponent,
    HeadComponent,
    GameComponent,
    CanvasComponent,
    PhaseSetupComponent,
    PhaseEndComponent,
    PhaseMainComponent,
    PhaseTriggersComponent,
    PhaseDmgComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
