import { ElementRef, Component, Inject, OnInit, ViewChild } from '@angular/core';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
	title = 'app works on';

	toggle = true;

	constructor(@Inject('isNode') public isNode: boolean) {}

	toggleElement() {
		this.toggle = !this.toggle;
	}

	ngOnInit() {
		this.title += this.isNode ? ' node!' : ' browser!';
	}

}
