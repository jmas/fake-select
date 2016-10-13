(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.fakeSelect = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.updateSelectToFake = updateSelectToFake;
// Constants
var FAKE_CLASS_NAME = 'fake-select';
var FAKE_TAG_NAME = 'div';
var SOURCE_CLASS_NAME = 'fake-select-source';
var FAKE_OPTION_CLASS_NAME = 'fake-select-option';
var FAKE_OPTIONS_CLASS_NAME = 'fake-select-options';
var MULTIPLE_CLASS_NAME = 'multiple';
var FAKE_OPTION_SELECTED_CLASS_NAME = 'selected';
var FAKE_OPTION_TAG_NAME = 'div';
var FAKE_VALUES_CLASS_NAME = 'fake-select-values';
var FAKE_VALUE_CLASS_NAME = 'fake-select-value';
var QUERY_CLASS_NAME = 'fake-select-query';
var SELECT_QUERY_DATA_ATTR = 'data-query';

/**
 * Search for select elements in document and update it to Fake Selects.
 * Usage:
 * ```html
 * <p>As a multiple selector:</p>
 * <select name="items[]" placeholder="Please, select available options&hellip;" multiple>
 *   <option>Option 1</option>
 *   <option selected>Option 2</option>
 *   <option selected>Option 3</option>
 * </select>
 * <p>As single selector:</p>
 * <select name="item" placeholder="Please, select available option&hellip;">
 *   <option>Option 1</option>
 *   <option>Option 2</option>
 *   <option selected>Option 3</option>
 * </select>
 * ```
 * ```js
 * import { updateSelectToFake } from 'fake-select';
 * updateSelectToFake();
 * ```
 * @param {string} selector
 * @param {object} scope
 */
function updateSelectToFake() {
    var selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'select';
    var scope = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    scope = scope || document;
    var removeFakeFocusTimeout = null;

    /**
     * @param {Element} newNode
     * @param {Element} referenceNode
     */
    function insertAfter(newNode, referenceNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }

    /**
     * @param {Element} node
     */
    function clearChildren(node) {
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
    }

    /**
     * @param {Node} el
     */
    function triggerChange(el) {
        if ('createEvent' in document) {
            var evt = document.createEvent('HTMLEvents');
            evt.initEvent('change', false, true);
            el.dispatchEvent(evt);
        } else {
            el.fireEvent('onchange');
        }
    }

    /**
     * @returns {NodeList}
     */
    function findSelects() {
        return scope.querySelectorAll(selector);
    }

    /**
     * @param {Node} fakeEl
     * @returns {Element}
     */
    function findFakeOptions(fakeEl) {
        return fakeEl.querySelector('.' + FAKE_OPTIONS_CLASS_NAME);
    }

    /**
     * @param {Element} fakeEl
     * @returns {Element}
     */
    function findFakeValue(fakeEl) {
        return fakeEl.querySelector('.' + FAKE_VALUES_CLASS_NAME);
    }

    /**
     * @param {Element} fakeEl
     * @returns {Element}
     */
    function findQuery(fakeEl) {
        return fakeEl.querySelector('.' + QUERY_CLASS_NAME);
    }

    /**
     * @returns {Element}
     */
    function createFakeSelectEl() {
        var el = document.createElement(FAKE_TAG_NAME);
        var optionsEl = document.createElement('div');
        var valuesEl = document.createElement('div');
        var queryEl = createQueryInput();
        el.className = FAKE_CLASS_NAME;
        optionsEl.className = FAKE_OPTIONS_CLASS_NAME;
        valuesEl.className = FAKE_VALUES_CLASS_NAME;
        el.appendChild(valuesEl);
        el.appendChild(queryEl);
        el.appendChild(optionsEl);
        return el;
    }

    /**
     * @param {Element} selectEl
     * @returns {Element}
     */
    function insertFakeSelectAfter(selectEl) {
        var fakeSelectEl = createFakeSelectEl();
        insertAfter(fakeSelectEl, selectEl);
        return fakeSelectEl;
    }

    /**
     * @returns {Element}
     */
    function createQueryInput() {
        var queryInputEl = document.createElement('input');
        queryInputEl.className = QUERY_CLASS_NAME;
        return queryInputEl;
    }

    /**
     * @param {Element} fakeEl
     * @param {Element} selectEl
     * @param {Element} optionEl
     * @param {Number} selectedIndex
     * @param {Event} event
     */
    function handleFakeOptionClick(fakeEl, selectEl, optionEl, selectedIndex, event) {
        event.preventDefault();
        event.stopPropagation();
        var isSelectMultiple = selectEl.classList.contains(MULTIPLE_CLASS_NAME);
        var queryEl = findQuery(fakeEl);
        if (isSelectMultiple) {
            optionEl.selected = !optionEl.selected;
        } else {
            selectEl.selectedIndex = selectedIndex;
        }
        queryEl.value = '';
        triggerChange(selectEl);
    }

    /**
     * @param {Element} fakeEl
     * @param {Element} selectEl
     * @param {Number} event
     */
    function handleSelectChange(fakeEl, selectEl, event) {
        var isSelectMultiple = selectEl.classList.contains(MULTIPLE_CLASS_NAME);
        var queryEl = findQuery(fakeEl);
        updateFakeWithSelect(fakeEl, selectEl);
        if (!isSelectMultiple) {
            queryEl.blur();
            fakeEl.classList.remove('focused');
        } else {
            queryEl.focus();
        }
    }

    /**
     * @param {Element} queryEl
     * @param {Element} fakeEl
     * @param {Element} selectEl
     * @param {Number} event
     */
    function handleQueryKeyup(queryEl, fakeEl, selectEl, event) {
        var isSelectMultiple = selectEl.classList.contains(MULTIPLE_CLASS_NAME);
        var queryValue = queryEl.value;
        if (!isSelectMultiple && queryValue && selectEl.selectedIndex) {
            selectEl.selectedIndex = -1;
        }
        selectEl.setAttribute(SELECT_QUERY_DATA_ATTR, queryValue);
        updateFakeWithSelect(fakeEl, selectEl);
    }

    /**
     * @param {Element} queryEl
     * @param {Element} fakeEl
     * @param {Element} selectEl
     * @param {Event} event
     */
    function handleQueryKeydown(queryEl, fakeEl, selectEl, event) {
        var queryValue = queryEl.value;
        if (queryValue.length === 0 && event.keyCode === 8) {
            var selectedOptions = Array.prototype.filter.call(selectEl.options, function (option) {
                return option.selected;
            });
            if (selectedOptions.length > 0) {
                selectedOptions[selectedOptions.length - 1].selected = false;
            }
        }
        updateFakeWithSelect(fakeEl, selectEl);
    }

    /**
     * @param {Element} fakeEl
     * @param {Element} selectEl
     * @param {Element} optionEl
     * @param {Event} event
     */
    function handleValueClick(fakeEl, selectEl, optionEl, event) {
        optionEl.selected = false;
        updateFakeWithSelect(fakeEl, selectEl);
    }

    /**
     * @param {Element} queryEl
     * @param {Element} fakeEl
     * @param {Element} selectEl
     * @param {Event} event
     */
    function handleQueryFocus(queryEl, fakeEl, selectEl, event) {
        fakeEl.classList.add('focused');
    }

    /**
     * @param {Element} queryEl
     * @param {Element} fakeEl
     * @param {Element} selectEl
     * @param {Event} event
     */
    function handleQueryBlur(queryEl, fakeEl, selectEl, event) {
        removeFakeFocusTimeout = setTimeout(function () {
            return fakeEl.classList.remove('focused');
        }, 300);
    }

    function handleFakeClick(fakeEl, selectEl, event) {
        console.log('handleFakeClick');
        fakeEl.classList.add('focused');
    }

    function handleWindowClick(fakeEl, selectEl, event) {
        console.log('handleWindowClick');
        fakeEl.classList.remove('focused');
    }

    function handleFakeOptionsClick(fakeEl, selectEl, event) {
        console.log('handleFakeOptionsClick');
        //event.stopPropagation();
        clearTimeout(removeFakeFocusTimeout);
    }

    /**
     * @param {Element} fakeEl
     * @param {Element} selectEl
     */
    function updateFakeWithSelect(fakeEl, selectEl) {
        var fakeOptionsEl = findFakeOptions(fakeEl);
        var fakeValuesEl = findFakeValue(fakeEl);
        var queryEl = findQuery(fakeEl);
        var placeholder = selectEl.getAttribute('placeholder');
        var selectedOptions = [];
        var queryValue = selectEl.getAttribute(SELECT_QUERY_DATA_ATTR) || null;
        var isSelectMultiple = selectEl.classList.contains(MULTIPLE_CLASS_NAME);
        clearChildren(fakeOptionsEl);
        for (var i = 0, ln = selectEl.options.length; i < ln; i++) {
            var fakeOptionEl = document.createElement(FAKE_OPTION_TAG_NAME);
            var optionEl = selectEl.options[i];
            if (!queryValue || new RegExp(queryValue, 'i').test(optionEl.text)) {
                fakeOptionEl.classList.add(FAKE_OPTION_CLASS_NAME);
                fakeOptionEl.innerHTML = optionEl.text;
                fakeOptionEl.addEventListener('click', handleFakeOptionClick.bind(null, fakeEl, selectEl, optionEl, i), true);
                fakeOptionsEl.appendChild(fakeOptionEl);
            }
            if (optionEl.selected) {
                fakeOptionEl.classList.add(FAKE_OPTION_SELECTED_CLASS_NAME);
            } else {
                fakeOptionEl.classList.remove(FAKE_OPTION_SELECTED_CLASS_NAME);
            }
            if (optionEl.selected) {
                selectedOptions.push(selectEl.options[i]);
            }
        }
        if (selectedOptions.length > 0) {
            clearChildren(fakeValuesEl);
            selectedOptions.forEach(function (optionEl) {
                var valueEl = document.createElement('span');
                valueEl.innerHTML = optionEl.text;
                valueEl.classList.add(FAKE_VALUE_CLASS_NAME);
                valueEl.addEventListener('click', handleValueClick.bind(null, fakeEl, selectEl, optionEl));
                fakeValuesEl.appendChild(valueEl);
            });
        } else {
            clearChildren(fakeValuesEl);
        }
        if (isSelectMultiple || !isSelectMultiple && selectedOptions.length === 0) {
            queryEl.setAttribute('placeholder', placeholder);
        } else {
            queryEl.removeAttribute('placeholder');
        }
    }

    /**
     * Find select elements and update to Fakes Selects.
     */
    function traverseSelectsAndUpdateItToFakes() {
        var selects = findSelects();
        for (var i = 0, ln = selects.length; i < ln; i++) {
            var selectEl = selects[i];
            if (!selectEl.classList.contains(SOURCE_CLASS_NAME)) {
                var fakeEl = insertFakeSelectAfter(selectEl);
                var queryEl = findQuery(fakeEl);
                var fakeOptionsEl = findFakeOptions(fakeEl);
                selectEl.classList.add(SOURCE_CLASS_NAME);
                if (selectEl.getAttribute('multiple') !== null) {
                    selectEl.classList.add(MULTIPLE_CLASS_NAME);
                    fakeEl.classList.add(MULTIPLE_CLASS_NAME);
                } else {
                    selectEl.setAttribute('multiple', '');
                }
                updateFakeWithSelect(fakeEl, selectEl);
                queryEl.addEventListener('focus', handleQueryFocus.bind(null, queryEl, fakeEl, selectEl), true);
                queryEl.addEventListener('blur', handleQueryBlur.bind(null, queryEl, fakeEl, selectEl), true);
                queryEl.addEventListener('keyup', handleQueryKeyup.bind(null, queryEl, fakeEl, selectEl), true);
                queryEl.addEventListener('keydown', handleQueryKeydown.bind(null, queryEl, fakeEl, selectEl), true);
                selectEl.addEventListener('change', handleSelectChange.bind(null, fakeEl, selectEl), true);
                fakeEl.addEventListener('click', handleFakeClick.bind(null, fakeEl, selectEl), true);
                fakeOptionsEl.addEventListener('click', handleFakeOptionsClick.bind(null, fakeEl, selectEl), true);
                window.addEventListener('click', handleWindowClick.bind(null, fakeEl, selectEl), true);
            }
        }
    }

    // Run
    traverseSelectsAndUpdateItToFakes();
}

},{}]},{},[1])(1)
});