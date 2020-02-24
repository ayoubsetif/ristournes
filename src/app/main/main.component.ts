import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { ExcelManipulationService } from '../app-services/excel-manipulation.service';
import * as XLSX from 'xlsx';

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
			const secondws = this.readFile(fileReader)
			const arr = XLSX.utils.sheet_to_json(worksheet, {raw: true });
			const secondarr = XLSX.utils.sheet_to_json(secondws, {raw: true });

			arr.map(m => { m['ID'] = m['ID'].toString(); });
			localStorage.setItem('sapaConfig', JSON.stringify(arr));
			localStorage.setItem('promoConfig', JSON.stringify(secondarr));

			this.snackBar.open('Configuration saved', 'Ok', { duration : 7000 });
		};
		fileReader.readAsArrayBuffer(this.file);
	}

	readFile(fileReader) {
		this.arrayBuff = fileReader.result;
		const data = new Uint8Array(this.arrayBuff);
		const arr = new Array();
		for (let i = 0; i !== data.length; ++i) { arr[i] = String.fromCharCode(data[i]); }
		const bstr = arr.join('');
		const workbook = XLSX.read(bstr, {type: 'binary'});
		const first_sheet_name = workbook.SheetNames[1];
		return workbook.Sheets[first_sheet_name];
	}
}
