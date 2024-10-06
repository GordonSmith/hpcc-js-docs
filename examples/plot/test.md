# Tests

_Testing the rendering of observablehq notebooks in markdown._

## Options

### Regular js code block

````md
```js
const mol = 40 + 2;
```
````

Produces:

```js
const mol1 = 40 + 2;
```

### Executed code block

````md
```js exec
mol = 40 + 2;
```
````

Produces:
```js exec
mol = 40 + 2;
```

### Executed code block with `echo`

````md
```js exec echo
molSrcEcho = 40 + 2;
```
````

Produces:
```js exec echo
molSrcEcho = 40 + 2;
```

### Executed code block with `hide`

````md
```js exec hide
molSrcHide = 40 + 2;
```
````

Produces:
```js exec hide
molSrcHide = 40 + 2;
```

::: warning
Both the code block and executed output is hidden but the result is still calculated.
:::

### Executed code block with `echo` and `hide`

````md
```js exec echo hide
molSrcEchoHide = 40 + 2;
```
````

Produces:
```js exec echo hide
molSrcEchoHide = 40 + 2;
```

---

---

<!-- ### Hidden code block

````md
```js hide
mol = 40 + 2;
```
````

Produces:

```js hide
mol = 40 + 2;
```
...nothing...

3. js echo

```js echo
molEcho = 39 + 3;
```

4. js hidden

```js hidden
molHidden = 38 + 4;
```



<!-- a ${ Plot.rectY({length: 10000}, Plot.binX({y: "count"}, {x: d3.randomNormal()})).plot() } b -->

aaa

a ${ mol } b

<div class="card grid-colspan-2">
  <h4>R2D2</h4>
  a ${ mol } b
</div>

```js
```

## Test block

<div id="observablehq-main">
    <div class="grid grid-cols-2">
        <div class="card"><h1>A</h1>1 × 1</div>
        <div class="card grid-rowspan-2"><h1>B</h1>1 × 2</div>
        <div class="card"><h1>C</h1>1 × 1</div>
        <div class="card grid-colspan-2">
            <h1>R2D2</h1>
            a ${ Plot.rectY({length: 10000}, Plot.binX({y: "count"}, {x: d3.randomNormal()})).plot() } b
        </div>
    </div>
</div> -->
