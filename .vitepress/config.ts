import { defineConfig } from "vitepress";
import { eclLang } from "./shiki-ecl.ts";
import observablePlugin from "./markdown.ts";

// https://vitepress.dev/reference/site-config
export default async () => {

    return defineConfig({
        title: "@hpcc-js/docs",
        description: "A VitePress Site",
        base: "/hpcc-js-docs/",
        lastUpdated: true,
        themeConfig: {
            // https://vitepress.dev/reference/default-theme-config
            nav: [
                { text: "Home", link: "/" },
                { text: "Examples", link: "examples/hello-world" }
            ],

            sidebar: [
                {
                    text: "Examples",
                    items: [
                        { text: "Hello World", link: "examples/hello-world" },
                        {
                            text: "plot",
                            items: [
                                { text: "Test", link: "examples/plot/test" },
                                { text: "Diverging color scatterplot", link: "examples/plot/Diverging color scatterplot" },
                                { text: "US bubble map", link: "examples/plot/US bubble map" },
                            ]
                        }
                    ]
                }
            ],

            socialLinks: [
                { icon: "github", link: "https://github.com/GordonSmith/hpcc-js-docs" }
            ],

        },
        markdown: {
            // https://github.com/vuejs/vitepress/blob/main/src/node/markdown/markdown.ts
            config: md => {
                md.use(observablePlugin, { vitePress: true });
            },

            languages: [eclLang()],
        },

        vite: {
        }

    });
};
