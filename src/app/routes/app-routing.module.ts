import { Routes } from "@angular/router";
import { DashboardComponent } from '../dashboard/dashboard.component';
import { FloorComponent } from "../dashboard/floor.component";
import { DeviceComponent } from "../device/device.component";
import { AuthGuard } from '../guards/auth.guard';
import { HomeComponent } from '../home/home.component';
import { LoginComponent } from '../login/login.component';

export const AppRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'device', component: DeviceComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  {path: 'dashboard/:id', component:FloorComponent},
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'home', pathMatch: 'full' }
];
