import { NgModule, RendererFactoryV2 } from '@angular/core';
import { HydrationRendererFactory } from './hydration-renderer';

@NgModule({
	providers: [
    { provide: RendererFactoryV2, useClass: HydrationRendererFactory }
	]
})
export class HydrationRendererModule {

}
