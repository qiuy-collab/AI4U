import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DOCS, getAdjacent, getDoc } from "@/content/docs";
import type { TocItem } from "@/content/docs";
import CodeCopy from "@/components/ui/CodeCopy";
import DocGallery from "@/components/ui/DocGallery";
import TocSpy from "@/components/ui/TocSpy";

/** 两级目录列表（H2 章 + H3 节缩进），桌面侧栏与移动端抽屉共用 */
function TocList({ items }: { items: TocItem[] }) {
  return (
    <ul>
      {items.map((h) => (
        <li key={h.id}>
          <a href={`#${h.id}`}>{h.text}</a>
          {h.children.length > 0 && (
            <ul>
              {h.children.map((c) => (
                <li key={c.id}>
                  <a href={`#${c.id}`}>{c.text}</a>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

export function generateStaticParams() {
  return DOCS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) return {};
  return {
    title: doc.title,
    description: doc.summary,
  };
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) notFound();

  const { prev, next } = getAdjacent(slug);

  return (
    <div className="doc-page gutter">
      {/* 阅读进度：CSS scroll-driven（rung 1.5），不支持的浏览器直接没有这条线 */}
      <div className="doc-progress" aria-hidden="true" />

      <article className="doc-main">
        <header>
          <Link href="/docs" className="doc-back">← 返回内容列表</Link>
          <h1 className="doc-title">{doc.title}</h1>
          <p className="doc-summary">{doc.summary}</p>
        </header>
        {/* 移动端目录悬浮钮（桌面 display:none，桌面走右侧 sticky 目录）：
            details/summary 原生可弹出可收起，零客户端 JS；
            钮 fixed 在右下角，点开的目录面板浮出在其上方（样式见 .doc-toc-drawer） */}
        {doc.toc.length > 0 && (
          <details className="doc-toc-drawer">
            <summary className="doc-toc-drawer__label mono">目录</summary>
            <nav aria-label="本页目录（移动端）">
              <TocList items={doc.toc} />
            </nav>
          </details>
        )}
        {/* 正文 HTML 构建期由 markdown 编译生成（remark 管线），来源仅本仓库 content/docs/*.md */}
        <div className="doc-body" dangerouslySetInnerHTML={{ __html: doc.html }} />
        {/* 代码块「复制」按钮：客户端注入（components/ui/CodeCopy.tsx） */}
        <CodeCopy />
        {/* 连续多图折叠成图集：一张主图 + 右上角缩略图切换（components/ui/DocGallery.tsx） */}
        <DocGallery />
        <nav className="doc-adjacent" aria-label="上一篇下一篇">
          {prev ? (
            <Link href={`/docs/${prev.slug}`} rel="prev">← 上一篇：{prev.title}</Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/docs/${next.slug}`} rel="next">下一篇：{next.title} →</Link>
          ) : (
            <span />
          )}
        </nav>
      </article>

      {doc.toc.length > 0 && (
        <aside className="doc-toc" aria-label="本页目录">
          <p className="doc-toc__label">本页目录</p>
          <nav>
            <TocList items={doc.toc} />
          </nav>
        </aside>
      )}
      {/* 目录当前章节高亮（桌面侧栏，aria-current 唯一激活） */}
      <TocSpy />
    </div>
  );
}
