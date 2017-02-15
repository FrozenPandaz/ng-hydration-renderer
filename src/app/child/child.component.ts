import { Input, Component, OnInit, Inject } from '@angular/core';

@Component({
	selector: 'app-child',
	templateUrl: './child.component.html',
	styleUrls: ['./child.component.css']
})
export class ChildComponent implements OnInit {

	@Input()
	depth: number;

	nodes: any[];

	constructor(@Inject('depth') public max_depth: number, @Inject('siblings') public siblings: number) { }

	ngOnInit() {
		this.nodes = new Array(this.siblings);
	}

}
