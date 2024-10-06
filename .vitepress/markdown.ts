import type MarkdownIt from "markdown-it";
import type { Options } from "markdown-it";
import type Token from "markdown-it/lib/token.mjs";
import type Renderer from "markdown-it/lib/renderer.mjs";
import type StateBlock from "markdown-it/lib/rules_block/state_block.mjs";
import type StateInline from "markdown-it/lib/rules_inline/state_inline.mjs";


// import Token from "markdown-it/lib/token.mjs";
// import Renderer from "markdown-it/lib/renderer.mjs";
// import StateCore from "markdown-it/lib/rules_core/state_core.mjs";
import { ojs2notebook } from "@hpcc-js/observablehq-compiler";

const proxy = (tokens: Token[], idx: number, options: Options, _env: unknown, self: Renderer) => self.renderToken(tokens, idx, options);
type InfoAttrs = Record<string, string | boolean | number>;

const DOLLAR = 0x24;
const CURLEY_OPEN = 0x7B;
const CURLEY_CLOSE = 0x7D;

export class MarkdownEx {

    protected md: MarkdownIt;

    constructor(md: MarkdownIt) {
        this.md = md;
        this.hookStartEnd(md);
        this.hookFence(md);
        // this.hookTemplateLiterls(md);
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

    idx = 0;
    protected appendNodeComponent(content: string, display: boolean, attrs: InfoAttrs): string {
        let retVal = "";
        ++this.idx;
        try {
            const cellNb = ojs2notebook(content);
            for (let i = 0; i < cellNb.nodes.length; ++i) {
                const id = `fence-${this.idx}-${i}`;
                retVal += `<NodeComponent id="${id}" content="${encodeURI(cellNb.nodes[i].value)}" display=${display ? "true" : "false"} />`;
            }
        } catch (e: any) {
            console.error(e.message ?? e);
            retVal = `<div>Error: ${e.message}</div>`;
            attrs.run = false;
        }
        return retVal;
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

    hookTemplateLiterls(md: MarkdownIt) {
        md.renderer.rules.variable = (tokens: Token[], idx: number, options: any, env: any, self: Renderer) => this.renderVariable(tokens, idx, options, env, self);
        md.inline.ruler.after("image", "variables_ref", (state: StateInline, silent: boolean) => this.parseVariableRef(state, silent));
    }

    // Based on https://github.com/Bioruebe/markdown-it-variable
    parseVariableRef(state: StateInline, silent: boolean) {
        const start = state.pos;
        const max = state.posMax;

        // ${ var }
        // ^^ Require opening markers
        // if (!state.env.variables) return false;
        if (state.src.charCodeAt(start) !== DOLLAR) return false;
        if (state.src.charCodeAt(start + 1) !== CURLEY_OPEN) return false;
        let pos = start + 2;

        // ${ var }
        //   ^ Skip whitespace
        pos = skipWhitespace(state, pos, max);
        if (pos >= max) return false;

        // ${ var }
        //    ^^^ Parse variable name
        const variableStart = pos;
        let nestedCurly = 0;
        for (; pos < max; pos++) {
            const code = state.src.charCodeAt(pos);
            if (code === CURLEY_OPEN) nestedCurly++;
            if (code === CURLEY_CLOSE) {
                if (nestedCurly === 0) {
                    --pos;
                    break;
                }
                nestedCurly--;
            }
        }
        const variableEnd = pos;
        if (pos >= max || variableStart == variableEnd) return false;

        // ${ var }
        //       ^ Skip whitespace
        pos = skipWhitespace(state, pos, max);
        if (pos >= max) return false;

        // ${ var }
        //        ^ Require closing markers
        if (state.src.charCodeAt(pos) !== CURLEY_CLOSE) return false;

        const variableName = state.src.slice(variableStart, variableEnd);

        if (!silent) {
            const token = state.push("variable", "", 0);

            token.block = true;
            token.content = variableName;

            // token.children = state.env.variables[variableName].tokens;
        }

        state.pos = pos + 1;
        return true;
    }

    renderVariable(tokens: Token[], idx: number, options: any, env: any, self: Renderer) {
        console.log("renderVariable");
        return self.renderInline(tokens[idx].children || [], options, env);
    }
}

function skipWhitespace(state: StateBlock | StateInline, pos: number, max: number) {
    for (; pos < max; pos++) {
        const code = state.src.charCodeAt(pos);
        if (!state.md.utils.isSpace(code)) break;
    }

    return pos;
}
