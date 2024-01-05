import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LobbyComponent } from './pages/lobby/lobby.component';
import { AuthGuard } from './services/auth.guard';

const routes: Routes =  [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'lobby',
    component: LobbyComponent,
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    component: LobbyComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
