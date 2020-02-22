import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DiscountDetailsComponent } from '../discount-details/discount-details.component';
import { GetProductService } from '../app-services/get-product.service';
import * as _ from 'lodash';

@Component({
  selector: 'display-by-vendor',
  templateUrl: './display-by-vendor.component.html',
  styleUrls: ['./display-by-vendor.component.scss']
})
export class DisplayByVendorComponent implements OnInit {
  @Input() products: any[];
	displayedColumns: string[] = ['id', 'name', 'TTC', 'HT', 'quantityCS', 'quantityEA', 'details'];
  vendors = [];
  tab = [];
  constructor(private dialog: MatDialog, private getProductService: GetProductService) { }

  ngOnInit() {
    this.vendors = _.uniq(this.products.map(m => m['vendor']));
		this.tab =	this.getProductService.getProduct(JSON.parse(JSON.stringify(this.products)));
  }

  selectVendor(event) {
    const data =	JSON.parse(JSON.stringify(this.products));
    const t = data.filter(f => f['vendor'] === event.value);
    this.tab = this.getProductService.getProduct(t);
	}

  openDialog(data): void {
		const dialogRef = this.dialog.open(DiscountDetailsComponent, {
			width: '70%',
			data: data,
			panelClass: 'myapp-height-dialog'
		});
	}

}
