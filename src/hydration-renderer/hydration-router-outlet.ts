import {
	ComponentRef,
	Directive,
	ViewContainerRef,
	ComponentFactoryResolver,
	Attribute } from '@angular/core';

import { ActivatedRoute, RouterOutlet, RouterOutletMap } from '@angular/router';

export class HydrationRouterOutlet extends RouterOutlet {

	constructor(
		parentOutletMap: RouterOutletMap, location: ViewContainerRef,
		resolver: ComponentFactoryResolver, name: string) {
		super(parentOutletMap, location, resolver, name);
	}

	attach(ref: ComponentRef<any>, activatedRoute: ActivatedRoute) {
		console.log('attach');
		super.attach(ref, activatedRoute);
	}
}

