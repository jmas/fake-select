# Fake Select

Very simple library that update standard browser select input to Fake Select.

Features:
* Vanilla JS (no any framework is needed)
* Lightweight (2 Kb CSS and 13 Kb JS code)
* Use standard `<select>` for init
* Throw `change` event when selection is updated by Fake Select
* Listen `change` event and change Fake Select selection when original `<select>` was changed
* Support `multiple` attribute (so multiple selection)

See [demo example](https://jmas.github.io/fake-select/examples/basic.html).

See `Warning` section.

## Usage

```html
<p>As a multiple selector:</p>
<select name="items[]" placeholder="Please, select available options&hellip;" multiple>
  <option>Option 1</option>
  <option selected>Option 2</option>
  <option selected>Option 3</option>
</select>

<p>As single selector:</p>
<select name="item" placeholder="Please, select available option&hellip;">
  <option>Option 1</option>
  <option>Option 2</option>
  <option selected>Option 3</option>
</select>
```

```js
import { updateSelectToFake } from 'fake-select';

// Call the function to search for <select> elements and upgrade it to Fake Select
updateSelectToFake();

// You can pass a specific selector to find specific selects
updateSelectToFake('.js-fake-select');

// You can scope a container where selector should be search
const containerEl = document.getElementById('container');
updateSelectToFake('.js-fake-select', containerEl);
```

Or old-style:
```html
<script src="fake-select-standalone.js"></script>
<script>
    window.fakeSelect.updateSelectToFake();
</script>
```

and do not forget to add `fake-select.css`.

## Warning

Tested only in latest Chrome and Safari. So we still need to decide it stability.

Also:
* Need tests
* Need real integrations and feedback
* Do not support keyboard for now

You can use `Modernizer.touch` to switch off Fake Select in Mobile browsers.
