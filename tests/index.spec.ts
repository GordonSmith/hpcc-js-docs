import markdownit from "markdown-it";
import observablePlugin from "../src/index.ts";

import "./style.css";

const md = markdownit({
    html: true,
    linkify: true,
    typographer: true
});

md.use(observablePlugin, {});

const testMd = fetch("../examples/plot/test.md").then(response => response.text());
document.querySelector<HTMLDivElement>("#placeholder")!.innerHTML = md.render(await testMd);
