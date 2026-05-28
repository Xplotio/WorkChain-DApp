import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { WorkerProfileComponent } from './pages/worker-profile/worker-profile';
import { WorkersComponent } from './pages/workers/workers';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'worker-profile',
    component: WorkerProfileComponent
  },
  {
    path: 'workers',
    component: WorkersComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
