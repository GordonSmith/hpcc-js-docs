import MarkdownIt, { Options } from "markdown-it";
import Token from "markdown-it/lib/token.mjs";
import Renderer from "markdown-it/lib/renderer.mjs";
import { ojs2notebook } from "@hpcc-js/observablehq-compiler";

const proxy = (tokens: Token[], idx: number, options: Options, _env: unknown, self: Renderer) => self.renderToken(tokens, idx, options);
type InfoAttrs = Record<string, string | boolean | number>;

export class MarkdownEx {

    protected md: MarkdownIt;

    constructor(md: MarkdownIt) {
        this.md = md;
        this.hookStartEnd(md);
        this.hookFence(md);
    }

    protected parseInfo(info: string): { langName: string, attrs: InfoAttrs } {
        const parts = info.split(/\s+/);
        const langName = parts[0];
        const attrs: InfoAttrs = {};

        for (let i = 1; i < parts.length; i++) {
            const part = parts[i];
            if (part.includes("=")) {
                const [key, value] = part.split("=");
                if (value === "true") {
                    attrs[key] = true;
                } else if (value === "false") {
                    attrs[key] = false;
                } else if (!isNaN(Number(value))) {
                    attrs[key] = Number(value);
                } else {
                    attrs[key] = value.replace(/['"]/g, "");
                }
            } else {
                attrs[part] = true;
            }
        }

        return { langName, attrs };
    }

    protected hookFence(md: MarkdownIt) {
        const defaultFenceRenderer = md.renderer.rules.fence || proxy;
        const fenceRenderer = (tokens: Token[], idx: number, options: Options, env: unknown, self: Renderer) => {
            const token = tokens[idx];
            const info = this.parseInfo(token.info);
            token.content += "\n";
            let preHtml = "";
            switch (info.langName) {
                case "js":
                case "javascript":
                    if (info.attrs.run !== false) {
                        try {
                            const cellNb = ojs2notebook(token.content);
                            for (let i = 0; i < cellNb.nodes.length; ++i) {
                                const id = `fence-${idx}-${i}`;
                                preHtml += `<NodeComponent id="${id}" content="${encodeURI(cellNb.nodes[i].value)}" display=${info.attrs.display !== false ? "true" : "false"} />`;
                            }
                        } catch (e: any) {
                            console.error(e.message ?? e);
                            preHtml = `<div>Error: ${e.message}</div>`;
                            info.attrs.run = false;
                        }
                    }
                    if (info.attrs.echo || info.attrs.run === false) {
                        return preHtml + defaultFenceRenderer(tokens, idx, options, env, self);
                    }
                    break;
                default:
                    return preHtml + defaultFenceRenderer(tokens, idx, options, env, self);
            }
            return preHtml;
        };
        md.renderer.rules.fence = fenceRenderer;
    }

    protected hookStartEnd(md: MarkdownIt) {
        const originalRender = md.render;
        md.render = (src: string, env?: any): string => {
            src += "<NotebookComponent />";
            const renderSrc = originalRender.call(md, src, env);
            return renderSrc;
        };
    }

    transpile(markdown: string) {
        return this.md.render(markdown);
    }
}
