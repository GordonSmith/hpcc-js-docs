import type { Options } from "markdown-it";
import type Token from "markdown-it/lib/token.mjs";
import type Renderer from "markdown-it/lib/renderer.mjs";
import type StateBlock from "markdown-it/lib/rules_block/state_block.mjs";
import type StateInline from "markdown-it/lib/rules_inline/state_inline.mjs";

import { ojs2notebook } from "@hpcc-js/observablehq-compiler";

//  -----------------------------------------------------------------

function hookStartEnd(md: MarkdownIt) {
    const originalRender = md.render;
    md.render = (src: string, env?: any): string => {
        src += "<NotebookComponent />";
        const renderSrc = originalRender.call(md, src, env);
        return renderSrc;
    };
}

interface FenceInfo {
    type?: "js" | "javascript" | string;
    eval?: boolean;
    echo?: boolean;
    hidden?: boolean;
}

const serializeFenceInfo = (attrs: FenceInfo) =>
    Object
        .entries(attrs)
        .map(([key, value]) => `${key}=${value}`)
        .join(";")
    ;

const deserializeFenceInfo = (attrs: string): FenceInfo =>
    attrs
        .split(/\s+/)
        .reduce((acc: FenceInfo, pair, idx: number) => {
            if (idx === 0) {
                acc.type = pair as "js" | "javascript" | string;
                return acc;
            }

            const [key, value] = pair.split("=") as [keyof FenceInfo, string];
            switch (key) {
                case "eval":
                case "echo":
                case "hidden":
                    acc[key] = value !== "false";
                    break;
            }
            return acc;
        }, {})
    ;

let idx = 0;
function appendNodeComponent(content: string, attrs: FenceInfo): string {
    let retVal = "";
    ++idx;
    try {
        const cellNb = ojs2notebook(content);
        for (let i = 0; i < cellNb.nodes.length; ++i) {
            const id = `fence-${idx}-${i + 1}`;
            retVal += `\
<span id="${id}" data-attrs=${encodeURI(JSON.stringify(attrs))} class="node">
${cellNb.nodes[i].value}
</span>`;
        }
    } catch (e: any) {
        console.error(e.message ?? e);
        retVal = `**Error:** ${e.message}`;
        attrs.eval = false;
    }
    return retVal;
}

//  -----------------------------------------------------------------

const proxy = (tokens: Token[], idx: number, options: Options, _env: unknown, self: Renderer) => self.renderToken(tokens, idx, options);

function hookFence(md: MarkdownIt) {
    const defaultFenceRenderer = md.renderer.rules.fence || proxy;
    const fenceRenderer = (tokens: Token[], idx: number, options: Options, env: unknown, self: Renderer) => {
        const token = tokens[idx];
        const attrs = deserializeFenceInfo(token.info);
        token.content += "\n";
        let preHtml = "";
        switch (attrs.type) {
            case "js":
            case "javascript":
                if (attrs.eval) {
                    preHtml = appendNodeComponent(token.content, attrs);
                }
                if (attrs.echo || attrs.eval === false) {
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

//  -----------------------------------------------------------------

// Based on https://github.com/Bioruebe/markdown-it-variable

function renderVariable(tokens: Token[], idx: number, _options: Options, _env: unknown, _self: Renderer) {
    console.log("renderVariable");
    const token = tokens[idx];
    return appendNodeComponent(token.content, { type: "js", hidden: false });
}

function skipWhitespace(state: StateInline | StateBlock, pos: number, max: number) {
    for (; pos < max; pos++) {
        const code = state.src.charCodeAt(pos);
        if (!state.md.utils.isSpace(code)) break;
    }

    return pos;
}

const DOLLAR = 0x24;
const CURLEY_OPEN = 0x7B;
const CURLEY_CLOSE = 0x7D;

function parseVariableRef(state: StateInline | StateBlock, stateEx: { pos: number, posMax: number }, silent: boolean) {

    const start = stateEx.pos;
    const max = stateEx.posMax;
    // ${ var }
    // ^^ Require opening markers
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

    stateEx.pos = pos + 1;
    return true;
}

// function parseVariableRefBlock(state: StateBlock, startLine: number, _endLine: number, silent: boolean) {
//     const start = state.bMarks[startLine] + state.tShift[startLine];
//     const max = state.eMarks[startLine];
//     return parseVariableRef(state, { pos: start, posMax: max }, silent);
// }

function parseVariableRefInline(state: StateInline, silent: boolean) {
    return parseVariableRef(state, state, silent);
}

function hookTemplateLiterls(md: MarkdownIt) {
    md.renderer.rules.variable = (tokens: Token[], idx: number, options: any, env: any, self: Renderer) => renderVariable(tokens, idx, options, env, self);
    // md.block.ruler.before("reference", "variables_def", (state: StateBlock, startLine: number, _endLine: number, silent: boolean) => parseVariableRefBlock(state, startLine, _endLine, silent), { alt: ["paragraph", "reference"] });
    md.inline.ruler.before("text", "variables_ref", (state: StateInline, silent: boolean) => parseVariableRefInline(state, silent));
    // md.text.ruler.after("image", "variables_ref", (state: StateInline, silent: boolean) => parseVariableRefInline(state, silent));
}

//  -----------------------------------------------------------------
export interface PluginOptions {
    tmp?: string;
}

function renderPlugin(tokens: Token[], idx: number, options: Options, env: any, self: Renderer) {
    return self.renderToken(tokens, idx, options);
}

function plugin(state: StateBlock, startLine: number, endLine: number, silent: boolean) {
    return false;
}

export default function observablePlugin(md: MarkdownIt, _opt: PluginOptions = {}) {
    md.block.ruler.after("list", "my_plugin", plugin);
    md.renderer.rules.plugin_open = renderPlugin;
}
