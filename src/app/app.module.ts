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
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { DisplayProductsComponent } from './display-products/display-products.component';
import { RealisationProdComponent } from './realisation-prod/realisation-prod.component';
import { AvgSkuComponent } from './avg-sku/avg-sku.component';
import { ObjectivesComponent } from './objectives/objectives.component';
import { ObjectivesDetailsComponent } from './objectives-details/objectives-details.component';
import { MonitoringByProductComponent } from './monitoring-by-product/monitoring-by-product.component';
import { MainComponent } from './main/main.component';
import { AchivementComponent } from './achivement/achivement.component';
import { MonitoringByCategoryComponent } from './monitoring-by-category/monitoring-by-category.component';
import { CategoryProductsComponent } from './category-products/category-products.component';

@NgModule({
	declarations: [
		AppComponent,
		DisplayProductsComponent,
		RealisationProdComponent,
		AvgSkuComponent,
		ObjectivesComponent,
		ObjectivesDetailsComponent,
		MonitoringByProductComponent,
		MainComponent,
		AchivementComponent,
		MonitoringByCategoryComponent,
		CategoryProductsComponent
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
		MatTooltipModule,
		MatButtonToggleModule,
		AppRoutingModule,
		MatDialogModule
	],
	entryComponents: [
		CategoryProductsComponent
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }
