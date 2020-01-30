import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-discount-details',
  templateUrl: './discount-details.component.html',
  styleUrls: ['./discount-details.component.scss']
})
export class DiscountDetailsComponent implements OnInit {
  displayedColumns: string[] = ['discount', 'quantityCS', 'quantityEA'];
  discount = [];
	constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.discount = this.data.discount;
    this.discount.push({ discount: 'TOTAL', totalcs: this.data.quantityCS , totalea: this.data.quantityEA })
  }

}
