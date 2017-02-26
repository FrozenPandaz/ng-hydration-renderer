import { RendererV2, RendererTypeV2 } from '@angular/core';
import { ɵflattenStyles, ɵshimContentAttribute, ɵshimHostAttribute, ɵDomSharedStylesHost, EventManager, ɵNAMESPACE_URIS } from '@angular/platform-browser';
import {  } from '@angular/core';

// TODO export from core
export class ɵDefaultDomRendererV2 implements RendererV2 {
  data: { [key: string]: any } = Object.create(null);

  constructor(private eventManager: EventManager) { }

  destroy(): void { }

  destroyNode: null;

  createElement(name: string, namespace?: string): any {
    if (namespace) {
      return document.createElementNS(ɵNAMESPACE_URIS[namespace], name);
    }

    return document.createElement(name);
  }

  createComment(value: string): any { return document.createComment(value); }

  createText(value: string): any { return document.createTextNode(value); }

  appendChild(parent: any, newChild: any): void { parent.appendChild(newChild); }

  insertBefore(parent: any, newChild: any, refChild: any): void {
    if (parent) {
      parent.insertBefore(newChild, refChild);
    }
  }

  removeChild(parent: any, oldChild: any): void {
    if (parent) {
      parent.removeChild(oldChild);
    }
  }

  selectRootElement(selectorOrNode: string | any): any {
    let el: any = typeof selectorOrNode === 'string' ? document.querySelector(selectorOrNode) :
      selectorOrNode;
    if (!el) {
      throw new Error(`The selector "${selectorOrNode}" did not match any elements`);
    }
    el.textContent = '';
    return el;
  }

  parentNode(node: any): any { return node.parentNode; }

  nextSibling(node: any): any { return node.nextSibling; }

  setAttribute(el: any, name: string, value: string, namespace?: string): void {
    if (namespace) {
      el.setAttributeNS(ɵNAMESPACE_URIS[namespace], namespace + ':' + name, value);
    } else {
      el.setAttribute(name, value);
    }
  }

  removeAttribute(el: any, name: string, namespace?: string): void {
    if (namespace) {
      el.removeAttributeNS(ɵNAMESPACE_URIS[namespace], name);
    } else {
      el.removeAttribute(name);
    }
  }

  addClass(el: any, name: string): void { el.classList.add(name); }

  removeClass(el: any, name: string): void { el.classList.remove(name); }

  setStyle(el: any, style: string, value: any, hasVendorPrefix: boolean, hasImportant: boolean):
    void {
    if (hasVendorPrefix || hasImportant) {
      el.style.setProperty(style, value, hasImportant ? 'important' : '');
    } else {
      el.style[style] = value;
    }
  }

  removeStyle(el: any, style: string, hasVendorPrefix: boolean): void {
    if (hasVendorPrefix) {
      el.style.removeProperty(style);
    } else {
      // IE requires '' instead of null
      // see https://github.com/angular/angular/issues/7916
      el.style[style] = '';
    }
  }

  setProperty(el: any, name: string, value: any): void { el[name] = value; }

  setValue(node: any, value: string): void { node.nodeValue = value; }

  listen(target: 'window' | 'document' | 'body' | any, event: string, callback: (event: any) => boolean):
    () => void {
    if (typeof target === 'string') {
      return <() => void>this.eventManager.addGlobalEventListener(
        target, event, decoratePreventDefault(callback));
    }
    return <() => void>this.eventManager.addEventListener(
      target, event, decoratePreventDefault(callback)) as () => void;
  }
}

export class ɵEmulatedEncapsulationDomRendererV2 extends ɵDefaultDomRendererV2 {
  private contentAttr: string;
  private hostAttr: string;

  constructor(
    eventManager: EventManager, sharedStylesHost: ɵDomSharedStylesHost,
    private component: RendererTypeV2) {
    super(eventManager);
    const styles = ɵflattenStyles(component.id, component.styles, []);
    sharedStylesHost.addStyles(styles);

    this.contentAttr = ɵshimContentAttribute(component.id);
    this.hostAttr = ɵshimHostAttribute(component.id);
  }

  applyToHost(element: any) { super.setAttribute(element, this.hostAttr, ''); }

  createElement(parent: any, name: string): Element {
    const el = super.createElement(parent, name);
    super.setAttribute(el, this.contentAttr, '');
    return el;
  }
}

export class ɵShadowDomRenderer extends ɵDefaultDomRendererV2 {
  private shadowRoot: any;

  constructor(
    eventManager: EventManager, private sharedStylesHost: ɵDomSharedStylesHost,
    private hostEl: any, private component: RendererTypeV2) {
    super(eventManager);
    this.shadowRoot = (hostEl as any).createShadowRoot();
    this.sharedStylesHost.addHost(this.shadowRoot);
    const styles = ɵflattenStyles(component.id, component.styles, []);
    for (let i = 0; i < styles.length; i++) {
      const styleEl = document.createElement('style');
      styleEl.textContent = styles[i];
      this.shadowRoot.appendChild(styleEl);
    }
  }

  private nodeOrShadowRoot(node: any): any { return node === this.hostEl ? this.shadowRoot : node; }

  destroy() { this.sharedStylesHost.removeHost(this.shadowRoot); }

  appendChild(parent: any, newChild: any): void {
    return super.appendChild(this.nodeOrShadowRoot(parent), newChild);
  }
  insertBefore(parent: any, newChild: any, refChild: any): void {
    return super.insertBefore(this.nodeOrShadowRoot(parent), newChild, refChild);
  }
  removeChild(parent: any, oldChild: any): void {
    return super.removeChild(this.nodeOrShadowRoot(parent), oldChild);
  }
  parentNode(node: any): any {
    return this.nodeOrShadowRoot(super.parentNode(this.nodeOrShadowRoot(node)));
  }
}

function decoratePreventDefault(eventHandler: Function): Function {
  return (event: any) => {
    const allowDefaultBehavior = eventHandler(event);
    if (allowDefaultBehavior === false) {
      // TODO(tbosch): move preventDefault into event plugins...
      event.preventDefault();
      event.returnValue = false;
    }
  };
}
