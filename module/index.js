const assign = require('object-assign');
const find = require('array-find');
const drop = require('this-drop');
const arrayFrom = require('array-from');
const insertCss = require('insert-css');

const DOCUMENT_FRAGMENT_NODE = 11;

 /**
  * If you use tape, you’ll feel right at home. Give us an instance of `tape`.
  * We won’t change its [existing API][] in any way. We just add a couple
  * of `options`:
  *
  * - `dom` – one or more DOM elements. We’ll add it to the `<body>`
  *   before your test and clean it up after your test has ended.
  *   Default: nothing.
  *
  * - `styles` – a string of CSS. We’ll add it as a `<style>` to the `<head>`
  *   before your test – and clean it up after your test has ended.
  *   Default: nothing.
  *
  * - `document` – a custom implementation of `document`. It may be useful
  *   for testing outside a browser. Default: `window.document`.
  *
  * [existing API]:     https://github.com/substack/tape#methods
  *
  * @jsig
  *   test(tape) => (
  *     name?        : String,
  *     options?: {
  *       // All original `tape` options, and:
  *       dom?       : Element | DocumentFragment
  *       styles?    : String
  *       document?  : Document
  *     },
  *     callback     : Function
  *   ) => void
  */
export default (tape) => {
  const tapeCss = (...args) => {
    // Determine arguments – based on
    // https://github.com/substack/tape/blob/aadcf4a9/lib/test.js .
    const name = find(args, (arg) => typeof arg === 'string');
    const options = find(args, (arg) => typeof arg === 'object') || {};
    const callback = find(args, (arg) => typeof arg === 'function');

    // Get options.
    const {dom, styles} = options;
    const document = (
      options.document ||
      (typeof window !== 'undefined' && window.document) ||
      null
    );
    // TODO: Throw if there’s no `document`;

    // Wrap the `callback` with our candy floss wonders:
    const wrappedCallback = (is) => {
      if (dom) {
        // Save the contents of our DocumentFragment before they get nuked.
        const domToRemove = (dom.nodeType === DOCUMENT_FRAGMENT_NODE ?
          arrayFrom(dom.children) :
          [dom]
        );

        // Add the DOM.
        document.body.appendChild(dom);

        // Schedule the cleanup.
        is.on('end', () => {
          domToRemove.forEach(element => document.body.removeChild(element));
        });
      }

      if (styles) {
        insertCss(styles, {document});
      }

      // Run the original callback.
      callback(is);
    };

    // Export the final API.
    tape(
      name,
      options::drop(['dom']),
      wrappedCallback
    );
  };
  assign(tapeCss, tape);

  return tapeCss;
};
