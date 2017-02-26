/**
 * Initial work done by Jeff B. Cross (https://github.com/jeffbcross/dom-hydration-experiment)
 */
import { Injectable, RendererV2, RendererTypeV2, RendererFactoryV2, ViewEncapsulation } from '@angular/core';

import { ɵflattenStyles, ɵDomRendererFactoryV2, EventManager, ɵDomSharedStylesHost } from '@angular/platform-browser';

import { ɵDefaultDomRendererV2, ɵShadowDomRenderer, ɵEmulatedEncapsulationDomRendererV2 } from './default-dom-renderer';

const PRESERVATION_ATTRIBUTE = 'ng-preserve-node';
const PRESERVED_ATTRIBUTE = 'ng-preserved';

@Injectable()
export class HydrationRendererFactory extends ɵDomRendererFactoryV2 {

  constructor(eventManager: EventManager, sharedStylesHost: ɵDomSharedStylesHost) {
    super(eventManager, sharedStylesHost);
    (<any> this).defaultRenderer = new DefaultHydrationDomRenderer(eventManager);
  }

  createRenderer(element: any, type: RendererTypeV2): RendererV2 {
    if (!element || !type) {
      return super.createRenderer(element, type);
    }
    switch (type.encapsulation) {
      case ViewEncapsulation.Emulated: {
        let renderer = (<any> this).rendererByCompId.get(type.id);
        if (!renderer) {
          renderer = new EmulatedEncapsulationHydrationDomRendererV2(
            (<any> this).eventManager, (<any> this).sharedStylesHost, type);
          (<any> this).rendererByCompId.set(type.id, renderer);
        }
        (<EmulatedEncapsulationHydrationDomRendererV2>renderer).applyToHost(element);
        return renderer;
      }
      case ViewEncapsulation.Native:
        return new ShadowHydrationDomRenderer((<any> this).eventManager, (<any> this).sharedStylesHost, element, type);
      default: {
        if (!(<any> this).rendererByCompId.has(type.id)) {
          const styles = ɵflattenStyles(type.id, type.styles, []);
          (<any> this).sharedStylesHost.addStyles(styles);
          (<any> this).rendererByCompId.set(type.id, (<any> this).defaultRenderer);
        }
        return (<any> this).defaultRenderer;
      }
    }
  }
}

export class DefaultHydrationDomRenderer extends ɵDefaultDomRendererV2 {

  selectRootElement(selectorOrNode: string | any): any {
    let el: any = typeof selectorOrNode === 'string' ? document.querySelector(selectorOrNode) :
      selectorOrNode;
    if (!el) {
      throw new Error(`The selector "${selectorOrNode}" did not match any elements`);
    }

    removeUnPreservedChildren(el, true);

    return el;
  }

  appendChild(parent: any, newChild: any): void {
    if (!newChild.tagName) {
      return super.appendChild(parent, newChild);
    }
    const el = getPreservedElement(parent, newChild.tagName.toLowerCase());
    if (el) {
      this.setAttribute(el, PRESERVED_ATTRIBUTE, '');
      this.removeAttribute(el, PRESERVATION_ATTRIBUTE);
      newChild = el;
      console.log(newChild);
      return;
    }
    super.appendChild(parent, newChild);
  }

  setAttribute(el: any, name: string, value: string, namespace?: string): void {
    if (name === PRESERVATION_ATTRIBUTE) {
      return;
    }
    return super.setAttribute(el, name, value, namespace);
  }
}

export class EmulatedEncapsulationHydrationDomRendererV2 extends ɵEmulatedEncapsulationDomRendererV2 {


  appendChild(parent: any, newChild: any): void {
    if (!newChild.tagName) {
      return super.appendChild(parent, newChild);
    }
    const el = getPreservedElement(parent, newChild.tagName.toLowerCase());
    if (el) {
      this.setAttribute(el, PRESERVED_ATTRIBUTE, '');
      this.removeAttribute(el, PRESERVATION_ATTRIBUTE);
      newChild = el;
      console.log(newChild);
      return;
    }
    super.appendChild(parent, newChild);
  }

  setAttribute(el: any, name: string, value: string, namespace?: string): void {
    if (name === PRESERVATION_ATTRIBUTE) {
      return;
    }
    return super.setAttribute(el, name, value, namespace);
  }
}

export class ShadowHydrationDomRenderer extends ɵShadowDomRenderer {


  appendChild(parent: any, newChild: any): void {
    if (!newChild.tagName) {
      return super.appendChild(parent, newChild);
    }
    const el = getPreservedElement(parent, newChild.tagName.toLowerCase());
    if (el) {
      this.setAttribute(el, PRESERVED_ATTRIBUTE, '');
      this.removeAttribute(el, PRESERVATION_ATTRIBUTE);
      newChild = el;
      console.log(newChild);
      return;
    }
    super.appendChild(parent, newChild);
  }

  setAttribute(el: any, name: string, value: string, namespace?: string): void {
    if (name === PRESERVATION_ATTRIBUTE) {
      return;
    }
    return super.setAttribute(el, name, value, namespace);
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

function isPreserved(element: Element): boolean {
  return element.hasAttribute(PRESERVATION_ATTRIBUTE);
}

function preserveElement(element: Element): void {
	element.setAttribute(PRESERVATION_ATTRIBUTE, '');
}

/**
 * Cleans Unpreserved Children from node
 */
function removeUnPreservedChildren(element: Element, isRoot?: boolean) {
	// We don't want to destroy the root element, a node which is preserved or has a preserved node.
  if (isRoot || element.attributes.getNamedItem(PRESERVATION_ATTRIBUTE)) {
    if (element.childNodes) {
			Array.from(element.childNodes)
        .forEach((node) => {
          const preserved = node.attributes && node.attributes.getNamedItem(PRESERVATION_ATTRIBUTE);
          if (preserved) {
						// removeUnPreservedChildren(node, false);
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
