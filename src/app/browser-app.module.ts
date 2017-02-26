import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppModule } from './app.module';
import { BrowserUniversalCacheModule } from '../modules/universal-cache/browser-universal-cache.module';
import { HydrationRendererModule } from '../modules/hydration-renderer';

@NgModule({
	bootstrap: [ AppComponent ],
	imports: [
    BrowserModule.withServerTransition({
      appId: 'my-app-id'
    }),
    BrowserUniversalCacheModule,
    HydrationRendererModule,
    AppModule
	]
})
export class BrowserAppModule {}
