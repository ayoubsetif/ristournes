import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgMathPipesModule } from 'ngx-pipes';

import { AppComponent } from './app.component';
import { DisplayProductsComponent } from './display-products/display-products.component';
import { RealisationProdComponent } from './realisation-prod/realisation-prod.component';
import { AvgSkuComponent } from './avg-sku/avg-sku.component';
import { ObjectivesComponent } from './objectives/objectives.component';
import { ObjectivesDetailsComponent } from './objectives-details/objectives-details.component';

@NgModule({
	declarations: [
		AppComponent,
		DisplayProductsComponent,
		RealisationProdComponent,
		AvgSkuComponent,
		ObjectivesComponent,
		ObjectivesDetailsComponent
	],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		MatButtonModule,
		MatSnackBarModule,
		MatFormFieldModule,
		MatSelectModule,
		MatTableModule,
		NgMathPipesModule,
		MatTooltipModule
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }
