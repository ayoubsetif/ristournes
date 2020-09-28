import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { ExcelManipulationService } from '../app-services/excel-manipulation.service';
import { GetProductService } from '../app-services/get-product.service';
import * as XLSX from 'xlsx';
import * as _ from 'lodash';
import { ReplaySubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-achivement',
	templateUrl: './achivement.component.html',
	styleUrls: ['./achivement.component.scss']
})
export class AchivementComponent implements OnInit {
	file: File;
	config = {};
	category = [];
	realizationByCat = [];
	realizationByProd = [];
	data = [];
	displayTab = [ false, false, false, false, false, false ];
	displayAchByProd = new ReplaySubject<any>(1);
	monitorAchByProd = new ReplaySubject<any>(1);
	avgSKU = [];
	isAdmin = false;

	displayOptions = [
		{ id: 0, name: 'Réalisation par catégorie' },
		{ id: 1, name: 'réalisation par porduit' },
		{ id: 5, name: 'réalisation par vendeur' },
		{ id: 6, name: 'Suivi de réalisation par vendeur' },
		{ id: 2, name: 'Suivi de réalisation par porduit' },
		{ id: 3, name: 'Suivi de réalisation par categorie' },
		{ id: 4, name: 'Avg SKU' },
	];

	constructor(
		private snackBar: MatSnackBar,
		private excelService: ExcelManipulationService,
		private prodService: GetProductService,
		private route: ActivatedRoute
	) { }

	ngOnInit() {
		const conf = JSON.parse(localStorage.getItem('sapaConfig'));

		const g = _.groupBy(conf, 'Category');
		const category = [];
		Object.keys(g).map(m => {
			category.push({name: m, products: g[m].map(n => n['ID']) });
		});

		this.category = category;
		if (conf) { this.config = _.keyBy(conf, 'ID'); }

		if (this.route.snapshot.params.cred === 'admin') {
			this.isAdmin = true;
		}
	}

	uploadFile(event) {
		this.file = event.target.files[0];
		if (this.file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
			this.snackBar.open('Wrong File Type', 'Ok', { duration : 7000 });
		} else {
			const fileReader = new FileReader();
			fileReader.onload = (e) => {
				const worksheet = this.excelService.readFile(fileReader);
				const arr = XLSX.utils.sheet_to_json(worksheet, {raw: true });
				const data = [];
				_.drop(arr, 12).forEach(sale => {
					if (sale[''] !== '') {
						const q = this.getQuantity(sale['_6'], sale['__EMPTY_9'], sale['__EMPTY_10']);
						data.push({
							id: sale['_6'],
							name: sale['_7'],
							quantityEA: q,
							quantityCS: this.getQuantityCS(sale['_6'], q),
							vendor: sale['_9'],
							salesmanType: sale['_12'],
							transaction: sale['_4'],
							transactionType: sale['_3'],
							discount: sale['__EMPTY_6'],
							TTC: this.getTTCPrice(sale['_6'], q),
							HT: this.getHTPrice(sale['_6'], q)
						});
					}
				});
				// console.log('data', data);
				this.data = data;
			};
			fileReader.readAsArrayBuffer(this.file);
		}
	}

	displayAchievementByProd() {
		const data = JSON.parse(JSON.stringify(this.data));
		this.displayAchByProd.next(data);
		this.displayTab = [true, false, false, false, false, false, false];
	}

	displayAchievementByVendor(suivi: boolean) {
		const data = JSON.parse(JSON.stringify(this.data));
		this.displayAchByProd.next(data);
		if(suivi) {
			this.displayTab = [false, false, false, false, false, true, false];
		}
		else {
			this.displayTab = [false, false, false, false, false, false, true];
		}
	}

	displayAchievementByCat() {
		this.displayAchByProd.next(JSON.parse(JSON.stringify(this.data)));
		this.displayTab = [false, true, false, false, false, false, false];
	}

	concatArrays() {
		const data = JSON.parse(JSON.stringify(this.data));
		const objectives = JSON.parse(localStorage.getItem('objectives'));
		const ach = data.map(m => {
			return {
				id: m['id'],
				name: m['name'],
				achievedHT: m['HT'],
				achievedTTC: m['TTC'],
				achievedCS: m['quantityCS'],
				achievedEA: m['quantityEA'],
				objectiveHT: 0,
				objectiveTTC: 0,
				objectiveCS: 0,
				objectiveEA: 0,
				salesmanType: m['salesmanType']
			};
		});
		const obj = objectives.map(m => {
			return {
				id: m['id'],
				name: m['name'],
				objectiveHT: m['HT'],
				objectiveTTC: m['TTC'],
				objectiveCS: m['quantityCS'],
				objectiveEA: m['quantityEA'],
				achievedHT: 0,
				achievedTTC: 0,
				achievedCS: 0,
				achievedEA: 0,
				salesmanType: m['salesmanType']
			};
		});
		return _.concat(ach, obj);
	}

	displaySuivi() {
		const conc = this.concatArrays();
		this.monitorAchByProd.next(conc);
		this.displayTab = [false, false, true, false, false, false, false];
	}

	displaySuiviCategory() {
		const conc = this.concatArrays();
		this.monitorAchByProd.next(conc);
		this.displayTab = [false, false, false, true, false, false, false];
	}

	getProduct(data) {
		const products = [];

		Object.keys(_.groupBy(data, 'id')).map(m => {

			const aon = _.groupBy(data, 'id')[m].map(q => q['quantity']);
			const sum = _.reduce(aon, function(a, b) { return a + b; }, 0);

			products.push({
				id: _.groupBy(data, 'id')[m][0]['id'],
				name: _.groupBy(data, 'id')[m][0]['name'],
				quantityCS: sum,
				quantityEA: sum,
				TTC: this.getTTCPrice(_.groupBy(data, 'id')[m][0]['id'], sum),
				HT: this.getHTPrice(_.groupBy(data, 'id')[m][0]['id'], sum)
			});
		});
		return products;
	}

	getAVGSKU() {
		const data =	JSON.parse(JSON.stringify(this.data));
		const avgSku = [];
		const groupedByvendor = _.groupBy(data.filter(f => f['transactionType'] === 'Invoice'), 'vendor');
		Object.keys(groupedByvendor).map(m => {
			const invoice = _.uniq(groupedByvendor[m].map(k => k['transaction']));
			avgSku.push({
				name: m,
				salesmanType: groupedByvendor[m][0]['salesmanType'],
				invoice: invoice.length,
				totalSKU: groupedByvendor[m].length,
				avg: groupedByvendor[m].length / invoice.length
			});
		});
		console.log('avg', avgSku);
		this.avgSKU = avgSku;

		this.displayTab = [false, false, false, false, true, false, false];
	}

	getQuantity(id, quantity, uom) {
		if (!this.config[id]) {
			this.snackBar.open(`probleme avec le produit qui a ID :: ${id}`, 'Ok', { duration : 7000 });
		}
		// if (uom === 'EA' || uom === 'DS') {
		// 	return Number(quantity);
		// } else {
			if (uom === 'EA') {
			return Number(quantity);
		} else if (uom === 'DS') {
			switch (id) {
				case '12272044':
					return 12 * Number(quantity);
				break;

				case '12427772':
					return 6 * Number(quantity);
				break;

				case '12427710':
					return 18 * Number(quantity);
				break;

				case '12351335':
					return 120 * Number(quantity);
				break;
				default:
					return Number(quantity);
				break;
			}
		} else {
			return this.config[id].Colisage * quantity;
		}
	}

	getQuantityCS(id, quantity) {
		return quantity / this.config[id].Colisage;
	}

	getTTCPrice(id, sum) {
		const retail = this.config[id]['prix_vente_HT'] * ((this.config[id]['tva'] / 100) + 1) ;
		return ((retail + (retail * 1 / 100)) / this.config[id]['Colisage']) * sum;
	}

	getHTPrice(id, sum) {
		return (this.config[id]['prix_vente_HT'] / this.config[id]['Colisage']) * sum;
	}

	display(event) {
		switch (event.value) {
			case 0:
				this.displayAchievementByCat();
				break;
			case 1:
				this.displayAchievementByProd();
				break;
			case 2:
				this.displaySuivi();
				break;
			case 3:
				this.displaySuiviCategory();
				break;
			case 4:
				this.getAVGSKU();
				break;
			case 5:
				this.displayAchievementByVendor(true);
				break;
			case 6:
				this.displayAchievementByVendor(false);
				break;

			default:
				break;
		}
	}

}
