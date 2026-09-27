"use client";

import { useEffect } from "react";

/**
 * 把正文里「连续排列的多张图片」折叠成图集：一次只显示一张，
 * 右上角一排缩略图可点选切换。
 *
 * 正文是构建期由 markdown 编译好的 HTML（dangerouslySetInnerHTML），
 * 所以在客户端挂载后用 DOM 注入（与 CodeCopy 同一范式），不改每篇 md。
 * 没有启用 JS 时这些节点不会生成，正文保持原样——图片照常逐张显示，
 * 不存在「内容丢失」的降级。
 */
export default function DocGallery() {
  useEffect(() => {
    const body = document.querySelector<HTMLElement>(".doc-body");
    if (!body) return;

    /** 纯图片段落：只含一张图、没有可见文字 */
    const isImagePara = (el: Element): el is HTMLParagraphElement =>
      el.tagName === "P" &&
      el.querySelectorAll("img").length === 1 &&
      (el.textContent ?? "").trim() === "";

    // 收拢「连续」的纯图片段落：中间隔着任何其它节点就断开成两组
    const groups: HTMLParagraphElement[][] = [];
    let run: HTMLParagraphElement[] = [];
    for (const el of Array.from(body.children)) {
      if (isImagePara(el)) {
        run.push(el);
      } else {
        if (run.length > 1) groups.push(run);
        run = [];
      }
    }
    if (run.length > 1) groups.push(run);
    if (groups.length === 0) return;

    const built: {
      figure: HTMLElement;
      paras: HTMLParagraphElement[];
      imgs: HTMLImageElement[];
    }[] = [];

    for (const paras of groups) {
      const imgs = paras.map(
        (p) => p.querySelector("img") as HTMLImageElement,
      );

      const figure = document.createElement("figure");
      figure.className = "doc-gallery";
      figure.setAttribute("role", "group");
      figure.setAttribute(
        "aria-label",
        `图片组，共 ${imgs.length} 张，用右上角的缩略图切换`,
      );

      const stage = document.createElement("div");
      stage.className = "doc-gallery__stage";

      const thumbs = document.createElement("div");
      thumbs.className = "doc-gallery__thumbs";

      let buttons: HTMLButtonElement[] = [];

      const select = (i: number) => {
        imgs.forEach((img, k) => img.classList.toggle("is-active", k === i));
        buttons.forEach((b, k) => {
          b.classList.toggle("is-active", k === i);
          if (k === i) b.setAttribute("aria-current", "true");
          else b.removeAttribute("aria-current");
        });
      };

      imgs.forEach((img, i) => {
        img.classList.add("doc-gallery__slide");
        img.classList.toggle("is-active", i === 0);
        stage.appendChild(img);
      });

      buttons = imgs.map((img, i) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "doc-gallery__thumb";
        const label = (img.alt || "").trim();
        btn.setAttribute(
          "aria-label",
          label ? `第 ${i + 1} 张，共 ${imgs.length} 张：${label}` : `第 ${i + 1} 张，共 ${imgs.length} 张`,
        );

        const thumb = document.createElement("img");
        thumb.src = img.currentSrc || img.src;
        thumb.alt = "";
        thumb.setAttribute("aria-hidden", "true");
        btn.appendChild(thumb);

        btn.addEventListener("click", () => select(i));
        thumbs.appendChild(btn);
        return btn;
      });

      select(0);
      figure.appendChild(stage);
      figure.appendChild(thumbs);

      // figure 顶替第一个段落的位置，其余图片段落移除（img 已移入 stage）
      const first = paras[0];
      first.parentElement?.insertBefore(figure, first);
      for (const p of paras) p.remove();

      built.push({ figure, paras, imgs });
    }

    return () => {
      for (const { figure, paras, imgs } of built) {
        const parent = figure.parentElement;
        if (!parent) continue;
        // 还原：图片放回各自段落，段落插回原位，figure 删除
        imgs.forEach((img, i) => {
          img.classList.remove("doc-gallery__slide", "is-active");
          paras[i].appendChild(img);
        });
        parent.insertBefore(paras[0], figure);
        for (let i = 1; i < paras.length; i++) parent.insertBefore(paras[i], figure);
        figure.remove();
      }
    };
  }, []);

  return null;
}