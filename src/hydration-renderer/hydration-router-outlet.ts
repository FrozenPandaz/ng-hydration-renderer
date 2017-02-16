import {
	ComponentRef,
	Directive } from '@angular/core';

import { ActivatedRoute, RouterOutlet } from '@angular/router';

export class HydrationRouterOutlet extends RouterOutlet {
	attach(ref: ComponentRef<any>, activatedRoute: ActivatedRoute) {
		console.log('attach');
		super.attach(ref, activatedRoute);
	}
}

