import { Component, OnInit, Input } from '@angular/core';
import * as _ from 'lodash';

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

	constructor() { }

	ngOnInit() {
		this.tab = this.getCategory(this.getProduct(JSON.parse(JSON.stringify(this.products))));
	}

	getProduct(data) {
		const products = [];

		Object.keys(_.groupBy(data, 'id')).map(m => {
			const achievedCS = _.groupBy(data, 'id')[m].map(q => q['achievedCS']);
			const achievedHT = _.groupBy(data, 'id')[m].map(q => q['achievedHT']);
			const achievedTTC = _.groupBy(data, 'id')[m].map(q => q['achievedTTC']);

			const objectiveCS = _.groupBy(data, 'id')[m].map(q => q['objectiveCS']);
			const objectiveHT = _.groupBy(data, 'id')[m].map(q => q['objectiveHT']);
			const objectiveTTC = _.groupBy(data, 'id')[m].map(q => q['objectiveTTC']);

			const sumachievedCS = _.reduce(achievedCS, function(a, b) { return a + b; }, 0);
			const sumachievedHT = _.reduce(achievedHT, function(a, b) { return a + b; }, 0);
			const sumachievedTTC = _.reduce(achievedTTC, function(a, b) { return a + b; }, 0);

			const sumobjectiveCS = _.reduce(objectiveCS, function(a, b) { return a + b; }, 0);
			const sumobjectiveHT = _.reduce(objectiveHT, function(a, b) { return a + b; }, 0);
			const sumobjectiveTTC = _.reduce(objectiveTTC, function(a, b) { return a + b; }, 0);

			products.push({
				id: _.groupBy(data, 'id')[m][0]['id'],
				name: _.groupBy(data, 'id')[m][0]['name'],
				achievedCS: sumachievedCS,
				achievedHT: sumachievedHT,
				achievedTTC: sumachievedTTC,
				objectiveCS: sumobjectiveCS,
				objectiveHT: sumobjectiveHT,
				objectiveTTC: sumobjectiveTTC
			});
		});
		return products;
	}

	getCategory(value) {
		const realization = [];
		this.category.forEach(cat => {
			const r = {
				name: cat['name'], products: [], achievedHT: 0,
				achievedTTC: 0, achievedCS: 0, objectiveCS: 0,
				objectiveHT: 0, objectiveTTC: 0
			};
			cat['products'].forEach(pr => {
				const found = value.filter(f => f['id'] === pr);
				if (found && found.length) { r['products'].push(found[0]);	}
			});
			r['achievedHT'] = _.reduce(r['products'].map(m => m['achievedHT']), function(a, b) { return a + b; }, 0);
			r['achievedTTC'] = _.reduce(r['products'].map(m => m['achievedTTC']), function(a, b) { return a + b; }, 0);
			r['achievedCS'] = _.reduce(r['products'].map(m => m['achievedCS']), function(a, b) { return a + b; }, 0);

			r['objectiveCS'] = _.reduce(r['products'].map(m => m['objectiveCS']), function(a, b) { return a + b; }, 0);
			r['objectiveHT'] = _.reduce(r['products'].map(m => m['objectiveHT']), function(a, b) { return a + b; }, 0);
			r['objectiveTTC'] = _.reduce(r['products'].map(m => m['objectiveTTC']), function(a, b) { return a + b; }, 0);

			r['progressionCS'] = ((r['achievedCS'] * 100 ) / r['objectiveCS']);
			r['progressionNPS'] = ((r['achievedHT'] * 100) / r['objectiveHT']);
			r['gapCS'] = r['achievedCS'] - r['objectiveCS'];
			r['gapNPS'] = r['achievedHT'] - r['objectiveHT'];
			realization.push(r);
		});
		return realization;
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
