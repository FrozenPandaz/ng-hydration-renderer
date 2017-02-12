import { ElementRef, Component, Inject, OnInit, ViewChild } from '@angular/core';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
	title = 'app works on';

	@ViewChild('title')
	titleElement: ElementRef;

	constructor(@Inject('isNode') public isNode: boolean) {}

	ngOnInit() {
		this.title += this.isNode ? ' node!' : ' browser!';
		console.log(!!this.titleElement);
	}

}
