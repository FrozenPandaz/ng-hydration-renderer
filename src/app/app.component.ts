import { ElementRef, Component, Inject, OnInit, ViewChild } from '@angular/core';

import { Observable } from 'rxjs';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
	title = 'app works on';

	toggle = true;

	count: Observable<number>;

	constructor(@Inject('isNode') public isNode: boolean) {}

	toggleElement() {
		this.toggle = !this.toggle;
	}

	ngOnInit() {
		this.title += this.isNode ? ' node!' : ' browser!';

		this.count = Observable.interval(200).take(10);
	}

}
