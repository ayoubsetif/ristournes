import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

import { NgMathPipesModule } from 'ngx-pipes';

import { AppComponent } from './app.component';
import { DisplayProductsComponent } from './display-products/display-products.component';
import { RealisationProdComponent } from './realisation-prod/realisation-prod.component';

@NgModule({
	declarations: [
		AppComponent,
		DisplayProductsComponent,
		RealisationProdComponent
	],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		MatButtonModule,
		MatSnackBarModule,
		MatFormFieldModule,
		MatSelectModule,
		MatTableModule,
		NgMathPipesModule
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }
