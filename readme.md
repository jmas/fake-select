# Fake Select

Very simple library that update standard browser select input to Fake Select.

Features:
* Use standard `<select>` for init
* Throw `change` event when selection is updated by Fake Select
* Listen `change` event and change Fake Select selection when original `<select>` was changed
* Support `multiple` attribute (so multiple selection)

Se warning section.

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
updateSelectToFake();
```

## Warning

Tested only in latest Chrome and Safari. So we still need to decide it stability.

Also:
* Need tests
* Need real integrations and feedback
* Do not support keyboard for now
