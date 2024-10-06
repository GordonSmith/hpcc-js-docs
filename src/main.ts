import "./style.css";
import typescriptLogo from "./typescript.svg";
import viteLogo from "/vite.svg";
import { setupCounter } from "./counter.ts";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Vite + TypeScript</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
    <p id="placeholder">XXX</p>
  </div>
`;

setupCounter(document.querySelector<HTMLButtonElement>("#counter")!);

import markdownit from "markdown-it";
import { replPlugin } from "./repl.ts";

// enable everything
const md = markdownit({
  html: true,
  linkify: true,
  typographer: true
});

md.use(replPlugin, {});

document.querySelector<HTMLDivElement>("#placeholder")!.innerHTML = md.render(`\
    
# Hello World

I am \${mol} years old!

\`\`\`js echo
mol = 40 + 2;
\`\`\`
    
`);

