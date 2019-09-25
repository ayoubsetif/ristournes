import { Component, OnInit, Input } from '@angular/core';

@Component({
	selector: 'realisation-prod',
	templateUrl: './realisation-prod.component.html',
	styleUrls: ['./realisation-prod.component.scss']
})
export class RealisationProdComponent implements OnInit {
	@Input() products: any[];
	displayedColumns: string[] = ['id', 'name', 'ttc', 'ht', 'quantity'];
	constructor() { }

	ngOnInit() {
	}

}
