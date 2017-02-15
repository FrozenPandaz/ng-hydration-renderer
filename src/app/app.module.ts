
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { ChildComponent } from './child/child.component';

@NgModule({
	declarations: [
		AppComponent,
		ChildComponent
	],
	imports: [
		CommonModule,
		FormsModule,
		HttpModule
	],
	providers: [
		{ provide: 'depth', useValue: 7 },
		{ provide: 'siblings', useValue: 7 }
	],
	exports: [AppComponent]
})
export class AppModule { }
