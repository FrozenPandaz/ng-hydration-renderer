import {
	ComponentRef,
	Directive,
	ViewContainerRef,
	ComponentFactoryResolver,
	Attribute,
	Injector,
	ResolvedReflectiveProvider
} from '@angular/core';

import { ActivatedRoute, RouterOutlet, RouterOutletMap } from '@angular/router';


export class HydrationRouterOutlet extends RouterOutlet {
	activate(
		activatedRoute: ActivatedRoute,
		resolver: ComponentFactoryResolver,
		injector: Injector,
		providers: ResolvedReflectiveProvider[],
		outletMap: RouterOutletMap
	): void {
		console.log('activate');
		super.activate(activatedRoute, resolver, injector, providers, outletMap);
	}
}

