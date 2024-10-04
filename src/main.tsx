import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { Markdown } from "./Markdown.tsx";

import "./main.css";

const sampleMarkdown = `\
# Hello and Welcome!

__Welcome to the testPage__

\`\`\`ecl
show
r := RECORD
    STRING name;
    INTEGER age;
END;
d := DATASET([{'John', 25}, {'Jane', 30}], r);

\`\`\`

\`\`\`js

40 + 1;

\`\`\`

\`\`\`js echo

40 + 2;

\`\`\`

\`\`\`js run=false

40 + 3;

\`\`\`


`;



createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Markdown markdown={sampleMarkdown} />
        <App />
    </StrictMode>,
);
