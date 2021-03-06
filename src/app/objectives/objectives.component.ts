import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import * as XLSX from 'xlsx';
import * as _ from 'lodash';
import { ReplaySubject } from 'rxjs';

@Component({
	selector: 'objectives',
	templateUrl: './objectives.component.html',
	styleUrls: ['./objectives.component.scss']
})
export class ObjectivesComponent implements OnInit {
	file: File;
	arrayBuffer: any;
	warehouseList = [];
	data = [];
	config = [];
	rejectedProducts = [];
	objectives = [];
	objectivesSubj = new ReplaySubject<any>(1);
	selectedWarehouse = null;
	category = [];
	tab = [ false, false ];

	displayOptions = [
		{id: 0, name: 'Objectives par produits' },
		{id: 1, name: 'Objectives par catgorie'},
		{id: 2, name: 'produits rejetés '}
	];

	constructor(private snackBar: MatSnackBar) { }

	ngOnInit() {
		const conf = JSON.parse(localStorage.getItem('sapaConfig'));
		this.config = _.groupBy(conf, 'Description Nestle');

		const g = _.groupBy(conf, 'Category');
		const category = [];
		Object.keys(g).map(m => {
			category.push({name: m, products: g[m].map(n => n['ID']) });
		});
		this.category = category;
	}

	uploadObjectiveFile(event) {
		this.file = event.target.files[0];
		const fileReader = new FileReader();
		fileReader.onload = (e) => {
			const worksheet = this.readFile(fileReader);
			const arr = XLSX.utils.sheet_to_json(worksheet, {raw: true });
			this.warehouseList = _.uniq(arr.map(f => f['Nom Distributeurs']));
			this.data = arr;
		};
		fileReader.readAsArrayBuffer(this.file);
	}

	readFile(fileReader) {
		this.arrayBuffer = fileReader.result;
		const data = new Uint8Array(this.arrayBuffer);
		const arr = new Array();
		for (let i = 0; i !== data.length; ++i) { arr[i] = String.fromCharCode(data[i]); }
		const bstr = arr.join('');
		const workbook = XLSX.read(bstr, {type: 'binary'});
		const first_sheet_name = workbook.SheetNames[1];
		return workbook.Sheets[first_sheet_name];
	}

	selectWarehouse(event) {
		this.selectedWarehouse = event.value;
		const objectives = [];
		this.data.filter(f => f['Nom Distributeurs'] === event.value).forEach(obj => {
			objectives.push({
				salesmanType: this.getSalesmanType(obj['Canal'])  ,
				category: obj['Categories'],
				name: this.getProduct(obj['SKU']).name,
				id: this.getProduct(obj['SKU']).id,
				SubCategory: obj['Sous categories'],
				quantityCS: obj['Cs'],
				quantityEA: 0,
				// initialy i met quantityEA & TTC to 0 to minimise test
				HT: obj['NPS'],
				TTC: 0
			});
		});

		this.rejectedProducts =	objectives.filter(f => f['id'] === null);
		this.objectives =	objectives.filter(f => f['id'] !== null);
		this.objectives.forEach(ob => {
			ob['quantityEA'] = this.getQuantityEA(ob['id'], ob['quantityCS']);
			ob['TTC'] = this.getCATTC(ob['id'], ob['HT'] );
		});
	}

	getSalesmanType(value) {
		if(value === 'GROS') {
			return 'Gros'
		} else {
			return 'Detail'
		}
	}

	getProduct(value) {
		if (this.config[value]) {
			return {
				name: this.config[value][0].Discription,
				id: this.config[value][0].ID
			};
		} else {
			return {
				name: value,
				id: null
			};
		}
	}

	getQuantityEA(id, quantity) {
		const conf = _.keyBy(JSON.parse(localStorage.getItem('sapaConfig')), 'ID');
		return conf[id].Colisage * quantity;
	}

	getCATTC(id, CAHT) {
		const conf = _.keyBy(JSON.parse(localStorage.getItem('sapaConfig')), 'ID');
		const retail = CAHT * ((conf[id]['tva'] / 100) + 1) ;
		return (retail + (retail * 1 / 100));
	}

	showObjectives(event) {
		switch (event.value) {
			case 0:
				this.objectivesSubj.next({
					type: 'accepted',
					products: this.objectives
				});
				this.tab = [true, false];

				break;
			case 2:
				this.objectivesSubj.next({
					type: 'rejected',
					products: this.rejectedProducts
				});
				this.tab = [true, false];

				break;
			case 1:
				this.objectivesSubj.next({
					type: 'category',
					products: this.objectives
				});
				this.tab = [false, true];
				break;

			default:
				this.objectivesSubj.next({
					type: 'accepted',
					products: this.objectives
				});
				break;
		}
	}

	saveObjectives() {
		localStorage.setItem('objectives', JSON.stringify(this.objectives));
		this.snackBar.open('Objectives saved successfully', 'Ok', { duration : 7000 });
	}

}
