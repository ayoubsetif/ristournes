import { Component, OnInit, Input } from '@angular/core';
import * as _ from 'lodash';

@Component({
	selector: 'avg-sku',
	templateUrl: './avg-sku.component.html',
	styleUrls: ['./avg-sku.component.scss']
})
export class AvgSkuComponent implements OnInit {
	@Input() avgSKU: any[];
	displayedColumns: string[] = ['name', 'invoices', 'skus', 'avg'];
	salesmanType = [
		{ id: 0, name: 'ALL'},
		{ id: 1, name: 'Gros'},
		{ id: 2, name: 'Detail'},
	];
	tab = [];

	constructor() { }

	ngOnInit() {
		const data =	JSON.parse(JSON.stringify(this.avgSKU));
		this.tab = data;
		this.getTotalInvoicesAndSku(this.tab);
	}

	selectSalesmanType(event) {
		const data =	JSON.parse(JSON.stringify(this.avgSKU));

		switch (event.value) {
			case 0:
				this.tab = data;
				this.getTotalInvoicesAndSku(this.tab);
				break;
			case 1:
				this.tab = data.filter(f => f['salesmanType'].includes('Gros'));
				this.getTotalInvoicesAndSku(this.tab);
				break;
			case 2:
				this.tab = data.filter(f => !f['salesmanType'].includes('Gros'));
				this.getTotalInvoicesAndSku(this.tab);
				break;

			default:
				break;
		}
	}

	getTotalInvoicesAndSku(tab) {
		const SumInvoice = _.reduce(tab.map(m => m['invoice']), function(a, b) { return a + b; }, 0);
		const SumSKU = _.reduce(tab.map(m => m['totalSKU']), function(a, b) { return a + b; }, 0);

		this.tab.push({
			name: 'Total',
			invoice: SumInvoice,
			totalSKU: SumSKU,
			avg: SumSKU / SumInvoice
		});
	}

}
