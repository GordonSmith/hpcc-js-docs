// https://vitepress.dev/guide/custom-theme
import { h } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import NodeComponent from "./NodeComponent.vue";
import NotebookComponent from "./NotebookComponent.vue";
import "./style.css";

export default {
    extends: DefaultTheme,
    Layout: () => {
        return h(DefaultTheme.Layout, null, {
            // https://vitepress.dev/guide/extending-default-theme#layout-slots
        });
    },
    enhanceApp({ app }) {
        app.component("NodeComponent", NodeComponent);
        app.component("NotebookComponent", NotebookComponent);
    },

} satisfies Theme;
