# Diverging color scatterplot

This plot of global average surface temperature ([GISTEMP](https://data.giss.nasa.gov/gistemp/)) uses a *diverging* *color* scale to indicate the deviation from the 1951–1980 average in degrees Celsius. Each measurement is drawn with a [dot](https://observablehq.com/plot/marks/dot), and a ramp [legend](https://observablehq.com/plot/features/legend) allows the reader to interpret the color—which in this case is redundant with its *y* position.

```js
Plot.plot({
  y: {
    grid: true,
    tickFormat: "+f",
    label: "↑ Surface temperature anomaly (°C)"
  },
  color: {
    scheme: "BuRd",
    legend: true
  },
  marks: [
    Plot.ruleY([0]),
    Plot.dot(gistemp, {x: "Date", y: "Anomaly", stroke: "Anomaly"})
  ]
})

```

```js display=false
gistemp = FileAttachment(/* "gistemp.csv" */"https://static.observableusercontent.com/files/1734c862dd51ef67930fef3dcd19e8184bb65c405683f55a085f97ca01c233713a53062c251fe0a6d72f93863fd5f714eadef3c9455b1b4f2ed90546cbc57b32").csv({typed: true});
```

