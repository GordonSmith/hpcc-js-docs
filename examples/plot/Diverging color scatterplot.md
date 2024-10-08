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

<script setup>
import { data } from "./Diverging color scatterplot.data.ts";
globalThis.__rawData = data;
</script>

```js hide
gistemp = globalThis.__rawData[0].map((row) => ({ Date: new Date(row.Date), Anomaly: +row.Anomaly }));
```
