import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
	selector: 'category-products',
	templateUrl: './category-products.component.html',
	styleUrls: ['./category-products.component.scss']
})
export class CategoryProductsComponent implements OnInit {
	displayedColumns: string[] = ['id', 'name', 'TTC', 'HT', 'quantityCS', 'quantityEA'];

	constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

	ngOnInit() {}

}
