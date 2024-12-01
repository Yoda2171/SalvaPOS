import { Routes } from '@angular/router';
import { HomeComponent } from './component/home/home.component';
import { CartComponent } from './component/cart/cart.component';
import { ReturnComponent } from './return/return.component';
import { NgModule } from '@angular/core';
import { AboutComponent } from './component/about/about.component';
export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'cart', component: CartComponent},
    {path: 'return', component: ReturnComponent},
    {path: 'about', component: AboutComponent}
];
