import { NgModule, RootRenderer } from '@angular/core';
import { HydrationRootRenderer } from './renderer/hydration-renderer';
import { HydrationRouterModule } from './hydration-router.module';

@NgModule({
	providers: [
		{ provide: RootRenderer, useClass: HydrationRootRenderer }
	],
	imports: [
		HydrationRouterModule
	],
	exports: [
		HydrationRouterModule
	]
})
export class HydrationRendererModule {

}
