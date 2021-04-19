import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NewUserComponent } from './login/new-user/new-user.component';


export const routes: Routes = [{
  path: '',
  component: HomeComponent,
  pathMatch: 'full',
},
{
  path: 'apply',
  component: NewUserComponent,
},
{
  path: 'admin',
  loadChildren: () => import('./admin/admin.module').then((m) => m.AdminModule),
},
{
  path: 'user',
  loadChildren: () => import('./user/user.module').then((m) => m.UserModule),
},
{
  path: 'shop',
  loadChildren: () => import('./shopping/shopping.module').then((m) => m.ShoppingModule),
},
{
  path: '**',
  redirectTo: '',
}];
@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}


