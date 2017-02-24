import { NgModule, RootRenderer } from '@angular/core';
import { HydrationRootRenderer } from './hydration-renderer';

@NgModule({
	providers: [
		{ provide: RootRenderer, useClass: HydrationRootRenderer }
	]
})
export class HydrationRendererModule {

}
