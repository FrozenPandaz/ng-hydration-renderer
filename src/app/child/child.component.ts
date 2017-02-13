import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'app-child',
	templateUrl: './child.component.html',
	styleUrls: ['./child.component.css']
})
export class ChildComponent implements OnInit {

	enough = false;

	constructor() { }

	ngOnInit() {
		this.enough = Math.random() * 5 > 1;
	}

}
