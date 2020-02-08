import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import * as _ from 'lodash';

@Component({
  selector: 'app-discount-details',
  templateUrl: './discount-details.component.html',
  styleUrls: ['./discount-details.component.scss']
})
export class DiscountDetailsComponent implements OnInit {
  displayedColumns: string[] = ['discount', 'quantityCS', 'quantityEA'];
  discount = [];
  discountDetail = [];
  inferiorDiscount = ['0.00%', '1.00%' , '0.50%' , '0.75%' , '1.25%' , '1.75%'];
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.discount = this.data.discount;
    const promo = [];
    const notPromo = [];
    this.data.discount.forEach(d => {
      const f = this.inferiorDiscount.find(ff => ff === d.discount);
      if(f) { notPromo.push(d) }
      else { promo.push(d) }
    })
    const totalCSPromo = _.reduce(promo.map(q => q['totalcs']), function(a, b) { return a + b; }, 0);
    const totalEaPromo = _.reduce(promo.map(q => q['totalea']), function(a, b) { return a + b; }, 0);
    
    const totalCSnotPromo = _.reduce(notPromo.map(q => q['totalcs']), function(a, b) { return a + b; }, 0);
    const totalEanotPromo = _.reduce(notPromo.map(q => q['totalea']), function(a, b) { return a + b; }, 0);

    const prom = { discount: 'PROMO', totalcs: totalCSPromo, totalea: totalEaPromo };
    const notprom = { discount: 'NOT PROMO', totalcs: totalCSnotPromo, totalea: totalEanotPromo };
    const obj = { discount: 'TOTAL', totalcs: this.data.quantityCS , totalea: this.data.quantityEA }
    this.discount.push(obj);
    this.discountDetail.push(prom, notprom, obj);
  }

}
