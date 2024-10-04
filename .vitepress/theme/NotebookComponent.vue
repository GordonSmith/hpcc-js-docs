<template>
    <div>
    </div>
</template>

<script>
import { compile } from "@hpcc-js/observablehq-compiler";
import { Runtime, Library, Inspector } from "@observablehq/runtime";
import { useGlobalState } from './useGlobalState.ts';

export default {
    name: 'NotebookComponent',
    props: {
    },
    setup(props) {
        const { getAll } = useGlobalState();
        return { getAll };
    },
    data() {
        return {
            loading: true
        };
    },
    async created() {
        const displayIndex = {};
        const nb = { nodes: [], files: [] };
        for (const pair of this.getAll()) {
            nb.nodes.push({
                id: pair[0],
                name: pair[0],
                mode: "js",
                value: pair[1].value
            });
            displayIndex[pair[0]] = pair[1].display;
        }
        const define = await compile(nb);
        const runtime = new Runtime(new Library());
        runtime.module(define, name => {
            define(runtime, (name, id) => {
                const placeholder = globalThis?.document?.getElementById(id);
                if (placeholder && displayIndex[id]) {
                    return new Inspector(placeholder);
                }
                return {
                    pending() { console.info("pending", id, name); },
                    fulfilled(value) { console.info("fulfilled", id, name, value); },
                    rejected(error) { console.error("rejected", id, name, error); },
                };
            });
        });
    }
};
</script>

<style scoped>
/* Add your styles here */
</style>