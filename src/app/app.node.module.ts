/**
 * This file and `main.browser.ts` are identical, at the moment(!)
 * By splitting these, you're able to create logic, imports, etc that are "Platform" specific.
 * If you want your code to be completely Universal and don't need that
 * You can also just have 1 file, that is imported into both
 * client.ts and server.ts
 */

import { NgModule } from '@angular/core';
import { UniversalModule } from 'angular2-universal';
import { AppModule } from './app.module';
import { AppComponent } from './index';
// import { RouterModule } from '@angular/router';
// import { appRoutes } from './app/app.routing';

/**
 * Top-level NgModule "container"
 */
@NgModule({
	/** Root App Component */
	bootstrap: [ AppComponent ],
	imports: [
		/**
		 * NOTE: Needs to be your first import (!)
		 * NodeModule, NodeHttpModule, NodeJsonpModule are included
		 */
		UniversalModule,
		AppModule
		/**
		 * using routes
		 */
		// RouterModule.forRoot(appRoutes)
	],
	providers: [
		{ provide: 'isNode', useValue: true }
	]
})
export class NodeAppModule {

}
