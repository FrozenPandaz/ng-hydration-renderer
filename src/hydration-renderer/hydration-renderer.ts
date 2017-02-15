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
	private root: Element;

	private preservedKeys: string[] = [];

	selectRootElement(selectorOrNode: string|Element, debugInfo: RenderDebugInfo): Element {
		if (typeof selectorOrNode === 'string') {
			this.root = <Element> (<any>this)._rootRenderer.document.querySelector(selectorOrNode);
			if (!this.root) {
				throw new Error(`The selector "${selectorOrNode}" did not match any elements`);
			}
		} else {
			this.root = selectorOrNode;
		}

		this.indexAllNodes();

		// Core is removing elements here that should change?
		return removeUnPreservedChildren(this.root, true);
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

	private indexAllNodes() {
		const preservedNodes = this.root.querySelectorAll(`*`);

		Array.from(preservedNodes).forEach((preservedNode) => {
			this.preservedKeys.push(this.getElementKey(preservedNode));
		});

		console.log(this.preservedKeys);
	}

	/**
	 * Original Idea from Preboot
	 */
	private getElementKey(element: Element) {
		let node = element.previousElementSibling,
			key = element.nodeName;

		while (node) {
			key = node.nodeName + '-' + key;
			node = node.previousElementSibling;
		}

		node = element.parentElement;

		while (node !== this.root) {
			key = node.nodeName + '_' + key;

			while (node.previousElementSibling) {
				node = node.previousElementSibling;
				key = node.nodeName + '-' + key;
			}

			node = node.parentElement;
		}

		return key;
	}

	private getNextKey(parent: Element | DocumentFragment, name: string) {
		let key = name.toUpperCase();
		if (!parent) {
			console.log('no parent');
			return key;
		}

		const children = Array.from(parent.children),
			len = children.length;

		children
			.filter(child => {
				return !child.hasAttribute(PRESERVATION_ATTRIBUTE);
			})
			.reverse()
			.forEach(child => {
				key = child.nodeName + '-' + key;
			});

		if (parent === this.root || !this.root) {
			return key;
		}
		let node = parent.parentElement;
		while (node !== this.root) {
			key = node.nodeName + '_' + key;
			node = node.parentElement;
		}

		return key;
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

	return parent.querySelector(`${name}[${PRESERVATION_ATTRIBUTE}]`);
}

/**
 * Cleans Unpreserved Children from node
 */
function removeUnPreservedChildren(element: Element, isRoot?: boolean) {
	// We don't want to destroy the root element, a node which is preserved or has a preserved node.
	if (isRoot || element.hasAttribute(PRESERVATION_ATTRIBUTE)) {
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

/**
 * Originally Taken from preboot
 */
function getNodeKey(node: Element, root: Element): string {
	let ancestors: Element[] = [];
	let temp = node;

	// walk up the tree from the target node up to the root
	while (temp && temp !== root) {
		ancestors.push(temp);
		temp = temp.parentElement;
	}

	// note: if temp doesn't exist here it means root node wasn't found
	// This should never happen
	if (temp) {
		ancestors.push(temp);
	}

	// now go backwards starting from the root, appending the appName to unique identify the node later..
	let name = node.nodeName || 'unknown';
	let key = name;
	let len = ancestors.length;

	for (let i = (len - 1); i >= 0; i--) {
		temp = ancestors[i];

		if (temp.childNodes && i > 0) {
			for (let j = 0; j < temp.childNodes.length; j++) {
				if (temp.childNodes[j] === ancestors[i - 1]) {
					key += '_s' + (j + 1);
					break;
				}
			}
		}
	}

	return key;
}
