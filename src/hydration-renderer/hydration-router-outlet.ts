import {
	ComponentRef,
	Directive,
	ViewContainerRef,
	ComponentFactoryResolver,
	Attribute,
	Injector,
	ResolvedReflectiveProvider,
	ReflectiveInjector
} from '@angular/core';

import { ActivatedRoute, RouterOutlet, RouterOutletMap } from '@angular/router';
import { Renderer, RootRenderer } from '@angular/core';

@Directive({
	selector: 'router-outlet'
})
export class HydrationRouterOutlet extends RouterOutlet {
	protected _activated = (<any> this).activated;
	protected __activatedRoute = (<any> this)._activatedRoute;
	protected _location = (<any> this).location;
	activate(
		activatedRoute: ActivatedRoute,
		resolver: ComponentFactoryResolver,
		injector: Injector,
		providers: ResolvedReflectiveProvider[],
		outletMap: RouterOutletMap
	): void {
		if (this.isActivated) {
		throw new Error('Cannot activate an already activated outlet');
		}

		this.outletMap = outletMap;
		this.__activatedRoute = activatedRoute;

		const snapshot = (<any> activatedRoute)._futureSnapshot;
		const component: any = <any>snapshot._routeConfig.component;
		const factory = resolver.resolveComponentFactory(component);

		const inj = ReflectiveInjector.fromResolvedProviders(providers, injector);
		const rootRenderer = inj.get(RootRenderer);
		rootRenderer.nextParent = this._location.element.nativeElement.parentElement;
		this._activated = this._location.createComponent(factory, this._location.length, inj, []);
		this._activated.changeDetectorRef.detectChanges();

		this.activateEvents.emit(this._activated.instance);
	}
}

