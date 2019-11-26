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
			const arr = XLSX.utils.sheet_to_json(worksheet, {raw: true });
			arr.map(m => { m['ID'] = m['ID'].toString(); });
			localStorage.setItem('sapaConfig', JSON.stringify(arr));
			this.snackBar.open('Configuration saved', 'Ok', { duration : 7000 });
		};
		fileReader.readAsArrayBuffer(this.file);
	}
}
