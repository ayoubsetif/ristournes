import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { ExcelManipulationService } from '../app-services/excel-manipulation.service';
import * as XLSX from 'xlsx';
import * as _ from 'lodash';

@Component({
  selector: 'trade-term',
  templateUrl: './trade-term.component.html',
  styleUrls: ['./trade-term.component.scss']
})
export class TradeTermComponent implements OnInit {
  file: File;
  config: any;
  promoConfig: any;
  data = [];
  missingPromo = [];

  constructor(private snackBar: MatSnackBar, private excelService: ExcelManipulationService ) { }

  ngOnInit() {
    const conf = JSON.parse(localStorage.getItem('sapaConfig'));
    const promoConf = JSON.parse(localStorage.getItem('promoConfig'));
  
    if (conf) { this.config = conf }
    if (promoConf) { this.promoConfig = _.keyBy(promoConf, 'ID'); }

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
				//console.log('arr', arr)
				_.drop(arr, 12).forEach(sale => {
					if (sale[''] !== '') {
            if(sale['__EMPTY_6'] !== '0.00%') {
              const discount = Number(sale['__EMPTY_6'].split('%')[0])
              data.push({
                id: sale['_6'],
                name: sale['_7'],
                vendor: sale['_9'],
                client: sale['_1'],
                discount: discount,
                price: Number(sale['__EMPTY_4'].split(',').join('')),
                tradeTermDiscount: this.getTradeTermDiscount(discount, sale['_6'])
              });
            }
          }
				});
        const t = data.filter(f => f['tradeTermDiscount'] !== 0);
        t.forEach(l => {
          l['HTPrice'] = this.getHTPrice(l['tradeTermDiscount'], l['price']);
          l['TTCPrice'] = this.getTTCPrice(l['tradeTermDiscount'], l['price'], l['id'])
        });
        this.data = t;
        this.missingPromo = data.filter(f => f['tradeTermDiscount'] === 10000);
        console.log('missingPromo', _.groupBy(this.missingPromo, 'id'))
			};
			fileReader.readAsArrayBuffer(this.file);
		}
  }


  getTradeTermDiscount(discount, id) {
  	const inferiorDiscount = [ 1 , 0.5 , 0.75 , 1.25 , 1.75];
    const found = inferiorDiscount.find(f => f === discount);
	  if(found) {
      return discount;
    } else {
      const prom = this.promoConfig[id];
      if(!prom) {
       return 10000;
      } else {
        if(discount < prom['Discount']) {
         console.log('less', id)
        }
        return discount - prom['Discount'];
      }
    }
  }

  getTTCPrice(discount, price, id) {
    const found = this.config.find(f => f['ID'] === id);
    if(found) {
      const p = (discount * price) / 100;
      const retail = p * ((found['tva'] / 100) + 1) ;
      return retail + (retail * 1 / 100);
    } else {
      console.log('not found', id)
    }
  }

  getHTPrice(discount, price) {
    return (discount * price) / 100;
  }

  download() {
	  const data = JSON.parse(JSON.stringify(this.data));
    const arr = [];
    arr.unshift(['ID', 'Name', 'Client','Vendor', 'Discount', 'tradeTermDiscount', 'HT', 'TTC'])
    data.forEach(l => {
      arr.push([l['id'], l['name'], l['client'], l['vendor'], l['discount'], l['tradeTermDiscount'], l['HTPrice'], l['TTCPrice']])
    })
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(arr);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  
    XLSX.writeFile(wb, `Trade Term.xlsx`);
    }

  

}
