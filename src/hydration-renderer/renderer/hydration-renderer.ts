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
import { DIRECT_DOM_RENDERER, DomRenderer, DomRootRenderer_ } from '@angular/platform-browser/src/dom/dom_renderer';
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

const HYDRATION_DIRECT_RENDERER = DIRECT_DOM_RENDERER;

HYDRATION_DIRECT_RENDERER.appendChild = (node: Node, parent: Element) => {
	console.log('direct appendChild');
	parent.appendChild(node);
};
HYDRATION_DIRECT_RENDERER.insertBefore = (node: Node, refNode: Node) => {
	console.log('direct insertBefore', node, refNode);
	const preservedElement = getPreservedElement(refNode.parentElement, node.nodeName.toLowerCase());
	if (preservedElement) {
		// Array.from(node.childNodes)
		// 	.forEach(childNode => {
		// 		node.removeChild(childNode);
		// 	});
		// Array.from(preservedElement.childNodes)
		// 	.forEach(childNode => {
		// 		node.appendChild(childNode);
		// 	});
		// refNode.parentNode.insertBefore(node, refNode);
		// refNode.parentNode.removeChild(preservedElement);
		return;
	}
	refNode.parentNode.insertBefore(node, refNode);
};

const PRESERVATION_ATTRIBUTE = 'ng-preserve-node';
const PRESERVED_ATTRIBUTE = 'ng-preserved';

export class HydrationRenderer extends DomRenderer {

	constructor(
		_rootRenderer: HydrationRootRenderer, componentProto: RenderComponentType,
		_animationDriver: AnimationDriver, styleShimId: string) {
			super(_rootRenderer, componentProto, _animationDriver, styleShimId);
			this.directRenderer = HYDRATION_DIRECT_RENDERER;
	}
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

		preserveElements(el);

		// Core is removing elements here that should change?
		return removeUnPreservedChildren(el, true);
	}

	createElement(parent: Element|DocumentFragment, name: string, debugInfo: RenderDebugInfo): Element {
		let el = getPreservedElement(parent, name);
		console.log('createElement', parent, name);

		if (el) {
			console.log('updating preserved', name);
			el.removeAttribute(PRESERVATION_ATTRIBUTE);
			el.setAttribute(PRESERVED_ATTRIBUTE, '');
		} else {
			el = super.createElement(parent, name, debugInfo);
		}

		return el;
	}

	setElementAttribute(renderElement: Element, attributeName: string, attributeValue: string): void {
		if (attributeName === PRESERVATION_ATTRIBUTE) {
			return;
		}

		if (renderElement.hasAttribute(PRESERVED_ATTRIBUTE)) {
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

	return parent.querySelector(`${name}[${PRESERVATION_ATTRIBUTE}]`);
}

function preserveElements(root: Element) {
	let preservedElements = root.querySelectorAll(`[${PRESERVATION_ATTRIBUTE}]`);

	Array.from(preservedElements)
		.forEach((preservedElement) => {

			preservePreviousSiblings(preservedElement);
			preserveParentsAndParentsPreviousSiblings(preservedElement);
		});

	preserveElement(root);
	preservePreviousSiblings(root);
	preserveParentsAndParentsPreviousSiblings(root);
}

function preserveParentsAndParentsPreviousSiblings(element: Element) {
	let node = element;
	while (node.parentElement) {
		preserveElement(node.parentElement);
		preservePreviousSiblings(node.parentElement);
		node = node.parentElement;
	}
}

function preservePreviousSiblings(element: Element) {
	let node = element;
	while (node.previousElementSibling) {
		preserveElement(node.previousElementSibling);
		node = node.previousElementSibling;
	}
}

function preserveElement(element: Element): void {
	console.log('preserving', element);
	element.setAttribute(PRESERVATION_ATTRIBUTE, '');
}

/**
 * Cleans Unpreserved Children from node
 */
function removeUnPreservedChildren(element: Element, isRoot?: boolean) {
	// We don't want to destroy the root element, a node which is preserved or has a preserved node.
	if (isRoot || element.attributes.getNamedItem(PRESERVATION_ATTRIBUTE)) {
		if (element.children) {
			removeTextNodes(element);
			Array.from(element.children)
				.forEach((node) => {
					const preserved = node.hasAttribute(PRESERVATION_ATTRIBUTE);
					if (preserved) {
						removeTextNodes(node);
						removeUnPreservedChildren(node, false);
					} else {
						element.removeChild(node);
					}
				});
		}
	} else {
		while (element.firstChild) {
			element.removeChild(element.firstChild);
		}
	}

	return element;
}

function removeTextNodes(element: Element) {
	Array.from(element.childNodes)
		.filter(ele => {
			return ele.nodeName === '#text';
		})
		.forEach(ele => {
			element.removeChild(ele);
		});
}
