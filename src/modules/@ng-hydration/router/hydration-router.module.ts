import { NgModule } from '@angular/core';
import { HydrationRouterOutlet } from './hydration-router-outlet';
import { RouterModule } from '@angular/router';

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
