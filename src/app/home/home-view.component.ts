import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CachedHttp } from '../../modules/cached-http/cached-http';

@Component({
	selector: 'home-view',
	template: `<h3>{{subs | async}}</h3>`
})
export class HomeView implements OnInit {
  public subs: Observable<string>;

  constructor(private http: CachedHttp) {}

  ngOnInit() {
    this.subs = this.http.get('http://localhost:8000/data').map(data => {
      return `${data.greeting} ${data.name}`;
    });
  }
}
