// import { ohq, compile } from "@hpcc-js/observablehq-compiler";
// import { Runtime, Library } from "@observablehq/runtime";
// import { ref, computed } from "vue";

interface Content {
    value: string;
    display: boolean;
}
const cells = new Map<string, Content>();

const set = (id: string, value: string, display: boolean) => {
    cells.set(id, { value, display });
};

const del = (id: string) => {
    cells.delete(id);
};

const getAll = () => {
    return cells.entries();
};

export function useGlobalState() {
    return {
        set,
        getAll,
        del,
    };
}