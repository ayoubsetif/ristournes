import { Component, OnInit } from '@angular/core';
import { ExcelManipulationService } from '../app-services/excel-manipulation.service';
import * as XLSX from 'xlsx';
import * as _ from 'lodash';
import { GetProductService } from '../app-services/get-product.service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  file: File;
  config: any;
  rconfig: any;
  category = [];
  data = [];
  achat = [];
  displayedColumns: string[] = ['id', 'name', 'quantity', 'TTC', 'HT'];
  totalSalesHT = 0;
  totalSalesTTC = 0;
  erpDjamel = [];


  constructor(
    private snackBar: MatSnackBar,
    private excelService: ExcelManipulationService,
		private prodService: GetProductService
  ) { }

  ngOnInit() {
    const conf = JSON.parse(localStorage.getItem('sapaConfig'));
    this.rconfig = conf;

    const g = _.groupBy(conf, 'Category');
		const category = [];
		Object.keys(g).map(m => {
			category.push({name: m, products: g[m].map(n => n['ID']) });
		});
		category.push({ name: 'nan3+guig3+Junior', products: [ '12397003', '12305319', '12282718', '12381799'] });
    this.category = category;

		if (conf) { this.config = _.keyBy(conf, 'ID'); }


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

  uploadSalesFile(event) {
		this.file = event.target.files[0];
		const fileReader = new FileReader();
		fileReader.onload = (e) => {
			const worksheet = this.excelService.readFile(fileReader);
			const arr = XLSX.utils.sheet_to_json(worksheet, {raw: true });
      const indexes = [];
		  arr.forEach(e => {
		  	this.rconfig.forEach(prod => {
			  	if (e['__EMPTY'].includes(prod['ID'])) {
            indexes.push({ id: prod['ID'], name: prod['Discription'], quantity: e['Total'] * -1 , priceHT: this.getHTPrice(prod['ID'], (e['Total'] * -1)), priceTTC: this.getTTCPrice(prod['ID'], (e['Total'] * -1)) }); }
		  	});
      });
      console.log('indec', indexes)

      const HTsum = _.reduce(indexes.map(q => q['priceHT']), function(a, b) { return a + b; }, 0);
      const TTCsum = _.reduce(indexes.map(q => q['priceTTC']), function(a, b) { return a + b; }, 0);
	  indexes.push({id: 'TOTAL', quantity: '', priceHT: HTsum, priceTTC: TTCsum  });
	  this.totalSalesHT = HTsum;
	  this.totalSalesTTC = TTCsum;

      // total achat ht et ttc
      
      this.achat = indexes;
		};
		fileReader.readAsArrayBuffer(this.file);
  }

  uploadERPFile(event) {
	this.file = event.target.files[0];
	const fileReader = new FileReader();
	fileReader.onload = (e) => {
		const worksheet = this.excelService.readFile(fileReader);
		const arr = XLSX.utils.sheet_to_json(worksheet, {raw: true });
 	const indexes = [];
	arr.forEach(e => {
		this.rconfig.forEach(prod => {
			if (e['__EMPTY'] && e['__EMPTY'].includes(prod['ID'])) {
				//indexes.push({ id: prod['ID'], name: prod['Discription'], quantity: e['Total'] , sum: prod['diff_prix_sapa'] * e['Total']  });
				indexes.push([ prod['ID'], prod['Discription'], e['Total'] , prod['diff_prix_sapa'] * e['Total']  ]);
			}
		});
	});
		const sum = _.reduce(indexes.map(q => q[3]), function(a, b) { return a + b; }, 0);
		indexes.push(['total', '', '', sum ])
		this.erpDjamel = indexes;
	};
	fileReader.readAsArrayBuffer(this.file); 
  }

  downloaderpDjamel() {
	const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(this.erpDjamel);
	const wb: XLSX.WorkBook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

	XLSX.writeFile(wb, `erp Djamel.xlsx`);
  }
  
  getTTCPrice(id, sum) {
    const found = this.rconfig.find(f => f['ID'] === id);
    if(found) {
      const retail = found['prix_achat_HT'] * ((found['tva'] / 100) + 1) ;
      return ((retail + (retail * 1 / 100)) / found['Colisage']) * sum;
    } else {
      console.log('not found', id)
    }
	}

	getHTPrice(id, sum) {
    const found = this.rconfig.find(f => f['ID'] === id);
    if(found) {
      return (found['prix_achat_HT'] / found['Colisage']) * sum;
    } else {
      console.log('not found', id)
    }
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
  
  getQuantity(id, quantity, uom) {
		if (!this.config[id]) {
			this.snackBar.open(`probleme avec le produit qui a ID :: ${id}`, 'Ok', { duration : 7000 });
		}
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
  
  downloadRistourne() {
		const result = [];
		const conc = this.concatArrays();
		const resultByCategory = this.prodService.getCategory(this.prodService.getProductsForSuivi(conc), this.category);

		const totalTTC = _.reduce(resultByCategory.filter(f => f['name'] !== 'IF')
			.map(m => m['achievedTTC']), function(a, b) { return a + b; }, 0);
		const totalHT = _.reduce(resultByCategory.filter(f => f['name'] !== 'IF')
			.map(m => m['achievedHT']), function(a, b) { return a + b; }, 0);
		const totalObjHT = _.reduce(resultByCategory.filter(f => f['name'] !== 'IF')
			.map(m => m['objectiveHT']), function(a, b) { return a + b; }, 0);

		result.unshift(['CATEGOERIE', 'Objectives', 'Realisation HT', 'Realisation TTC',
		'OUT', 'TAUX DE VISITE', 'COUVERTURE', 'TAUX DE SUCCES', 'FACTURE', 'PICTURE OF SUCCES', 'TAUX ACCEPTATION', 'TRADE TERMS', 'IN', 'TOTAL']);
		resultByCategory.forEach(ca => {
			if (ca['name'] !== 'IF') {
				const obj = [ca['name'], ca['objectiveHT'], ca['achievedHT'], ca['achievedTTC'], '', '', '', '', '', '', '', '', '', ''];
				if (ca['achievedHT'] >= ca['objectiveHT']) {
					obj[4] = ca['achievedTTC'] * 0.005;
				}
				result.push(obj);
			}
		});

		const totalOUT = _.reduce(_.compact(result.filter(f => !isNaN(f[4])).map(m => +m[4])), function(a, b) { return a + b; }, 0);

		const succesRate = totalTTC * 0.0025;
		const NbVisite = totalTTC * 0.0025;
		const couvrage = totalTTC * 0.0025;
		const picture = totalTTC * 0.0025;
		const invoice = 0;
		const tradeTerms = 0;
		const In = 0;
		const acceptation = 0;

		const total = totalOUT + NbVisite + couvrage + succesRate + invoice + tradeTerms + In + picture + acceptation;
		result.push(['TOTAL', totalObjHT, totalHT, totalTTC, totalOUT, NbVisite,
		couvrage, succesRate, invoice, picture, acceptation, tradeTerms , In, total ]);
		result.push(['', '', '', '', '', '',
		'', '', '', '', '', '' , this.totalSalesHT, '' ]);

		const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(result);
		const wb: XLSX.WorkBook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

		XLSX.writeFile(wb, `Ristourne.xlsx`);
	}

}
