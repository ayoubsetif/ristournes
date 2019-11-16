import { Injectable } from '@angular/core';
import * as _ from 'lodash';

@Injectable({
	providedIn: 'root'
})
export class GetProductService {

	getProduct(data) {
		const products = [];

		Object.keys(_.groupBy(data, 'id')).map(m => {
			const totalCS = _.groupBy(data, 'id')[m].map(q => q['quantityCS']);
			const totalEA = _.groupBy(data, 'id')[m].map(q => q['quantityEA']);
			const totalCAHT = _.groupBy(data, 'id')[m].map(q => q['HT']);
			const totalCATTC = _.groupBy(data, 'id')[m].map(q => q['TTC']);

			const sumCS = _.reduce(totalCS, function(a, b) { return a + b; }, 0);
			const sumEA = _.reduce(totalEA, function(a, b) { return a + b; }, 0);
			const sumCAHT = _.reduce(totalCAHT, function(a, b) { return a + b; }, 0);
			const sumCATTC = _.reduce(totalCATTC, function(a, b) { return a + b; }, 0);

			products.push({
				id: _.groupBy(data, 'id')[m][0]['id'],
				name: _.groupBy(data, 'id')[m][0]['name'],
				quantityCS: sumCS,
				quantityEA: sumEA,
				TTC: sumCATTC,
				HT: sumCAHT
			});
		});
		return products;
	}


}
