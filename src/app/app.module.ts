
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { ChildComponent } from './child/child.component';
import { AppRoutingModule } from './app-routing.module';
import { HydrationRouterModule } from '../hydration-renderer/hydration-router.module';

@NgModule({
	declarations: [
		AppComponent,
		ChildComponent
	],
	imports: [
		CommonModule,
		FormsModule,
		HttpModule,
		AppRoutingModule,
		HydrationRouterModule
	],
	exports: [AppComponent],
	schemas: [
		CUSTOM_ELEMENTS_SCHEMA
	]
})
export class AppModule { }
