import { Component, OnInit } from '@angular/core'
import { UniversalCache } from '../modules/universal-cache/universal-cache';

@Component({
	selector: 'demo-app',
	template: `
	  <h1 ng-preserve-node><a (click)="greet()">Universal Demo</a></h1>
	  <a routerLink="/">Home</a>
	  <a routerLink="/lazy">Lazy</a>
	  <router-outlet></router-outlet>
	`,
  styles: [
    `h1 {
      color: green;
    }`
  ]
})
export class AppComponent implements OnInit {
  constructor(private cache: UniversalCache) {}
  ngOnInit() {
    this.cache.set('cached', true);
  }

  greet() {
    console.log('Hello');
  }
}
