import { Component, OnInit, Input } from '@angular/core';
import { GetProductService } from '../app-services/get-product.service';
import { CategoryProductsComponent } from '../category-products/category-products.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as _ from 'lodash';

@Component({
	selector: 'display-products',
	templateUrl: './display-products.component.html',
	styleUrls: ['./display-products.component.scss']
})
export class DisplayProductsComponent implements OnInit {
	@Input() products: any[];
	@Input() type: any;
	@Input() category: any;
	//canal: string;

	canalType = [
		{ id: 0, name: 'ALL'},
		{ id: 1, name: 'Gros'},
		{ id: 2, name: 'Detail'},
	];
	tab = [];

	displayedColumns: string[] = ['name', 'TTC', 'HT', 'quantityCS', 'quantityEA', 'details'];
	constructor(private getProductService: GetProductService, private dialog: MatDialog) { }

	ngOnInit() {
		//if(this.type === 'objective') { this.canal = 'GROS'	} else { this.canal = 'Gros' } 
	}

	ngOnChanges() {
		const data =	JSON.parse(JSON.stringify(this.products));
		this.tab = this.getCategory(this.getProductService.getProduct(data));
	}

	selectCanal(event) {
		const data =	JSON.parse(JSON.stringify(this.products));
		switch (event.value) {
			case 0:
				this.tab = this.getCategory(this.getProductService.getProduct(data));
				break;
			case 1:
				this.tab = this.getCategory(this.getProductService.getProduct(data.filter(f => f['salesmanType'].includes('Gros'))));
				break;
			case 2:
				this.tab = this.getCategory(this.getProductService.getProduct(data.filter(f => !f['salesmanType'].includes('Gros'))));
				break;

			default:
				break;
		}
	}

	getCategory(value) {
		const realization = [];
		this.category.forEach(cat => {
			const r = { name: cat['name'], products: [], HT: 0, TTC: 0 };
			cat['products'].forEach(pr => {
				const found = value.filter(f => f['id'] === pr);
				if (found && found.length) { r['products'].push(found[0]);	}
			});
			r['TTC'] = _.reduce(r['products'].map(m => m['TTC']), function(a, b) { return a + b; }, 0);
			r['HT'] = _.reduce(r['products'].map(m => m['HT']), function(a, b) { return a + b; }, 0);
			r['quantityCS'] = _.reduce(r['products'].map(m => m['quantityCS']), function(a, b) { return a + b; }, 0);
			r['quantityEA'] = _.reduce(r['products'].map(m => m['quantityEA']), function(a, b) { return a + b; }, 0);
			realization.push(r);
		});
		return realization;
	}

	openDialog(data): void {
		const dialogRef = this.dialog.open(CategoryProductsComponent, {
			width: '70%',
			data: data
		});
	}

}
