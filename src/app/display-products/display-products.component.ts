import { Component, OnInit, Input } from '@angular/core';

@Component({
	selector: 'display-products',
	templateUrl: './display-products.component.html',
	styleUrls: ['./display-products.component.scss']
})
export class DisplayProductsComponent implements OnInit {
	@Input() products: any[];
	displayedColumns: string[] = ['name', 'ttc', 'ht'];
	constructor() { }

	ngOnInit() {
	}

}
