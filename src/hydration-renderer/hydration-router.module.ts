import { NgModule } from '@angular/core';
import { HydrationRouterOutlet } from './hydration-router-outlet';

@NgModule({
	declarations: [
		HydrationRouterOutlet
	],
	exports: [
		HydrationRouterOutlet
	]
})
export class HydrationRouterModule {

}
