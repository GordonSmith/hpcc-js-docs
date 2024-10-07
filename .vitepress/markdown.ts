import type MarkdownIt from "markdown-it";
import type { Options, } from "markdown-it";
import type Token from "markdown-it/lib/token.mjs";
import type Renderer from "markdown-it/lib/renderer.mjs";
import type StateBlock from "markdown-it/lib/rules_block/state_block.mjs";
import type StateInline from "markdown-it/lib/rules_inline/state_inline.mjs";

// import type { Options, Renderer, StateBlock, StateInline, Token } from "markdown-it";
import { Runtime, Library, Inspector } from "@observablehq/runtime";
import { ojs2notebook, compile, type ohq } from "@hpcc-js/observablehq-compiler";

interface FenceInfo {
    type?: "js" | "javascript" | string;
    eval?: boolean;
    echo?: boolean;
    hidden?: boolean;
}

interface ObservableNode extends FenceInfo {
    id: string;
    content: string;
    innerHTML?: string;
}

export async function observableRuntime(nodes: ObservableNode[]) {
    const displayIndex: { [key: string]: boolean } = {};
    const nb: ohq.Notebook = { nodes: [], files: [] };
    for (const node of nodes) {
        nb.nodes.push({
            id: node.id,
            name: node.id,
            mode: "js",
            value: node.content
        });
        displayIndex[node.id] = node.hidden !== true;
    }
    const define = await compile(nb);
    const runtime = new Runtime(new Library());
    runtime.module(define, () => {
        define(runtime, (_name: string | undefined, id: string | number) => {
            const placeholder = globalThis?.document?.getElementById("" + id);
            if (placeholder && displayIndex[id]) {
                return new Inspector(placeholder);
            }
            return {
                pending() { },// console.info("pending", id, name); },
                fulfilled(_value: any, _name?: string) { },// console.info("fulfilled", id, name, value); },
                rejected(_error: any, _name?: string) { },// console.error("rejected", id, name, error); },
            };
        });
    });
}

const ENV_KEY = "ENV_OBSERVABLE";

//  -----------------------------------------------------------------

function hookRender(md: MarkdownIt) {
    const originalRender = md.render;
    md.render = (src: string, _env?: any): string => {
        const env = { ..._env };
        const retVal = originalRender.call(md, src, env);
        observableRuntime(env[ENV_KEY] ?? []);
        return retVal;
    };
}

function hookVitepressRender(md: MarkdownIt) {

    const originalRender = md.render;
    md.render = (src: string, _env?: any): string => {
        const env = { ..._env };
        let retVal = originalRender.call(md, src, env);
        retVal += `<ObservableRuntime content="${encodeURI(JSON.stringify(env[ENV_KEY] ?? []))}" />`;
        return retVal;
    };
}

// const serializeFenceInfo = (attrs: FenceInfo) =>
//     Object
//         .entries(attrs)
//         .map(([key, value]) => `${ key }=${ value } `)
//         .join(";")
//     ;

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
        }, { eval: true, echo: false, hidden: false })
    ;

let idx = 0;
function calcPlaceholders(content: string, fenceInfo: FenceInfo): ObservableNode[] {
    const retVal: ObservableNode[] = [];
    ++idx;
    try {
        const cellNb = ojs2notebook(content);
        for (let i = 0; i < cellNb.nodes.length; ++i) {
            const id = `fence - ${idx} -${i + 1} `;
            const content = cellNb.nodes[i].value;
            retVal.push({
                ...fenceInfo,
                id,
                content,
                innerHTML: `\
        <span id="${id}" >
            ${content}
        </span>`
            });
        }
    } catch (e: any) {
        const id = `fence-${idx}-error`;
        retVal.push({
            ...fenceInfo,
            id,
            content: JSON.stringify(e),
            innerHTML: `\
<span id="${id}" >
    ${content}
</span>`
        });
    }
    return retVal;
}

function generatePlaceholders(content: string, fenceInfo: FenceInfo, env: any): string {
    if (!env[ENV_KEY]) {
        env[ENV_KEY] = [];
    }
    return calcPlaceholders(content, fenceInfo).reduce((acc, cur) => {
        env[ENV_KEY]!.push({ ...cur, innerHTML: undefined });
        return acc + cur.innerHTML;
    }, "");
}

//  -----------------------------------------------------------------

const proxy = (tokens: Token[], idx: number, options: Options, _env: any, self: Renderer) => self.renderToken(tokens, idx, options);

function hookFence(md: MarkdownIt) {
    const defaultFenceRenderer = md.renderer.rules.fence || proxy;
    const fenceRenderer = (tokens: Token[], idx: number, options: Options, env: { [ENV_KEY]?: ObservableNode[] }, self: Renderer) => {
        const token = tokens[idx];
        const fenceInfo = deserializeFenceInfo(token.info);
        if (fenceInfo.type === "javascript") {
            fenceInfo.type = "js";
        }
        token.content += "\n";
        let preHtml = "";
        switch (fenceInfo.type) {
            case "js":
                if (fenceInfo.eval) {
                    if (!env[ENV_KEY]) {
                        env[ENV_KEY] = [];
                    }
                    preHtml += generatePlaceholders(token.content, fenceInfo, env);
                }
                if (fenceInfo.echo || fenceInfo.eval === false) {
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

function renderObservable(tokens: Token[], idx: number, _options: Options, env: any, _self: Renderer) {
    return generatePlaceholders(tokens[idx].content, { type: "js", hidden: false }, env);
}

const DOLLAR = 0x24;
const CURLEY_OPEN = 0x7B;
const CURLEY_CLOSE = 0x7D;

function parseObservableRef(state: StateInline | StateBlock, stateEx: { pos: number, posMax: number }, silent: boolean) {

    const start = stateEx.pos;
    const max = stateEx.posMax;

    if (state.src.charCodeAt(start) !== DOLLAR || state.src.charCodeAt(start + 1) !== CURLEY_OPEN) {
        return false;
    }
    let pos = start + 2;

    const observableStart = pos;
    let nestedCurly = 0;
    let done = false;
    while (!done && pos < max) {
        switch (state.src.charCodeAt(pos)) {
            case CURLEY_OPEN:
                nestedCurly++;
                break;
            case CURLEY_CLOSE:
                if (nestedCurly === 0) {
                    done = true;
                    --pos;
                } else {
                    nestedCurly--;
                }
                break;
        }
        pos++
    }
    const observableEnd = pos;
    if (pos >= max || observableStart == observableEnd) return false;

    if (state.src.charCodeAt(pos) !== CURLEY_CLOSE) return false;

    const observableJs = state.src.slice(observableStart, observableEnd).trim();

    if (!silent) {
        const token = state.push("observable", "", 0);

        token.block = true;
        token.content = observableJs;

        // token.children = state.env.variables[variableName].tokens;
    }

    stateEx.pos = pos + 1;
    return true;
}

// function parseObservableRefBlock(state: StateBlock, startLine: number, _endLine: number, silent: boolean) {
//     const start = state.bMarks[startLine] + state.tShift[startLine];
//     const max = state.eMarks[startLine];
//     return parseObservableRef(state, { pos: start, posMax: max }, silent);
// }

function parseObservableRefInline(state: StateInline, silent: boolean) {
    return parseObservableRef(state, state, silent);
}

function hookTemplateLiterals(md: MarkdownIt) {
    md.renderer.rules.observable = (tokens: Token[], idx: number, options: any, env: any, self: Renderer) => renderObservable(tokens, idx, options, env, self);
    // md.block.ruler.before("reference", "variables_def", (state: StateBlock, startLine: number, _endLine: number, silent: boolean) => parseObservableRefBlock(state, startLine, _endLine, silent), { alt: ["paragraph", "reference"] });
    md.inline.ruler.before("text", "observable_ref", (state: StateInline, silent: boolean) => parseObservableRefInline(state, silent));
    // md.text.ruler.after("image", "variables_ref", (state: StateInline, silent: boolean) => parseObservableRefInline(state, silent));
}

//  -----------------------------------------------------------------
export interface ObservablePluginOptions {
    vitePress?: boolean;
}

// function renderPlugin(tokens: Token[], idx: number, options: Options, env: any, self: Renderer) {
//     return self.renderToken(tokens, idx, options);
// }

// function plugin(state: StateBlock, startLine: number, endLine: number, silent: boolean) {
//     return false;
// }

export default function observablePlugin(md: MarkdownIt, opts: ObservablePluginOptions = {}) {
    hookTemplateLiterals(md);
    hookFence(md);
    if (opts.vitePress) {
        hookVitepressRender(md);
    } else {
        hookRender(md);
    }
    // md.block.ruler.after("list", "my_plugin", plugin);
    // md.renderer.rules.plugin_open = renderPlugin;
}
