// import { HydrationRenderer, HydrationRootRenderer } from './hydration-renderer';
// import { RootRenderer, Component } from '@angular/core';
// import { TestBed } from '@angular/core/testing';
// import { BrowserModule } from '@angular/platform-browser';
// import { HydrationRendererModule } from '../hydration-renderer.module';

// @Component({
// 	selector: 'app-mock-component',
// 	template: '<div></div>'
// })
// class MockComponent {}

// fdescribe('HydrationRenderer', () => {
// 	let hydrationRenderer: HydrationRenderer;

// 	beforeEach(() => {
// 		TestBed.configureTestingModule({
// 			imports: [HydrationRendererModule],
// 			declarations: [MockComponent]
// 		});

// 		TestBed.compileComponents();
// 	});

// 	it('should be truthy', () => {
// 		const fixture = TestBed.createComponent(MockComponent);
// 		fixture.detectChanges();

// 		const cmp = fixture.nativeElement;
// 		expect(cmp.querySelector('div')).toBeTruthy();
// 	});
// });
