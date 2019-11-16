import { Component, OnInit, Input } from '@angular/core';
import * as _ from 'lodash';
import { GetProductService } from '../app-services/get-product.service';

@Component({
	selector: 'objectives-details',
	templateUrl: './objectives-details.component.html',
	styleUrls: ['./objectives-details.component.scss']
})
export class ObjectivesDetailsComponent implements OnInit {
	@Input() products: any;
	displayedColumns: string[] = ['id', 'name', 'HT', 'TTC', 'quantityCS', 'quantityEA' ];
	tab = [];
	canalType = [
		{ id: 0, name: 'ALL'},
		{ id: 1, name: 'Gros'},
		{ id: 2, name: 'Detail'},
	];

	constructor(private getProductService: GetProductService) { }


	ngOnInit() {	}

	ngOnChanges() {
		const data =	JSON.parse(JSON.stringify(this.products));
		if (data && data.type === 'rejected') {
			this.tab = data.products;
		} else {
			this.tab = this.getProductService.getProduct(data.products);
		}
	}

	selectCanal(event) {
		const data =	JSON.parse(JSON.stringify(this.products));
		switch (event.value) {
			case 0:
				this.tab = this.getProductService.getProduct(data.products);
				break;
			case 1:
				this.tab = this.getProductService.getProduct(data.products.filter(f => f['salesmanType'] === 'Gros'));
				break;
			case 2:
				this.tab = this.getProductService.getProduct(data.products.filter(f => f['salesmanType'] === 'Detail'));
				break;

			default:
				break;
		}
	}
}
