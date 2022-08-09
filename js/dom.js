// Copyright (C) 2020 Dethe Elza

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

// DOM utilities

var SVG_NS = "http://www.w3.org/2000/svg";

function html(name, attributes, children) {
  return element(document.createElement(name), attributes, children);
}

function element(
  elem,
  attributes /* optional object */,
  children /* optional array, node, or string */
) {
  if (
    !children &&
    attributes &&
    (Array.isArray(attributes) ||
      attributes.nodeName ||
      typeof attributes === "string")
  ) {
    children = attributes;
    attributes = null;
  }
  if (attributes) {
    setAttributes(elem, attributes);
  }
  if (children) {
    appendChildren(elem, children);
  }
  return elem;
}

function svg(name, attrs, children) {
  return element(document.createElementNS(SVG_NS, name), attrs, children);
}

function listen(selector, event, listener) {
  if (Array.isArray(event)) {
    event.forEach(e => listen(selector, e, listener));
  } else if (Array.isArray(listener)) {
    listener.forEach(l => listen(selector, event, l));
  } else {
    if (selector.addEventListener) {
      selector.addEventListener(event, listener, true);
    } else {
      findAll(selector).forEach(e => listen(e, event, listener));
    }
  }
}

function setAttributes(elem, attributes) {
  // keys must be strings
  // values can be strings, numbers, booleans, or functions
  if (attributes) {
    Object.keys(attributes).forEach(function (key) {
      if (attributes[key] === null || attributes[key] === undefined) return;
      if (typeof attributes[key] === "function") {
        var val = attributes[key](key, attributes);
        if (val) {
          elem.setAttribute(key, val);
        }
      } else {
        elem.setAttribute(key, attributes[key]);
      }
    });
  }
  return elem; // for chaining
}

function appendChildren(elem, children) {
  // Children can be a single child or an array
  // Each child can be a string or a node
  if (children) {
    if (!Array.isArray(children)) {
      children = [children]; // convenience, allow a single argument vs. an array of one
    }
    children.forEach(function (child) {
      if (child.nodeName) {
        elem.appendChild(child);
      } else {
        // assumes child is a string
        elem.appendChild(document.createTextNode(child));
      }
    });
  }
  return elem;
}

function remove(elem) {
  // conditionally remove element if it exists
  if (elem) {
    elem.parentElement.removeChild(elem);
  }
}

function clear(elem) {
  while (elem.firstChild) {
    elem.firstChild.remove();
  }
  elem.removeAttribute("transform");
}

function insertAfter(newElement, sibling) {
  sibling.parentElement.insertBefore(newElement, sibling.nextElementSibling);
}

function closest(elem, selector) {
  while (elem) {
    if (matches(elem, selector)) {
      return elem;
    }
    if (!elem.parentElement) {
      throw new Error("Element has no parent, is it in the tree? %o", elem);
      //return null;
    }
    elem = elem.parentElement;
  }
  return null;
}

function find(elem, selector) {
  if (typeof elem === "string") {
    selector = elem;
    elem = document;
  }
  return elem.querySelector(selector);
}

function findAll(elem, selector) {
  if (typeof elem === "string") {
    selector = elem;
    elem = document;
  }
  return [].slice.call(elem.querySelectorAll(selector));
}

function addClass(elem, klass) {
  /* Conditionally add class if element exists */
  if (elem) {
    elem.classList.add(klass);
  }
}

function previous(elem, selector) {
  let node = elem.previousElementSibling;
  while (node) {
    if (node.matches(selector)) {
      return node;
    } else {
      node = elem.previousElementSibling;
    }
  }
  return null;
}

function next(elem, selector) {
  let node = elem.nextElementSibling;
  while (node) {
    if (node.matches(selector)) {
      return node;
    } else {
      node = elem.nextElementSibling;
    }
  }
  return null;
}

function removeClass(elem, klass) {
  /* Conditionall remove class if element exists */
  if (elem) {
    elem.classList.remove(klass);
  }
}

function nextSibling(elem) {
  /* conditionally returns next sibling if element exists */
  return elem ? elem.nextElementSibling : null;
}

function prevSibling(elem) {
  /* conditionally returns previous sibling if element exists */
  return elem ? elem.previousElementSibling : null;
}

function toggleClass(elements, klass) {
  if (!elements) return;
  if (Array.isArray(elements)) {
    elements.forEach(function (elem) {
      toggleClass(elem, klass);
    });
  } else {
    elements.classList.toggle(klass);
  }
}

function indexOf(child) {
  var allChildren = [].slice.call(child.parentElement.children);
  return allChildren.indexOf(child);
}

var isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

function pathToArray(pathElem) {
  return [].slice.call(pathElem.pathSegList).map(function (seg) {
    return { x: seg.x, y: seg.y };
  });
}

function arrayToPath(arr) {
  return arr
    .map(function (point, index) {
      if (index) {
        return "L" + point.x + "," + point.y;
      } else {
        return "M" + point.x + "," + point.y;
      }
    })
    .join(" ");
}

const sendEvent = (name, data) => {
  let evt = new CustomEvent(name, { detail: data });
  document.dispatchEvent(evt);
};

// Taken from waterbearlang/waterbear, originally based on Paul Irish's random hex color:
// http://www.paulirish.com/2009/random-hex-color-code-snippets/
// Theoretically could return non-unique values, not going to let that keep me up at night
const randomId = () => "k" + Math.floor(Math.random() * 16777215).toString(16); // 'k' because ids have to start with a letter

const ensureIds = selector =>
  findAll(selector).forEach(elem =>
    elem.id ? elem.id : (elem.id = randomId())
  );

export {
  element,
  html,
  svg,
  setAttributes,
  listen,
  remove,
  clear,
  insertAfter,
  previous,
  next,
  find as $,
  findAll as $$,
  closest,
  addClass,
  removeClass,
  prevSibling,
  nextSibling,
  toggleClass,
  indexOf,
  sendEvent,
  randomId,
  ensureIds,
};
