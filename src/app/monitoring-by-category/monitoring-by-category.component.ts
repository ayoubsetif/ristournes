import { Component, OnInit, Input } from '@angular/core';
import * as _ from 'lodash';
import { GetProductService } from '../app-services/get-product.service';

@Component({
	selector: 'monitoring-by-category',
	templateUrl: './monitoring-by-category.component.html',
	styleUrls: ['./monitoring-by-category.component.scss']
})
export class MonitoringByCategoryComponent implements OnInit {
	@Input() products: any[];
	@Input() category: any;

	canalType = [
		{ id: 0, name: 'ALL'},
		{ id: 1, name: 'Gros'},
		{ id: 2, name: 'Detail'},
	];
	tab = [];
	displayedByQuantity: string[] = [ 'name', 'achievedQuantityCS', 'objectiveQuantityCS', 'Progression', 'GAP' ];
	displayedByNPS: string[] = ['name', 'objectivesHT', 'achievedHT', 'objectivesTTC', 'achievedTTC', 'Progression', 'GAP'];
	displayed = [ true , false ];

	constructor(private prodService: GetProductService) { }

	ngOnInit() {
		this.tab = this.getCategory(this.getProduct(JSON.parse(JSON.stringify(this.products))));
	}

	getProduct(data) {
		return this.prodService.getProductsForSuivi(data);
	}

	getCategory(data) {
		return this.prodService.getCategory(data, this.category);
	}

	chooseBy(event) {
		if (event.value === 'CS') {
			this.displayed = [true, false];
		} else {
			this.displayed = [false, true];
		}
	}

	selectCanal(event) {
		const data =	JSON.parse(JSON.stringify(this.products));
		switch (event.value) {
			case 0:
				this.tab = this.getCategory(this.getProduct(data));
				break;
			case 1:
				this.tab = this.getCategory(this.getProduct(data.filter(f => f['salesmanType'].includes('Gros'))));
				break;
			case 2:
				this.tab = this.getCategory(this.getProduct(data.filter(f => !f['salesmanType'].includes('Gros'))));
				break;

			default:
				break;
		}
	}


}
