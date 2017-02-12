
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';

@NgModule({
	declarations: [
		AppComponent
	],
	imports: [
		CommonModule,
		FormsModule,
		HttpModule
	],
	exports: [AppComponent]
})
export class AppModule { }
