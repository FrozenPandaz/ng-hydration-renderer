import { NgModule, RootRenderer } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HydrationRootRenderer } from './hydration-renderer';

@NgModule({
	imports: [
		CommonModule
	],
	providers: [
		{ provide: RootRenderer, useClass: HydrationRootRenderer }
	]
})
export class HydrationRendererModule {

}
