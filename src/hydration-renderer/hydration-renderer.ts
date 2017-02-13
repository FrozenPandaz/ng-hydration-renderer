/**
 * Initial work done by Jeff B. Cross (https://github.com/jeffbcross/dom-hydration-experiment)
 */

import { Injectable, Renderer, RenderComponentType } from '@angular/core';
import { RenderDebugInfo } from '@angular/core/src/render/api';
import { DomRootRenderer, DomRenderer, DomRootRenderer_ } from '@angular/platform-browser/src/dom/dom_renderer';

@Injectable()
export class HydrationRootRenderer extends DomRootRenderer_ {

	registeredComponents: Map<string, HydrationRenderer>;

	renderComponent(componentProto: RenderComponentType): Renderer {
		let renderer = this.registeredComponents.get(componentProto.id);

		if (!renderer) {
			renderer = new HydrationRenderer(this, componentProto, this.animationDriver, `${this.appId}-${componentProto.id}`);
			this.registeredComponents.set(componentProto.id, renderer);
		}

		return renderer;
	}
}

const PRESERVATION_ATTRIBUTE = 'ng-preserve-node';

export class HydrationRenderer extends DomRenderer {
	selectRootElement(selectorOrNode: string|Element, debugInfo: RenderDebugInfo): Element {
		let el: Element;
		if (typeof selectorOrNode === 'string') {
			el = (<any>this)._rootRenderer.document.querySelector(selectorOrNode);
			if (!el) {
				throw new Error(`The selector "${selectorOrNode}" did not match any elements`);
			}
		} else {
			el = selectorOrNode;
		}
		return removeUnPreservedChildren(el, PRESERVATION_ATTRIBUTE, true);
	}

	createElement(parent: Element|DocumentFragment, name: string, debugInfo: RenderDebugInfo): Element {
		console.log('createElement', debugInfo);

		if (existingElement(parent, name, PRESERVATION_ATTRIBUTE)) {
			console.log('Using existing', parent, name);
			return getExistingElement(parent, name);
		}

		return super.createElement(parent, name, debugInfo);
	}
}

function getExistingElement(parent: Element | DocumentFragment, name: string): Element {
	// TODO: doesn't account for multiple instances of the same element
	console.log('name', name);
	return parent.querySelector(name);
}

function existingElement(parent: Element | DocumentFragment, name: string, attr: string): boolean {
	if (!parent) {
		return false;
	}
	const selector = `${name}[${attr}]`,
		el = parent.querySelector(selector);

	return !!el;
}

function removeUnPreservedChildren(root: Element, attr: string, isRoot?: boolean) {
	if (isRoot) {
		console.log('running on root');
	}
	// We don't want to destroy the root element
	if (isRoot || root.attributes.getNamedItem(attr)) {
		console.log('we have a match!', root);
		if (root.children) {
			Array.prototype.forEach.call(root.children, el => removeUnPreservedChildren(el, attr, false));
		}
		if (root.childNodes) {
			Array.prototype.filter.call(root.childNodes, (node) => {
				return node instanceof Text;
			})
			.forEach(n => {
				// Just remove each text node
				root.removeChild(n);
			});
		}
	} else {
		console.log('we have a loser', root);
		while (root.firstChild) {
			root.removeChild(root.firstChild);
		}
	}

	return root;
}
