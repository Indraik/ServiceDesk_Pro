import React, { useState } from "react";
import { Copy, Check, Terminal, FileCode } from "lucide-react";

/**
 * Helper to render inline markdown elements:
 * - `inline code`
 * - **bold**
 * - *italic*
 * - [link text](url)
 * - auto-linked URLs
 */
function renderInline(text) {
    if (!text) return null;

    // Pattern to tokenize: links, inline-code, bold, italic, raw URLs
    const tokenRegex = /(\[.*?\]\(https?:\/\/[^\s)]+\)|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|https?:\/\/[^\s]+)/g;
    const parts = text.split(tokenRegex);

    return parts.map((part, index) => {
        if (!part) return null;

        // [label](url)
        if (part.startsWith("[") && part.includes("](") && part.endsWith(")")) {
            const label = part.substring(1, part.indexOf("]("));
            const url = part.substring(part.indexOf("](") + 2, part.length - 1);
            return (
                <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="markdown-link"
                >
                    {label}
                </a>
            );
        }

        // Inline code `code`
        if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
            return (
                <code key={index} className="markdown-inline-code">
                    {part.slice(1, -1)}
                </code>
            );
        }

        // Bold **text**
        if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
            return (
                <strong key={index} className="markdown-bold">
                    {part.slice(2, -2)}
                </strong>
            );
        }

        // Italic *text*
        if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
            return (
                <em key={index} className="markdown-italic">
                    {part.slice(1, -1)}
                </em>
            );
        }

        // Raw URLs
        if (/^https?:\/\/[^\s]+$/.test(part)) {
            return (
                <a
                    key={index}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="markdown-link"
                >
                    {part}
                </a>
            );
        }

        return <React.Fragment key={index}>{part}</React.Fragment>;
    });
}

function CodeBlock({ code, language }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback if clipboard api fails
            const textArea = document.createElement("textarea");
            textArea.value = code;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const cleanLang = (language || "code").trim().toLowerCase();

    return (
        <div className="markdown-code-block">
            <div className="code-block-header">
                <div className="code-lang-tag">
                    {cleanLang === "bash" || cleanLang === "sh" || cleanLang === "shell" ? (
                        <Terminal size={12} className="code-lang-icon" />
                    ) : (
                        <FileCode size={12} className="code-lang-icon" />
                    )}
                    <span>{cleanLang}</span>
                </div>
                <button
                    type="button"
                    onClick={handleCopy}
                    className="code-copy-btn"
                    title="Copy to clipboard"
                    aria-label="Copy code snippet"
                >
                    {copied ? (
                        <>
                            <Check size={12} className="text-success" />
                            <span className="copy-text text-success">Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy size={12} />
                            <span className="copy-text">Copy</span>
                        </>
                    )}
                </button>
            </div>
            <pre className="code-block-pre">
                <code>{code}</code>
            </pre>
        </div>
    );
}

export default function MarkdownContent({ content = "", className = "" }) {
    if (!content || typeof content !== "string") {
        return null;
    }

    const lines = content.split("\n");
    const blocks = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // Code block check: ```
        if (line.trim().startsWith("```")) {
            const lang = line.trim().slice(3).trim();
            const codeLines = [];
            i++;
            while (i < lines.length && !lines[i].trim().startsWith("```")) {
                codeLines.push(lines[i]);
                i++;
            }
            // skip closing ```
            if (i < lines.length) {
                i++;
            }
            blocks.push({
                type: "code",
                language: lang || "text",
                content: codeLines.join("\n")
            });
            continue;
        }

        // Blockquote check: >
        if (line.startsWith("> ") || line === ">") {
            const quoteLines = [line.replace(/^>\s?/, "")];
            i++;
            while (i < lines.length && (lines[i].startsWith("> ") || lines[i] === ">")) {
                quoteLines.push(lines[i].replace(/^>\s?/, ""));
                i++;
            }
            blocks.push({
                type: "blockquote",
                content: quoteLines.join("\n")
            });
            continue;
        }

        // Headings: #, ##, ###
        if (line.startsWith("### ")) {
            blocks.push({ type: "h3", content: line.slice(4) });
            i++;
            continue;
        }
        if (line.startsWith("## ")) {
            blocks.push({ type: "h2", content: line.slice(3) });
            i++;
            continue;
        }
        if (line.startsWith("# ")) {
            blocks.push({ type: "h1", content: line.slice(2) });
            i++;
            continue;
        }

        // Unordered list: - or *
        if (/^[-*]\s+/.test(line)) {
            const listItems = [line.replace(/^[-*]\s+/, "")];
            i++;
            while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
                listItems.push(lines[i].replace(/^[-*]\s+/, ""));
                i++;
            }
            blocks.push({
                type: "ul",
                items: listItems
            });
            continue;
        }

        // Ordered list: 1. 2.
        if (/^\d+\.\s+/.test(line)) {
            const listItems = [line.replace(/^\d+\.\s+/, "")];
            i++;
            while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
                listItems.push(lines[i].replace(/^\d+\.\s+/, ""));
                i++;
            }
            blocks.push({
                type: "ol",
                items: listItems
            });
            continue;
        }

        // Regular paragraph or blank line
        if (line.trim() === "") {
            i++;
            continue;
        }

        // Accumulate contiguous text lines into a paragraph
        const pLines = [line];
        i++;
        while (
            i < lines.length &&
            lines[i].trim() !== "" &&
            !lines[i].trim().startsWith("```") &&
            !lines[i].startsWith("> ") &&
            !lines[i].startsWith("#") &&
            !/^[-*]\s+/.test(lines[i]) &&
            !/^\d+\.\s+/.test(lines[i])
        ) {
            pLines.push(lines[i]);
            i++;
        }

        blocks.push({
            type: "p",
            content: pLines.join("\n")
        });
    }

    return (
        <div className={`markdown-renderer ${className}`}>
            {blocks.map((block, idx) => {
                switch (block.type) {
                    case "code":
                        return (
                            <CodeBlock
                                key={idx}
                                code={block.content}
                                language={block.language}
                            />
                        );
                    case "blockquote":
                        return (
                            <blockquote key={idx} className="markdown-blockquote">
                                {renderInline(block.content)}
                            </blockquote>
                        );
                    case "h1":
                        return (
                            <h3 key={idx} className="markdown-heading-1">
                                {renderInline(block.content)}
                            </h3>
                        );
                    case "h2":
                        return (
                            <h4 key={idx} className="markdown-heading-2">
                                {renderInline(block.content)}
                            </h4>
                        );
                    case "h3":
                        return (
                            <h5 key={idx} className="markdown-heading-3">
                                {renderInline(block.content)}
                            </h5>
                        );
                    case "ul":
                        return (
                            <ul key={idx} className="markdown-list markdown-ul">
                                {block.items.map((it, itemIdx) => (
                                    <li key={itemIdx}>{renderInline(it)}</li>
                                ))}
                            </ul>
                        );
                    case "ol":
                        return (
                            <ol key={idx} className="markdown-list markdown-ol">
                                {block.items.map((it, itemIdx) => (
                                    <li key={itemIdx}>{renderInline(it)}</li>
                                ))}
                            </ol>
                        );
                    case "p":
                    default:
                        return (
                            <p key={idx} className="markdown-paragraph">
                                {renderInline(block.content)}
                            </p>
                        );
                }
            })}
        </div>
    );
}
