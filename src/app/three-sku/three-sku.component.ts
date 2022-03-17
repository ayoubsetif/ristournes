import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import * as XLSX from 'xlsx';
import { ExcelManipulationService } from '../app-services/excel-manipulation.service';
import * as _ from 'lodash';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-three-sku',
  templateUrl: './three-sku.component.html',
  styleUrls: ['./three-sku.component.scss']
})
export class ThreeSKUComponent implements OnInit {
  file: File;
  config = {};
  data = [];
  clientDB = [];
  customers = [];
  customersThree = [];
  intersectionOne = [];
  diffrenceOne = [];
  diffrenceThree = [];
  intersectionThree = [];

  constructor(
    private snackBar: MatSnackBar,
    private excelService: ExcelManipulationService,
	iconRegistry: MatIconRegistry,
	sanitizer: DomSanitizer
  ) {
	iconRegistry.addSvgIcon('save',	sanitizer.bypassSecurityTrustResourceUrl('assets/save-24px.svg'))
  }

  ngOnInit() {
    const conf = JSON.parse(localStorage.getItem('sapaConfig'));
	if (conf) { this.config = _.keyBy(conf, 'ID'); }
  }

  uploadCustomerListing(event) {
	this.file = event.target.files[0];
	if (this.file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
		this.snackBar.open('Wrong File Type', 'Ok', { duration : 7000 });
	} else {
		const fileReader = new FileReader();
		fileReader.onload = (e) => {
			const worksheet = this.excelService.readFile(fileReader);
			const arr = XLSX.utils.sheet_to_json(worksheet, {raw: true });
			const dbClient = [];
			_.drop(arr, 6).filter(f => f['Customer Listing']).forEach(c => {
	  			dbClient.push({ vendor: c['__EMPTY_3'], customerID: c['__EMPTY'], customerName: c['__EMPTY_1'] }) });
			this.clientDB = dbClient;
	
			// console.log('dbClient', dbClient);
			// this.DBClients = dbClient;
			// localStorage.setItem('clients', JSON.stringify(dbClient));
		};
		fileReader.readAsArrayBuffer(this.file);
	}
}

  uploadFileNew(event) {
	this.file = event.target.files[0];
	if (this.file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
		this.snackBar.open('Wrong File Type', 'Ok', { duration : 7000 });
	} else {
		const fileReader = new FileReader();
		fileReader.onload = (e) => {
			const worksheet = this.excelService.readFile(fileReader);
			const arr = XLSX.utils.sheet_to_json(worksheet, {raw: true });
			const data = [];      
			_.drop(arr, 10).filter(f => f['Document Listing ']).forEach(sale => {
				data.push({
					id: sale['__EMPTY_5'],
					name: sale['__EMPTY_6'],
					vendor: sale['__EMPTY_8'],
					salesmanType: sale['__EMPTY_10'],
					transaction: sale['__EMPTY_3'],
					transactionType: sale['__EMPTY_2'],
					customerName: sale['__EMPTY_1'],
        			customerID: sale['__EMPTY']
				});
			});
			// this.data = data;
        	const customers = _.uniqBy(data.map(m => ({ customerName: m['customerName'], customerID: m['customerID'], vendor: m['vendor'] })), 'customerID');
        	this.customers = customers
			//this.activatedCLients = customers.length;
			console.log('b', customers);
			//console.log('Nombre des clients', this.clientDB);
			//console.log('Nombre dactivation au moins une facture', customers.length);
			this.intersectionOne = _.intersectionBy(this.clientDB, customers , 'customerID');
			this.diffrenceOne = _.differenceBy(this.clientDB, customers , 'customerID');

			//console.log('inters', this.intersectionOne)
			//console.log('diff', this.diffrenceOne)

        
        	const OnlyInvoiceSku = [];
        	const realCalcSku = [];
			const allSkus = [];
        	// console.log('data', data);

        	const groupedByCustomer = _.groupBy(data, 'customerID');
	    	Object.keys(groupedByCustomer).map(m => {
				const invoice = groupedByCustomer[m].filter(k => k['transactionType'] === 'Invoice');
        		const credit = groupedByCustomer[m].filter(k => k['transactionType'] === 'Credit Note');
        
				const Uniqinvoice = _.uniq(invoice.map(k => k['transaction'])).length;
				const Uniqcredit = _.uniq(credit.map(k => k['transaction'])).length;

        		//console.log('invoice', invoice);
        		//console.log('credit', credit);

				//console.log('invoiceN', Uniqinvoice);
        		//console.log('creditN', Uniqcredit);

				// first Option Only Invoice
				OnlyInvoiceSku.push({
					customerID: m,
					customer: groupedByCustomer[m][0]['customerName'],
					invoice: invoice.length,
					totalSKU: Uniqinvoice,
					avg: invoice.length / Uniqinvoice
				});
				// second option real calc
				realCalcSku.push({
					customerID: m,
					customer: groupedByCustomer[m][0]['customerName'],
					invoice: invoice.length - credit.length,
					totalSKU: Uniqinvoice - Uniqcredit,
					avg: (invoice.length - credit.length) / (Uniqinvoice - Uniqcredit)
				});
				// all skus 
				allSkus.push({
					customerID: m,
					customer: groupedByCustomer[m][0]['customerName'],
					invoice: invoice.length + credit.length,
					totalSKU: Uniqinvoice + Uniqcredit,
					avg: (invoice.length + credit.length) / (Uniqinvoice + Uniqcredit)
				});
			});

			//console.log('OnlyInvoiceSku', OnlyInvoiceSku);
			//console.log('realCalcSku', realCalcSku);
			//console.log('allSkus', allSkus);
			this.customersThree = realCalcSku.filter(f => f.avg >= 3);
			console.log('customersThree', this.customersThree);
			//console.log('OnlyInvoiceSku plud 3 factures', OnlyInvoiceSku.filter(f => f.avg >= 3).length);
			console.log('realCalcSku plud 3 factures', realCalcSku.filter(f => f.avg >= 3).length);
			//console.log('allSkus plud 3 factures', allSkus.filter(f => f.avg >= 3).length);
			this.intersectionThree = _.intersectionBy(this.clientDB, realCalcSku.filter(f => f.avg >= 3) , 'customerID');
			this.diffrenceThree = _.differenceBy(this.clientDB, realCalcSku.filter(f => f.avg >= 3) , 'customerID');

			//this.avgSKU = avgSku;
		};
			fileReader.readAsArrayBuffer(this.file);
		}
	}

	downloadClients() {
		const clients = [];
		this.clientDB.forEach(client => { clients.push([client['customerID'], client['customerName'], client['vendor']]) })
		const w: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(clients);
		const b: XLSX.WorkBook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(b, w, 'clients');
		XLSX.writeFile(b, `les clients.xlsx`);
	}

	downloadActivatedClients() {
		const clients = [];
		this.intersectionOne.forEach(client => { clients.push([client['customerID'], client['customerName'], client['vendor']]) })
		const w: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(clients);
		const b: XLSX.WorkBook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(b, w, 'clients');
		XLSX.writeFile(b, `les clients activés.xlsx`);
	}

	downloadNotActivatedsClients() {
		const clients = [];
		this.diffrenceOne.forEach(client => { clients.push([client['customerID'], client['customerName'], client['vendor']]) })
		const w: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(clients);
		const b: XLSX.WorkBook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(b, w, 'clients');
		XLSX.writeFile(b, `les clients non activés.xlsx`);
	}

	downloadActivatedClientsThreeSKU() {
		const clients = [];
		this.intersectionThree.forEach(client => { clients.push([client['customerID'], client['customerName'], client['vendor']]) })
		const w: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(clients);
		const b: XLSX.WorkBook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(b, w, 'clients');
		XLSX.writeFile(b, `les clients activés.xlsx`);
	}

	downloadNotActivatedsClients3SKU() {
		const clients = [];
		this.diffrenceThree.forEach(client => { clients.push([client['customerID'], client['customerName'], client['vendor']]) })
		const w: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(clients);
		const b: XLSX.WorkBook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(b, w, 'clients');
		XLSX.writeFile(b, `les clients non activés.xlsx`);
	}
}
