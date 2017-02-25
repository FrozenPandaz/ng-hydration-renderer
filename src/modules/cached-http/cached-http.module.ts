import { NgModule } from '@angular/core';
import { Http, HttpModule } from '@angular/http';
import { CachedHttp } from './cached-http';

@NgModule({
  imports: [
    HttpModule
  ],
  providers: [
    CachedHttp
  ]
})
export class CachedHttpModule {}
