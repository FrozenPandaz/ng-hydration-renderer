import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { UniversalCache } from '../modules/universal-cache/universal-cache';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'demo-app',
  template: `
	  <h1><a (click)="greet()" ng-preserve-node>Universal Demo {{ time | async }}</a></h1>
	  <!--<a routerLink="/">Home</a>
	  <a routerLink="/lazy">Lazy</a>
	  <router-outlet></router-outlet>-->
	`,
  styles: [
    `h1 {
      color: green;
    }`
  ]
})
export class AppComponent implements OnInit {
  constructor(private cache: UniversalCache, @Inject(PLATFORM_ID) private platformId: string) {}

  isBrowser: boolean = isPlatformBrowser(this.platformId);

  time: Observable<number>;

  ngOnInit() {
    this.cache.set('cached', true);
    console.log(this.isBrowser);
    if (this.isBrowser) {
      this.time = Observable.interval(200).delay(200)
    }
    // console.log(isPlatformServer);
  }

  greet() {
    console.log('Hello');
  }
}
