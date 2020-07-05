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
	displayedColumns: string[] = ['id', 'name', 'type', 'bdd', 'visitedPlan', 'visitedExtra', 'HitRateVisited', 'HitRateExtra', 'Itenerary', 'VisiteRate', 'SuccessRate'];

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
        console.log('arr', _.drop(arr, 9))
				const data = [];
        _.drop(arr, 9).forEach(v => {
          if (v['B/A'] !== '') {
            console.log('v', v)
            data.push({
              id: v['__EMPTY_1'],
              name: v['__EMPTY_2'],
              type: v['__EMPTY_6'],
              bdd: v['__EMPTY_7'],
              visitedExtra: v['__EMPTY_10'],
              visitedPlan: v['__EMPTY_11'],
              Itenerary: v['__EMPTY_9'],
              HitRateVisited: v['__EMPTY_12'],
              HitRateExtra: v['__EMPTY_13'],
              SuccessRate: Math.round(((v['__EMPTY_12'] + v['__EMPTY_13'] ) / v['__EMPTY_9']) * 100),
              VisiteRate: Math.round(((v['__EMPTY_10'] + v['__EMPTY_11']) / v['__EMPTY_9']) * 100)
            })
          };
        });
      console.log('data', data)
      this.data = data;
			};
			fileReader.readAsArrayBuffer(this.file);
		}
	}

}
