import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react-swc";

// function myPlugin() {
//     const virtualModuleId = "virtual:my-module";
//     const resolvedVirtualModuleId = "\0" + virtualModuleId;

//     return {
//         name: "my-plugin", // required, will show up in warnings and errors
//         resolveId(id) {
//             if (id === virtualModuleId) {
//                 return resolvedVirtualModuleId;
//             }
//         },
//         load(id) {
//             if (id === resolvedVirtualModuleId) {
//                 return "export const msg = \"from virtual module\"";
//             }
//         },
//     };
// }

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        // myPlugin()
        //        react()
    ]
});
