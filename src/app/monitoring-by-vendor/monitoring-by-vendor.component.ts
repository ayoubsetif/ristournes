import { Component, OnInit, Input } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'monitoring-by-vendor',
  templateUrl: './monitoring-by-vendor.component.html',
  styleUrls: ['./monitoring-by-vendor.component.scss']
})
export class MonitoringByVendorComponent implements OnInit {
  @Input() products: any[];
  vendors = [];
  tab = [];
  catTab = [];
  config = {};
  displayed: string[] = ['id', 'name', 'objectivesHT', 'achievedHT', 'objectivesTTC', 'achievedTTC', 'Progression', 'GAP'];
  displayBy = [ true , false ];
  categories = [];
  displayedByVendor = [];

  constructor() { }

  ngOnInit() {
    const conff = JSON.parse(localStorage.getItem('sapaConfig'));
    this.config = _.keyBy(conff, 'ID');
	this.vendors = _.uniq(this.products.map(m => m['vendor']));
	this.categories = JSON.parse(localStorage.getItem('SuiviDisplay')).map(m => m['name']);

	const displayedByVendor = [];
	const conf = JSON.parse(localStorage.getItem('SuiviDisplay'));
	const obj = JSON.parse(localStorage.getItem('vendorsObjectives'));
    const data = JSON.parse(JSON.stringify(this.products));
	this.vendors.forEach(v => {
		const vendor = {name: v, categories: []};
		const t = data.filter(f => f['vendor'] === v);
		const objectives = obj[v];
		objectives.forEach(e => {
			const q = this.getQuantity(e['code'], e['quantity'])
			e['quantityEA'] = q;
			e['OBJTTC'] = this.getTTCPrice(e['code'], q);
			e['OBJHTC'] = this.getHTPrice(e['code'], q);
		});
		const e = this.getProduct(this.concatArrays(objectives, t));
		const f = this.getCategory(e, conf);
		vendor.categories = f;
		displayedByVendor.push(vendor);
		this.displayedByVendor = displayedByVendor;
	});
	console.log('fffff', displayedByVendor);
  }

	selectVendor(event) {
    	const conf = JSON.parse(localStorage.getItem('vendorsObjectives'));
    	const data = JSON.parse(JSON.stringify(this.products));
    	const t = data.filter(f => f['vendor'] === event.value);
		const objectives = conf[event.value];
    	objectives.forEach(e => {
      		const q = this.getQuantity(e['code'], e['quantity'])
      		e['quantityEA'] = q;
      		e['OBJTTC'] = this.getTTCPrice(e['code'], q);
      		e['OBJHTC'] = this.getHTPrice(e['code'], q);
    	});
    	this.tab = this.getProduct(this.concatArrays(objectives, t));
	  }
	  
	  selectCategory(event) {
		const d = [];
		this.displayedByVendor.forEach(v => {
			const vendor = { name: v['name'], categories: {} };
			vendor['categories'] = v['categories'].filter(f => f['name'] === event.value)[0];
			d.push(vendor);
		})
		console.log('ff', d);
		this.tab = d;
  	}
  
	getQuantity(id, quantity) {
		return this.config[id].Colisage * quantity;
	}
  
	getTTCPrice(id, sum) {
		const retail = this.config[id]['prix_vente_HT'] * ((this.config[id]['tva'] / 100) + 1) ;
		return ((retail + (retail * 1 / 100)) / this.config[id]['Colisage']) * sum;
	}

	getHTPrice(id, sum) {
		return (this.config[id]['prix_vente_HT'] / this.config[id]['Colisage']) * sum;
	}

	chooseBy(event) {
		if (event.value === 'CAT') {
			this.displayBy = [true, false];
		} else {
			this.displayBy = [false, true];
		}
	}
  
  concatArrays(objectives, data) {

		const ach = data.map(m => {
			return {
				id: +m['id'],
				name: m['name'],
				achievedHT: m['HT'],
				achievedTTC: m['TTC'],
				achievedCS: m['quantityCS'],
				achievedEA: m['quantityEA'],
				objectiveHT: 0,
				objectiveTTC: 0,
				objectiveCS: 0,
				objectiveEA: 0,
			};
		});
		const obj = objectives.map(m => {
			return {
				id: m['code'],
				name: m['description'],
				objectiveHT: m['OBJHTC'],
				objectiveTTC: m['OBJTTC'],
				objectiveCS: m['quantity'],
				objectiveEA: m['quantityEA'],
				achievedHT: 0,
				achievedTTC: 0,
				achievedCS: 0,
				achievedEA: 0,
			};
		});
		return _.concat(ach, obj);
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

	getCategory(value, category) {
		const realization = [];
		category.forEach(cat => {
			const r = {
				name: cat['name'], products: [], achievedHT: 0,
				achievedTTC: 0, achievedCS: 0, objectiveCS: 0,
				objectiveHT: 0, objectiveTTC: 0
			};
			cat['products'].forEach(pr => {
				const found = value.filter(f => f['id'] === +pr);
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
