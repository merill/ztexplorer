import { useEffect, useRef, useCallback } from 'react';
import { Transformer } from 'markmap-lib';
import { Markmap, deriveOptions } from 'markmap-view';
import type { MindmapNode } from '@/types';

interface MarkmapProps {
  root: MindmapNode;
  theme: 'light' | 'dark';
  onLinkClick?: (href: string) => void;
}

function nodeToMarkdown(node: MindmapNode, depth: number = 0): string {
  const indent = '#'.repeat(depth + 1);
  const iconImg = node.icon
    ? `<img src="/icons/${node.icon}" width="20" height="20" style="vertical-align:middle" />`
    : '';

  const label = node.link
    ? `${iconImg} [${node.name}](${node.link})`
    : `${iconImg} ${node.name}`;

  let md = `${indent} ${label}\n`;

  if (node.children) {
    for (const child of node.children) {
      md += nodeToMarkdown(child, depth + 1);
    }
  }
  return md;
}

const transformer = new Transformer();

export default function MarkmapView({ root, theme, onLinkClick }: MarkmapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const mmRef = useRef<Markmap | null>(null);
  const onLinkClickRef = useRef(onLinkClick);
  onLinkClickRef.current = onLinkClick;

  const renderMarkmap = useCallback(() => {
    if (!svgRef.current) return;

    if (mmRef.current) {
      mmRef.current.destroy();
      mmRef.current = null;
      while (svgRef.current.firstChild) {
        svgRef.current.removeChild(svgRef.current.firstChild);
      }
    }

    const markdown = nodeToMarkdown(root);
    const { root: markmapRoot } = transformer.transform(markdown);

    const textColor = theme === 'dark' ? '#e8eaed' : '#1f2937';
    const linkColor = theme === 'dark' ? '#93b4ff' : '#2563eb';
    const circleOpenBg = theme === 'dark' ? '#444' : '#fff';
    const codeBg = theme === 'dark' ? '#1a1b26' : '#f0f0f0';
    const codeColor = theme === 'dark' ? '#ddd' : '#555';

    const styleStr = `
      .markmap {
        --markmap-text-color: ${textColor};
        --markmap-a-color: ${linkColor};
        --markmap-a-hover-color: ${linkColor};
        --markmap-circle-open-bg: ${circleOpenBg};
        --markmap-code-bg: ${codeBg};
        --markmap-code-color: ${codeColor};
      }
      .markmap-foreign a {
        text-decoration: none !important;
      }
    `;

    const jsonOpts = {
      colorFreezeLevel: 2,
      initialExpandLevel: 2,
      maxWidth: 300,
      duration: 300,
      zoom: true,
      pan: true,
    };

    const opts = {
      ...deriveOptions(jsonOpts),
      style: () => styleStr,
    };

    mmRef.current = Markmap.create(svgRef.current, opts, markmapRoot);
  }, [root, theme]);

  // Intercept link clicks inside the mindmap SVG
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href) return;

      if (onLinkClickRef.current) {
        e.preventDefault();
        e.stopPropagation();
        onLinkClickRef.current(href);
      }
    };

    svg.addEventListener('click', handleClick, true);
    return () => svg.removeEventListener('click', handleClick, true);
  }, []);

  useEffect(() => {
    renderMarkmap();
  }, [renderMarkmap]);

  useEffect(() => {
    const handleResize = () => {
      mmRef.current?.fit();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <svg
      ref={svgRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
}
