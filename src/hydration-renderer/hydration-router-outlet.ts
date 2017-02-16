import {
	ComponentRef,
	Directive,
	ViewContainerRef,
	ComponentFactoryResolver,
	Attribute } from '@angular/core';

import { ActivatedRoute, RouterOutlet, RouterOutletMap } from '@angular/router';

export class HydrationRouterOutlet extends RouterOutlet {

	constructor(
		private parentOutletMap: RouterOutletMap, private location: ViewContainerRef,
		private resolver: ComponentFactoryResolver, @Attribute('name') private name: string) {
		super(parentOutletMap, location, resolver, name);
	}
	attach(ref: ComponentRef<any>, activatedRoute: ActivatedRoute) {
		console.log('attach');
		super.attach(ref, activatedRoute);
	}
}

