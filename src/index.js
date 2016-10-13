// Constants
const FAKE_CLASS_NAME = 'fake-select';
const FAKE_TAG_NAME = 'div';
const SOURCE_CLASS_NAME = 'fake-select-source';
const FAKE_OPTION_CLASS_NAME = 'fake-select-option';
const FAKE_OPTIONS_CLASS_NAME = 'fake-select-options';
const MULTIPLE_CLASS_NAME = 'multiple';
const FAKE_OPTION_SELECTED_CLASS_NAME = 'selected';
const FAKE_OPTION_TAG_NAME = 'div';
const FAKE_VALUES_CLASS_NAME = 'fake-select-values';
const FAKE_VALUE_CLASS_NAME = 'fake-select-value';
const QUERY_CLASS_NAME = 'fake-select-query';
const SELECT_QUERY_DATA_ATTR = 'data-query';

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
export function updateSelectToFake (selector='select', scope=null) {
    scope = scope || document;
    let removeFakeFocusTimeout = null;

    /**
     * @param {Element} newNode
     * @param {Element} referenceNode
     */
    function insertAfter (newNode, referenceNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }

    /**
     * @param {Element} node
     */
    function clearChildren (node) {
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
    }

    /**
     * @param {Node} el
     */
    function triggerChange (el) {
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
    function findSelects () {
        return scope.querySelectorAll(selector);
    }

    /**
     * @param {Node} fakeEl
     * @returns {Element}
     */
    function findFakeOptions (fakeEl) {
        return fakeEl.querySelector('.'+FAKE_OPTIONS_CLASS_NAME);
    }

    /**
     * @param {Element} fakeEl
     * @returns {Element}
     */
    function findFakeValue (fakeEl) {
        return fakeEl.querySelector('.'+FAKE_VALUES_CLASS_NAME);
    }

    /**
     * @param {Element} fakeEl
     * @returns {Element}
     */
    function findQuery (fakeEl) {
        return fakeEl.querySelector('.'+QUERY_CLASS_NAME);
    }

    /**
     * @returns {Element}
     */
    function createFakeSelectEl () {
        let el = document.createElement(FAKE_TAG_NAME);
        let optionsEl = document.createElement('div');
        let valuesEl = document.createElement('div');
        let queryEl = createQueryInput();
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
    function insertFakeSelectAfter (selectEl) {
        let fakeSelectEl = createFakeSelectEl();
        insertAfter(fakeSelectEl, selectEl);
        return fakeSelectEl;
    }

    /**
     * @returns {Element}
     */
    function createQueryInput () {
        let queryInputEl = document.createElement('input');
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
    function handleFakeOptionClick (fakeEl, selectEl, optionEl, selectedIndex, event) {
        event.preventDefault();
        event.stopPropagation();
        let isSelectMultiple = selectEl.classList.contains(MULTIPLE_CLASS_NAME);
        if (isSelectMultiple) {
            optionEl.selected = !optionEl.selected;
        } else {
            selectEl.selectedIndex = selectedIndex;
        }
        triggerChange(selectEl);
    }

    /**
     * @param {Element} fakeEl
     * @param {Element} selectEl
     * @param {Number} event
     */
    function handleSelectChange (fakeEl, selectEl, event) {
        let isSelectMultiple = selectEl.classList.contains(MULTIPLE_CLASS_NAME);
        let queryEl = findQuery(fakeEl);
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
    function handleQueryKeyup (queryEl, fakeEl, selectEl, event) {
        let isSelectMultiple = selectEl.classList.contains(MULTIPLE_CLASS_NAME);
        let queryValue = queryEl.value;
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
    function handleQueryKeydown (queryEl, fakeEl, selectEl, event) {
        let queryValue = queryEl.value;
        if (queryValue.length===0 && event.keyCode===8) {
            let selectedOptions = Array.prototype.filter.call(selectEl.options, (option) => option.selected);
            if (selectedOptions.length>0) {
                selectedOptions[selectedOptions.length-1].selected = false;
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
    function handleValueClick (fakeEl, selectEl, optionEl, event) {
        optionEl.selected = false;
        updateFakeWithSelect(fakeEl, selectEl);
    }

    /**
     * @param {Element} queryEl
     * @param {Element} fakeEl
     * @param {Element} selectEl
     * @param {Event} event
     */
    function handleQueryFocus (queryEl, fakeEl, selectEl, event) {
        fakeEl.classList.add('focused');
    }

    /**
     * @param {Element} queryEl
     * @param {Element} fakeEl
     * @param {Element} selectEl
     * @param {Event} event
     */
    function handleQueryBlur (queryEl, fakeEl, selectEl, event) {
        removeFakeFocusTimeout = setTimeout(() => fakeEl.classList.remove('focused'), 300);
    }

    function handleFakeClick (fakeEl, selectEl, event) {
        fakeEl.classList.add('focused');
    }

    function handleWindowClick (fakeEl, selectEl, event) {
        fakeEl.classList.remove('focused');
    }

    function handleFakeOptionsClick (fakeEl, selectEl, event) {
        clearTimeout(removeFakeFocusTimeout);
    }

    /**
     * @param {Element} fakeEl
     * @param {Element} selectEl
     */
    function updateFakeWithSelect (fakeEl, selectEl) {
        let fakeOptionsEl = findFakeOptions(fakeEl);
        let fakeValuesEl = findFakeValue(fakeEl);
        let queryEl = findQuery(fakeEl);
        let placeholder = selectEl.getAttribute('placeholder');
        let selectedOptions = [];
        let queryValue = selectEl.getAttribute(SELECT_QUERY_DATA_ATTR) || null;
        let isSelectMultiple = selectEl.classList.contains(MULTIPLE_CLASS_NAME);
        clearChildren(fakeOptionsEl);
        for (let i=0, ln=selectEl.options.length; i<ln; i++) {
            let fakeOptionEl = document.createElement(FAKE_OPTION_TAG_NAME);
            let optionEl = selectEl.options[i];
            if (!queryValue || (new RegExp(queryValue, 'i')).test(optionEl.text)) {
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
        if (selectedOptions.length>0) {
            clearChildren(fakeValuesEl);
            selectedOptions.forEach((optionEl) => {
                let valueEl = document.createElement('span');
                valueEl.innerHTML = optionEl.text;
                valueEl.classList.add(FAKE_VALUE_CLASS_NAME);
                valueEl.addEventListener('click', handleValueClick.bind(null, fakeEl, selectEl, optionEl));
                fakeValuesEl.appendChild(valueEl);
            });
        } else {
            clearChildren(fakeValuesEl);
        }
        if (isSelectMultiple || (!isSelectMultiple && selectedOptions.length===0)) {
            queryEl.setAttribute('placeholder', placeholder);
        } else {
            queryEl.removeAttribute('placeholder');
        }
    }

    /**
     * Find select elements and update to Fakes Selects.
     */
    function traverseSelectsAndUpdateItToFakes () {
        let selects = findSelects();
        for (let i=0, ln=selects.length; i<ln; i++) {
            let selectEl = selects[i];
            if (!selectEl.classList.contains(SOURCE_CLASS_NAME)) {
                let fakeEl = insertFakeSelectAfter(selectEl);
                let queryEl = findQuery(fakeEl);
                let fakeOptionsEl = findFakeOptions(fakeEl);
                selectEl.classList.add(SOURCE_CLASS_NAME);
                if (selectEl.getAttribute('multiple')!==null) {
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
