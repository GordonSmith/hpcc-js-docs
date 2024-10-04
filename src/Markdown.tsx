import React from "react";
import { darkMD, MarkdownEx } from "./markdown.ts";

export interface MarkdownProps {
    markdown: string;
}

export const Markdown: React.FunctionComponent<MarkdownProps> = ({
    markdown
}) => {

    const [md, setMd] = React.useState<MarkdownEx>();
    const [html, setHtml] = React.useState("");

    React.useEffect(() => {
        darkMD().then(darkMD => {
            setMd(new MarkdownEx(darkMD));
        });
    }, []);

    React.useEffect(() => {
        setHtml(md?.transpile(markdown) ?? "");
    }, [md, markdown]);

    return <div dangerouslySetInnerHTML={{ __html: html }} style={{ minWidth: 800, textAlign: "left" }} />;
};
