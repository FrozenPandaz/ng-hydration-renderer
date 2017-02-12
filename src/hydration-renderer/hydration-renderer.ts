/**
 * Initial work done by Jeff B. Cross (https://github.com/jeffbcross/dom-hydration-experiment)
 */

import { Injectable, Renderer, RenderComponentType } from '@angular/core';
import { RenderDebugInfo } from '@angular/core/src/render/api';
import { DomRootRenderer, DomRenderer, DomRootRenderer_ } from '@angular/platform-browser/src/dom/dom_renderer';

export const NAMESPACE_URIS: {[ns: string]: string} = {
  'xlink': 'http://www.w3.org/1999/xlink',
  'svg': 'http://www.w3.org/2000/svg',
  'xhtml': 'http://www.w3.org/1999/xhtml'
};
const NS_PREFIX_RE = /^:([^:]+):(.+)$/;

@Injectable()
export class HydrationRootRenderer extends DomRootRenderer_ {
  registeredComponents: Map<string, HydrationRenderer>;
  renderComponent(componentProto: RenderComponentType): Renderer {
    let renderer = this.registeredComponents.get(componentProto.id);
    if (!renderer) {
      renderer = new HydrationRenderer(
          this, componentProto, this.animationDriver, `${this.appId}-${componentProto.id}`);
      renderer.preservationAttribute = 'ngPreserveNode';
      this.registeredComponents.set(componentProto.id, renderer);
    }
    return renderer;
  }
}

export class HydrationRenderer extends DomRenderer {
  public preservationAttribute: string;

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
    for (var i=0; i<el.children.length; i++) {

    }
    return removeUnPreservedChildren(el, this.preservationAttribute, true);
  }

  createElement(parent: Element|DocumentFragment, name: string, debugInfo: RenderDebugInfo):
      Element {
        console.log('createElement', debugInfo, (new Error()).stack);
    let el: Element;
    let hydrated = false;
    if (existingElement(parent, name, this.preservationAttribute)) {
      el = getExistingElement(parent, name);
      hydrated = true;
    } else if (isNamespaced(name)) {
      const nsAndName = splitNamespace(name);
      el = document.createElementNS((NAMESPACE_URIS)[nsAndName[0]], nsAndName[1]);
    } else {
      el = document.createElement(name);
    }
    // if (this._contentAttr) {
    //   el.setAttribute(this._contentAttr, '');
    // }
    if (parent && !hydrated) {
      parent.appendChild(el);
    }
    return el;
  }

  // createText(parentElement: Element|DocumentFragment, value: string, debugInfo: RenderDebugInfo):
  //     any {
  //       // TODO: get relative order of nodes
  //       if (parentElement.childNodes) {

  //       }
  //   const node = document.createTextNode(value);
  //   if (parentElement) {
  //     parentElement.appendChild(node);
  //   }
  //   return node;
  // }

  setElementAttribute(renderElement: Element, attributeName: string, attributeValue: string): void {
    let attrNs: string;
    let attrNameWithoutNs = attributeName;
    if (isNamespaced(attributeName)) {
      const nsAndName = splitNamespace(attributeName);
      attrNameWithoutNs = nsAndName[1];
      attributeName = nsAndName[0] + ':' + nsAndName[1];
      attrNs = NAMESPACE_URIS[nsAndName[0]];
    }
    if (isPresent(attributeValue)) {
      if (attrNs) {
        renderElement.setAttributeNS(attrNs, attributeName, attributeValue);
      } else if(attributeValue !== renderElement.getAttribute(attributeName)) {
        // Added conditional to make sure attribute value isn't the same
        renderElement.setAttribute(attributeName, attributeValue);
      }
    } else {
      if (isPresent(attrNs)) {
        renderElement.removeAttributeNS(attrNs, attrNameWithoutNs);
      } else {
        renderElement.removeAttribute(attributeName);
      }
    }
  }
}

export function isNamespaced(name: string) {
  return name[0] === ':';
}

export function splitNamespace(name: string): string[] {
  const match = name.match(NS_PREFIX_RE);
  return [match[1], match[2]];
}

function getExistingElement(parent: Element | DocumentFragment, name: string) {
  // TODO: doesn't account for multiple instances of the same element
  return parent.querySelector(name);
}

function existingElement(parent: Element | DocumentFragment, name: string, attr: string): boolean {
  if (!parent) return false;
  const el = parent.querySelector(name);
  if (!el) return false;
  return !!el.attributes.getNamedItem(attr);
}

function removeUnPreservedChildren(root: Element, attr: string, isRoot?: boolean) {
  if (isRoot) console.log('running on root');
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

export function isPresent(obj: any): boolean {
  return obj != null;
}
