/**
 * Initial work done by Jeff B. Cross (https://github.com/jeffbcross/dom-hydration-experiment)
 */

import { Inject, Injectable, Renderer, RenderComponentType, APP_ID } from '@angular/core';

// Private core modules
import { RenderDebugInfo } from '@angular/core/src/render/api';

// Private platform-browser modules
import { DOCUMENT } from '@angular/platform-browser/src/dom/dom_tokens';
import { EventManager } from '@angular/platform-browser/src/dom/events/event_manager';
import { DomSharedStylesHost } from '@angular/platform-browser/src/dom/shared_styles_host';
import { DomRenderer, DomRootRenderer_ } from '@angular/platform-browser/src/dom/dom_renderer';
import { AnimationDriver } from '@angular/platform-browser/src/dom/animation_driver';

@Injectable()
export class HydrationRootRenderer extends DomRootRenderer_ {

	constructor(
		@Inject(DOCUMENT) _document: any,
		_eventManager: EventManager,
		sharedStylesHost: DomSharedStylesHost,
		animationDriver: AnimationDriver,
		@Inject(APP_ID) appId: string
	) {
		super(_document, _eventManager, sharedStylesHost, animationDriver, appId);
	}

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
		console.log('createElement', parent, name);
		let el = getPreservedElement(parent, name);

		if (el) {
			el.removeAttribute(PRESERVATION_ATTRIBUTE);
		} else {
			el = super.createElement(parent, name, debugInfo);
		}

		return el;
	}

	setElementAttribute(renderElement: Element, attributeName: string, attributeValue: string): void {
		if (attributeName === PRESERVATION_ATTRIBUTE) {
			return;
		}

		super.setElementAttribute(renderElement, attributeName, attributeValue);
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
			Array.from(element.children)
				.forEach((node) => {
					const preserved = node.hasAttribute(PRESERVATION_ATTRIBUTE);
					if (preserved) {
						Array.from(node.childNodes)
							.filter(ele => {
								return ele.nodeName === '#text';
							})
							.forEach(ele => {
								node.removeChild(ele);
							});
						removeUnPreservedChildren(node, false);
					} else {
						element.removeChild(node);
					}
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
