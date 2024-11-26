import { Routes } from '@angular/router';
import { HomeComponent } from './component/home/home.component';
import { CartComponent } from './component/cart/cart.component';
import { ReturnComponent } from './return/return.component';
import { NgModule } from '@angular/core';
export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'cart', component: CartComponent},
    {path: 'return', component: ReturnComponent}
];
