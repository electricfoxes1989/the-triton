/**
 * Portable Text renderer for Sanity CMS body content.
 * Handles blocks (paragraphs, headings, blockquotes), inline marks
 * (strong, em, underline, links), and graceful fallback for string content.
 * Mobile-responsive typography with NYT-style reading experience.
 */

import React from "react";

interface PortableTextSpan {
  _key: string;
  _type: "span";
  marks: string[];
  text: string;
}

interface PortableTextMarkDef {
  _key: string;
  _type: string;
  href?: string;
}

interface PortableTextBlock {
  _key: string;
  _type: "block";
  style: string;
  markDefs: PortableTextMarkDef[];
  children: PortableTextSpan[];
}

type PortableTextContent = PortableTextBlock[] | string;

/**
 * Extract plain text from Portable Text blocks (for word count, reading time, SEO).
 */
export function portableTextToPlainText(body: PortableTextContent): string {
  if (typeof body === "string") return body;
  if (!Array.isArray(body)) return "";

  return body
    .filter((block) => block._type === "block")
    .map((block) =>
      block.children
        .filter((child) => child._type === "span")
        .map((span) => span.text)
        .join("")
    )
    .join("\n\n");
}

/**
 * Calculate word count from Portable Text content.
 */
export function portableTextWordCount(body: PortableTextContent): number {
  const text = portableTextToPlainText(body);
  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * Render a single span with its marks applied.
 */
function RenderSpan({
  span,
  markDefs,
}: {
  span: PortableTextSpan;
  markDefs: PortableTextMarkDef[];
}) {
  let element: React.ReactNode = span.text;

  for (const mark of span.marks) {
    if (mark === "strong") {
      element = <strong key={`${span._key}-strong`} className="font-semibold text-[#0A1628]">{element}</strong>;
    } else if (mark === "em") {
      element = <em key={`${span._key}-em`}>{element}</em>;
    } else if (mark === "underline") {
      element = <u key={`${span._key}-u`}>{element}</u>;
    } else if (mark === "code") {
      element = (
        <code
          key={`${span._key}-code`}
          className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-[#0A1628]"
        >
          {element}
        </code>
      );
    } else {
      const markDef = markDefs.find((md) => md._key === mark);
      if (markDef && markDef._type === "link" && markDef.href) {
        element = (
          <a
            key={`${span._key}-link`}
            href={markDef.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0A1628] underline decoration-[#3ECFB2] decoration-2 underline-offset-2 hover:decoration-[#0A1628] transition-colors"
          >
            {element}
          </a>
        );
      }
    }
  }

  return <React.Fragment key={span._key}>{element}</React.Fragment>;
}

/**
 * Render a single Portable Text block with responsive typography.
 */
function RenderBlock({
  block,
  isFirst,
}: {
  block: PortableTextBlock;
  isFirst: boolean;
}) {
  const children = block.children.map((span) => (
    <RenderSpan key={span._key} span={span} markDefs={block.markDefs} />
  ));

  switch (block.style) {
    case "h1":
      return (
        <h1
          key={block._key}
          className="text-2xl sm:text-3xl font-bold mt-8 sm:mt-12 mb-4 sm:mb-5 text-[#0A1628] font-serif"
        >
          {children}
        </h1>
      );
    case "h2":
      return (
        <h2
          key={block._key}
          className="text-xl sm:text-2xl font-bold mt-8 sm:mt-10 mb-3 sm:mb-4 text-[#0A1628] font-serif"
        >
          {children}
        </h2>
      );
    case "h3":
      return (
        <h3
          key={block._key}
          className="text-lg sm:text-xl font-bold mt-6 sm:mt-8 mb-3 text-[#0A1628] font-serif"
        >
          {children}
        </h3>
      );
    case "h4":
      return (
        <h4
          key={block._key}
          className="text-base sm:text-lg font-bold mt-5 sm:mt-6 mb-3 text-[#0A1628] font-sans"
        >
          {children}
        </h4>
      );
    case "blockquote":
      return (
        <blockquote
          key={block._key}
          className="border-l-[3px] border-[#3ECFB2] pl-4 sm:pl-6 my-6 sm:my-8 text-base sm:text-lg italic text-gray-600 leading-relaxed font-serif"
        >
          {children}
        </blockquote>
      );
    default:
      // Normal paragraph — responsive: 16px on mobile, 18px on desktop
      // Drop cap: smaller on mobile (2.5rem vs 3.5rem)
      return (
        <p
          key={block._key}
          className={`text-[#333] leading-[1.75] sm:leading-[1.85] mb-5 sm:mb-6 font-sans text-base sm:text-lg ${
            isFirst
              ? "first-letter:text-[2.5rem] sm:first-letter:text-[3.5rem] first-letter:font-bold first-letter:float-left first-letter:mr-2 sm:first-letter:mr-3 first-letter:mt-0.5 sm:first-letter:mt-1 first-letter:leading-none first-letter:text-[#0A1628] first-letter:font-serif"
              : ""
          }`}
        >
          {children}
        </p>
      );
  }
}

/**
 * Main Portable Text renderer component.
 */
export default function PortableText({
  content,
}: {
  content: PortableTextContent;
}) {
  // Handle string content (fallback for DB articles)
  if (typeof content === "string") {
    const paragraphs = content.split("\n\n").filter((p) => p.trim());
    return (
      <div className="article-body">
        {paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className={`text-[#333] leading-[1.75] sm:leading-[1.85] mb-5 sm:mb-6 font-sans text-base sm:text-lg ${
              index === 0
                ? "first-letter:text-[2.5rem] sm:first-letter:text-[3.5rem] first-letter:font-bold first-letter:float-left first-letter:mr-2 sm:first-letter:mr-3 first-letter:mt-0.5 sm:first-letter:mt-1 first-letter:leading-none first-letter:text-[#0A1628] first-letter:font-serif"
                : ""
            }`}
          >
            {paragraph}
          </p>
        ))}
      </div>
    );
  }

  // Handle Portable Text blocks
  if (!Array.isArray(content) || content.length === 0) {
    return null;
  }

  let isFirstParagraph = true;

  return (
    <div className="article-body">
      {content
        .filter((block) => block._type === "block")
        .map((block) => {
          const isFirst = isFirstParagraph && block.style === "normal";
          if (isFirst) isFirstParagraph = false;
          return (
            <RenderBlock key={block._key} block={block} isFirst={isFirst} />
          );
        })}
    </div>
  );
}
