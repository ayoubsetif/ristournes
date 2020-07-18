import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { ExcelManipulationService } from '../app-services/excel-manipulation.service';
import * as XLSX from 'xlsx';
import * as _ from 'lodash';

@Component({
  selector: 'app-salesman-performance',
  templateUrl: './salesman-performance.component.html',
  styleUrls: ['./salesman-performance.component.scss']
})
export class SalesmanPerformanceComponent implements OnInit {
  file: File;
  data = [];
  allData = [];
	displayedColumns: string[] = ['id', 'name', 'type', 'bdd', 'activeCoverage', 'visitedPlan', 'visitedExtra', 'HitRateVisited', 'HitRateExtra', 'Itenerary', 'VisiteRate', 'SuccessRate', 'CoverageRate' ];
	displayedAllColumns: string[] = ['type', 'bdd', 'activeCoverage', 'visitedPlan', 'visitedExtra', 'HitRateVisited', 'HitRateExtra', 'Itenerary', 'VisiteRate', 'SuccessRate', 'CoverageRate' ];

  constructor(
    private snackBar: MatSnackBar,
		private excelService: ExcelManipulationService,
	) { }

  ngOnInit() {
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
        _.drop(arr, 9).forEach(v => {
          if (v['B/A'] !== '') {
            data.push({
              id: v['_1'],
              name: v['_2'],
              type: v['_6'],
              bdd: v['_7'],
              visitedExtra: v['_10'],
              visitedPlan: v['_11'],
              Itenerary: v['_9'],
              HitRateVisited: v['_12'],
              HitRateExtra: v['_13'],
              activeCoverage: 0,
              CoverageRate: 0,  
              SuccessRate: Math.round(((v['_12'] + v['_13'] ) / v['_9']) * 100),
              VisiteRate: Math.round(((v['_10'] + v['_11']) / v['_9']) * 100)
            })
          };
        });
      console.log('salesman', data);

      this.data = data;
			};
			fileReader.readAsArrayBuffer(this.file);
		}
  }
  
  uploadSalesFile(event) {
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
						data.push({
              id: sale['_9'].split('-')[0] ,
              name: sale['_9'].split('-')[1],
              client: sale['_1'],
              codeClient: sale[""],
							vendor: sale['_9'],
							salesmanType: sale['_12'],
							transaction: sale['_4'],
						});
					}
        });
        const sales = [];
        Object.keys(_.groupBy(data, 'id')).map(m => {
          sales.push({ id: m , activeCoverage: _.uniqBy(_.groupBy(data, 'id')[m], 'codeClient').length })
        });
        console.log('documentListing', sales);
        this.data.forEach(d => {
          const f = sales.find(ff => ff.id === d.id);
          if(f) {
            d.activeCoverage = f.activeCoverage;
            d.CoverageRate = Math.round((f.activeCoverage / d.bdd) * 100)
          }
        });
        const detail = this.getData(this.data.filter(f => f.type !== 'Vendeur Gros'), 'detail');
        const gros = this.getData(this.data.filter(f => f.type === 'Vendeur Gros'), 'gros');
        const global = this.getData(this.data, 'global');
        this.allData.push(detail, gros, global);
			};
			fileReader.readAsArrayBuffer(this.file);
		}
  }

  getData(data, type) {
    const bdd = _.reduce(data.map(q => q['bdd']), function(a, b) { return a + b; }, 0);
    const visitedExtra =_.reduce(data.map(q => q['visitedExtra']), function(a, b) { return a + b; }, 0);
		const visitedPlan = _.reduce(data.map(q => q['visitedPlan']), function(a, b) { return a + b; }, 0);
		const Itenerary = _.reduce(data.map(q => q['Itenerary']), function(a, b) { return a + b; }, 0);
		const HitRateVisited = _.reduce(data.map(q => q['HitRateVisited']), function(a, b) { return a + b; }, 0);
		const HitRateExtra = _.reduce(data.map(q => q['HitRateExtra']), function(a, b) { return a + b; }, 0);
    const activeCoverage = _.reduce(data.map(q => q['activeCoverage']), function(a, b) { return a + b; }, 0);
    const SuccessRate = Math.round(((HitRateVisited + HitRateExtra ) / Itenerary) * 100);
    const VisiteRate = Math.round(((visitedExtra + visitedPlan ) / Itenerary) * 100);
    const CoverageRate = Math.round((activeCoverage  / bdd) * 100);
    return ({
      type: type,
      bdd: bdd,
      visitedExtra: visitedExtra,
      visitedPlan: visitedPlan,
      Itenerary: Itenerary,
      HitRateVisited: HitRateVisited,
      HitRateExtra: HitRateExtra,
      activeCoverage: activeCoverage,
      CoverageRate: CoverageRate,  
      SuccessRate: SuccessRate,
      VisiteRate: VisiteRate
     })
  }
}
