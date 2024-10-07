# Tests

_Testing the rendering of observablehq notebooks in markdown._

## Test inline

1. js eval=false

```js eval=false
const a = ${mol};
```

2. js

```js
mol = 40 + 2;
```

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
</div>
