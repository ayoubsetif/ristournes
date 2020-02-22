import { Component, OnInit, Input } from '@angular/core';
import * as _ from 'lodash';
import { GetProductService } from '../app-services/get-product.service';
import { MatDialog } from '@angular/material/dialog';
import { DiscountDetailsComponent } from '../discount-details/discount-details.component';

@Component({
	selector: 'realisation-prod',
	templateUrl: './realisation-prod.component.html',
	styleUrls: ['./realisation-prod.component.scss']
})
export class RealisationProdComponent implements OnInit {
	@Input() products: any[];
	displayedColumns: string[] = ['id', 'name', 'TTC', 'HT', 'quantityCS', 'quantityEA', 'details'];
	canalType = [
		{ id: 0, name: 'ALL'},
		{ id: 1, name: 'Gros'},
		{ id: 2, name: 'Detail'},
	];
	tab = [];
	constructor(private getProductService: GetProductService, private dialog: MatDialog) { }

	ngOnInit() { }

	ngOnChanges() {
		this.tab =	this.getProductService.getProduct(JSON.parse(JSON.stringify(this.products)));
	}

	selectCanal(event) {
		const data =	JSON.parse(JSON.stringify(this.products));
		switch (event.value) {
			case 0:
				this.tab = this.getProductService.getProduct(data);
				break;
			case 1:
				this.tab = this.getProductService.getProduct(data.filter(f => f['salesmanType'].includes('Gros')));
				break;
			case 2:
				this.tab = this.getProductService.getProduct(data.filter(f => !f['salesmanType'].includes('Gros')));
				break;

			default:
				break;
		}
	}

	openDialog(data): void {
		const dialogRef = this.dialog.open(DiscountDetailsComponent, {
			width: '70%',
			data: data,
			panelClass: 'myapp-height-dialog'
		});
	}
}
