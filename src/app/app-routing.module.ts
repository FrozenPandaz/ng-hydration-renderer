import { Route, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { ChildComponent } from './child/child.component';

const ROUTES: Route[] = [{
	path: 'route',
	component: ChildComponent
}];

@NgModule({
	imports: [
		RouterModule.forRoot(ROUTES)
	],
	exports: [
		RouterModule
	]
})
export class AppRoutingModule {}
