import { Injectable } from '@angular/core';
import * as _ from 'lodash';

@Injectable({
	providedIn: 'root'
})
export class GetProductService {

	getProduct(data) {
		const products = [];

		Object.keys(_.groupBy(data, 'id')).map(m => {
			const dis = [];
			const totalCS = _.groupBy(data, 'id')[m].map(q => q['quantityCS']);
			const totalEA = _.groupBy(data, 'id')[m].map(q => q['quantityEA']);
			const totalCAHT = _.groupBy(data, 'id')[m].map(q => q['HT']);
			const totalCATTC = _.groupBy(data, 'id')[m].map(q => q['TTC']);

			const sumCS = _.reduce(totalCS, function(a, b) { return a + b; }, 0);
			const sumEA = _.reduce(totalEA, function(a, b) { return a + b; }, 0);
			const sumCAHT = _.reduce(totalCAHT, function(a, b) { return a + b; }, 0);
			const sumCATTC = _.reduce(totalCATTC, function(a, b) { return a + b; }, 0);

			const discount = _.groupBy(_.groupBy(data, 'id')[m], 'discount');
			
			Object.keys(discount).map(k => {
				const totcs =  _.reduce(discount[k].map(r => r['quantityCS']), function(a, b) { return a + b; }, 0);
				const totea =  _.reduce(discount[k].map(r => r['quantityEA']), function(a, b) { return a + b; }, 0);
				dis.push({ discount: k, totalcs: totcs, totalea: totea })
			})
			products.push({
				id: _.groupBy(data, 'id')[m][0]['id'],
				name: _.groupBy(data, 'id')[m][0]['name'],
				quantityCS: sumCS,
				quantityEA: sumEA,
				TTC: sumCATTC,
				HT: sumCAHT,
				discount: dis
			});
		});
		return products;
	}

	getProductsForSuivi(data) {
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

	getCategory(value, category) {
		const realization = [];
		category.forEach(cat => {
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


}
