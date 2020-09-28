import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { ExcelManipulationService } from '../app-services/excel-manipulation.service';
import * as XLSX from 'xlsx';
import * as _ from 'lodash';

@Component({
	selector: 'main',
	templateUrl: './main.component.html',
	styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
	file: File;
	arrayBuff: any;

	constructor(
		private snackBar: MatSnackBar,
		private excelService: ExcelManipulationService
	) { }

	ngOnInit() {}

	uploadConfigFile(event) {
		this.file = event.target.files[0];
		const fileReader = new FileReader();
		fileReader.onload = (e) => {
			const worksheet = this.excelService.readFile(fileReader);
			const secondws = this.readFile(fileReader, 1);
			const thirdws = this.readFile(fileReader, 2);

			const arr = XLSX.utils.sheet_to_json(worksheet, {raw: true });
			const secondarr = XLSX.utils.sheet_to_json(secondws, {raw: true });
			const thirdarr = XLSX.utils.sheet_to_json(thirdws, {raw: true });
			const t = _.groupBy(thirdarr, 'Vendors');

			arr.map(m => { m['ID'] = m['ID'].toString(); });
			localStorage.setItem('sapaConfig', JSON.stringify(arr));
			localStorage.setItem('promoConfig', JSON.stringify(secondarr));
			localStorage.setItem('vendorsObjectives', JSON.stringify(t));

			this.snackBar.open('Configuration saved', 'Ok', { duration : 7000 });
		};
		fileReader.readAsArrayBuffer(this.file);
	}

	readFile(fileReader, index) {
		this.arrayBuff = fileReader.result;
		const data = new Uint8Array(this.arrayBuff);
		const arr = new Array();
		for (let i = 0; i !== data.length; ++i) { arr[i] = String.fromCharCode(data[i]); }
		const bstr = arr.join('');
		const workbook = XLSX.read(bstr, {type: 'binary'});
		const first_sheet_name = workbook.SheetNames[index];
		return workbook.Sheets[first_sheet_name];
	}
}
