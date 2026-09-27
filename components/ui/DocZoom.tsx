"use client";

import { useEffect } from "react";

/**
 * 正文图片点击放大。
 *
 * 与 DocGallery / CodeCopy 同一范式：正文是构建期编译好的 HTML，
 * 这里在客户端挂载后用「事件委托」接管点击，不改任何一篇 md，也不动渲染管线。
 * 浮层直接挂到 document.body 下，因此不受 .page-enter 动画 transform 的影响
 * （transform 会给 fixed 子孙创建 containing block，第十九轮踩过这个坑）。
 *
 * 无 JS 时图片照常显示，只是不能点开放大——不存在内容丢失。
 */
export default function DocZoom() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".doc-body");
    if (!root) return;

    let overlay: HTMLDivElement | null = null;
    let lastFocus: HTMLElement | null = null;

    /** 可放大的图：正文里的图，排除图集右上角的缩略图（那是切换按钮） */
    const isZoomable = (el: Element | null): el is HTMLImageElement =>
      !!el && el.tagName === "IMG" && !el.closest(".doc-gallery__thumbs");

    const close = () => {
      if (!overlay) return;
      overlay.remove();
      overlay = null;
      document.body.style.overflow = "";
      const back = lastFocus;
      lastFocus = null;
      back?.focus?.();
    };

    const open = (img: HTMLImageElement) => {
      close();
      lastFocus = document.activeElement as HTMLElement | null;

      const label = (img.alt || "").trim();

      overlay = document.createElement("div");
      overlay.className = "doc-lightbox";
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
      overlay.setAttribute("aria-label", label ? `图片放大：${label}` : "图片放大预览");

      const big = document.createElement("img");
      big.className = "doc-lightbox__img";
      big.src = img.currentSrc || img.src;
      big.alt = label;
      overlay.appendChild(big);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "doc-lightbox__close";
      btn.setAttribute("aria-label", "关闭图片预览");
      btn.textContent = "✕ 关闭（Esc）";
      btn.addEventListener("click", close);
      overlay.appendChild(btn);

      // 点浮层空白处关闭（点图片本身不关）
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) close();
      });

      document.body.appendChild(overlay);
      document.body.style.overflow = "hidden";
      btn.focus();
    };

    const onClick = (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (!t) return;
      if (overlay) return; // 浮层已打开时交给浮层自己的监听处理
      if (root.contains(t) && isZoomable(t)) {
        e.preventDefault();
        open(t);
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (overlay) {
          e.preventDefault();
          close();
        }
        return;
      }
      if (overlay) return;
      if (e.key !== "Enter" && e.key !== " ") return;
      const t = e.target as Element | null;
      if (t && root.contains(t) && isZoomable(t)) {
        e.preventDefault();
        open(t);
      }
    };

    // keydown 挂在 document 上：浮层打开后焦点在关闭按钮里（不在 .doc-body 内），
    // 挂 root 会收不到 Esc
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);

    // 让正文图片可键盘聚焦（无障碍）；图集折叠后 img 仍在 DOM 中，标记不会丢
    const marked: HTMLImageElement[] = [];
    root.querySelectorAll("img").forEach((node) => {
      const img = node as HTMLImageElement;
      if (img.closest(".doc-gallery__thumbs")) return;
      if (img.dataset.zoomReady === "1") return;
      img.dataset.zoomReady = "1";
      img.tabIndex = 0;
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", img.alt ? `放大查看：${img.alt}` : "放大查看图片");
      marked.push(img);
    });

    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
      for (const img of marked) {
        delete img.dataset.zoomReady;
        img.removeAttribute("tabindex");
        img.removeAttribute("role");
        img.removeAttribute("aria-label");
      }
      close();
    };
  }, []);

  return null;
}
