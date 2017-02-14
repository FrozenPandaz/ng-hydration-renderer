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
		// Core is removing elements here that should change?
		return removeUnPreservedChildren(el, true);
	}

	createElement(parent: Element|DocumentFragment, name: string, debugInfo: RenderDebugInfo): Element {
		// console.log('createElement', parent, name);
		return getPreservedElement(parent, name) || super.createElement(parent, name, debugInfo);
	}
}

/**
 * Gets a preserved Element matching
 */
function getPreservedElement(parent: Element | DocumentFragment, name: string): Element {
	if (!parent) {
		return null;
	}
	// TODO: doesn't account for multiple instances of the same element
	return parent.querySelector(`${name}[${PRESERVATION_ATTRIBUTE}]`);
}

/**
 * Cleans Unpreserved Children from node
 */
function removeUnPreservedChildren(element: Element, isRoot?: boolean) {
	// We don't want to destroy the root element, a node which is preserved or has a preserved node.
	if (isRoot || element.attributes.getNamedItem(PRESERVATION_ATTRIBUTE)) {
		console.log(element, 'has preserved state');
		if (element.children) {
			Array.prototype.forEach.call(element.children, el => removeUnPreservedChildren(el, false));
		}
		if (element.childNodes) {
			Array.prototype.forEach.call(element.childNodes, (node) => {
				element.removeChild(node);
			});
		}
	} else {
		console.log(element, 'getting a clean slate');
		while (element.firstChild) {
			element.removeChild(element.firstChild);
		}
	}

	return element;
}
