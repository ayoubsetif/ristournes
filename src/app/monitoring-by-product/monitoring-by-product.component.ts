import { Component, OnInit, Input } from '@angular/core';
import * as _ from 'lodash';

@Component({
	selector: 'monitoring-by-product',
	templateUrl: './monitoring-by-product.component.html',
	styleUrls: ['./monitoring-by-product.component.scss']
})
export class MonitoringByProductComponent implements OnInit {
	@Input() products: any[];

	canalType = [
		{ id: 0, name: 'ALL'},
		{ id: 1, name: 'Gros'},
		{ id: 2, name: 'Detail'},
	];
	tab = [];
	displayedByQuantity: string[] = ['id', 'name', 'achievedQuantityCS', 'objectiveQuantityCS', 'Progression', 'GAP' ];
	displayedByNPS: string[] = ['id', 'name', 'objectivesHT', 'achievedHT', 'objectivesTTC', 'achievedTTC', 'Progression', 'GAP'];
	displayed = [ true , false ];

	constructor() { }

	ngOnInit() {
		this.tab = this.getProduct(JSON.parse(JSON.stringify(this.products)));
	}

	selectCanal(event) {
		const data =	JSON.parse(JSON.stringify(this.products));
		switch (event.value) {
			case 0:
				this.tab = this.getProduct(data);
				break;
			case 1:
				this.tab = this.getProduct(data.filter(f => f['salesmanType'].includes('Gros')));
				break;
			case 2:
				this.tab = this.getProduct(data.filter(f => !f['salesmanType'].includes('Gros')));
				break;

			default:
				break;
		}
	}

	getProduct(data) {
		const products = [];

		Object.keys(_.groupBy(data, 'id')).map(m => {
			const achievedCS = _.groupBy(data, 'id')[m].map(q => q['achievedCS']);
			const achievedEA = _.groupBy(data, 'id')[m].map(q => q['achievedEA']);
			const achievedHT = _.groupBy(data, 'id')[m].map(q => q['achievedHT']);
			const achievedTTC = _.groupBy(data, 'id')[m].map(q => q['achievedTTC']);

			const objectiveCS = _.groupBy(data, 'id')[m].map(q => q['objectiveCS']);
			const objectiveEA = _.groupBy(data, 'id')[m].map(q => q['objectiveEA']);
			const objectiveHT = _.groupBy(data, 'id')[m].map(q => q['objectiveHT']);
			const objectiveTTC = _.groupBy(data, 'id')[m].map(q => q['objectiveTTC']);

			const sumachievedCS = _.reduce(achievedCS, function(a, b) { return a + b; }, 0);
			const sumachievedEA = _.reduce(achievedEA, function(a, b) { return a + b; }, 0);
			const sumachievedHT = _.reduce(achievedHT, function(a, b) { return a + b; }, 0);
			const sumachievedTTC = _.reduce(achievedTTC, function(a, b) { return a + b; }, 0);

			const sumobjectiveCS = _.reduce(objectiveCS, function(a, b) { return a + b; }, 0);
			const sumobjectiveEA = _.reduce(objectiveEA, function(a, b) { return a + b; }, 0);
			const sumobjectiveHT = _.reduce(objectiveHT, function(a, b) { return a + b; }, 0);
			const sumobjectiveTTC = _.reduce(objectiveTTC, function(a, b) { return a + b; }, 0);

			products.push({
				id: _.groupBy(data, 'id')[m][0]['id'],
				name: _.groupBy(data, 'id')[m][0]['name'],
				achievedCS: sumachievedCS,
				achievedEA: sumachievedEA,
				achievedHT: sumachievedHT,
				achievedTTC: sumachievedTTC,
				objectiveCS: sumobjectiveCS,
				objectiveEA: sumobjectiveEA,
				objectiveHT: sumobjectiveHT,
				objectiveTTC: sumobjectiveTTC,
				progressionCS: sumobjectiveCS === 0 ? '-' : ((sumachievedCS * 100) / sumobjectiveCS).toFixed(2),
				gapCS: sumachievedCS - sumobjectiveCS,
				progressionNPS: sumobjectiveHT === 0 ? '-' : ((sumachievedHT * 100) / sumobjectiveHT).toFixed(2),
				gapNPS: sumachievedHT - sumobjectiveHT
			});
		});
		return products;
	}

	chooseBy(event) {
		if (event.value === 'CS') {
			this.displayed = [true, false];
		} else {
			this.displayed = [false, true];
		}
	}

}
