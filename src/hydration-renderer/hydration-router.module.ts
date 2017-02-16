import { NgModule } from '@angular/core';
import { HydrationRouterOutletDirective } from './hydration-router-outlet';

@NgModule({
	declarations: [
		HydrationRouterOutletDirective
	],
	exports: [
		HydrationRouterOutletDirective
	]
})
export class HydrationRouterModule {

}
