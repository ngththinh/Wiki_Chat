"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import parse, {
  DOMNode,
  domToReact,
  Element,
  HTMLReactParserOptions,
} from "html-react-parser";
import adminService, { DetailDto } from "@/lib/adminService";

const normalizeEntityName = (value: string) =>
  value
    .trim()
    .replace(/\.(md|txt|markdown|html|htm)$/i, "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const sanitizeHtmlContent = (html: string) =>
  html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+=("[^"]*"|'[^']*')/gi, "")
    .replace(/\sjavascript:/gi, "");

const normalizeForCompare = (value: string) =>
  normalizeEntityName(value)
    .toLocaleLowerCase("vi-VN")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const stripLeadingDuplicateHeading = (html: string, personName: string) => {
  const personKey = normalizeForCompare(personName);
  if (!personKey) return html;

  const headingPattern = /^\s*<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>\s*/i;
  const match = html.match(headingPattern);
  if (!match) return html;

  const headingText = match[1]
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (normalizeForCompare(headingText) !== personKey) return html;

  return html.replace(headingPattern, "");
};

export default function DetailPersonClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const detailId = useMemo(() => {
    const rawId = searchParams.get("id");
    if (!rawId) return "";
    return decodeURIComponent(rawId);
  }, [searchParams]);

  const [detail, setDetail] = useState<DetailDto | null>(null);
  const [categoryNameById, setCategoryNameById] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDetail = async () => {
      if (!detailId) {
        setIsLoading(false);
        setDetail(null);
        return;
      }

      setIsLoading(true);
      const dbResponse = await adminService.getDetail(detailId);
      setDetail(dbResponse.success && dbResponse.data ? dbResponse.data : null);
      setIsLoading(false);
    };

    loadDetail();
  }, [detailId]);

  useEffect(() => {
    const categoryId = detail?.categoryId?.trim() || "";
    const categoryName = detail?.categoryName?.trim() || "";

    if (!categoryId || categoryName) {
      setCategoryNameById("");
      return;
    }

    let active = true;

    const loadCategoryName = async () => {
      const categoriesResponse = await adminService.getCategories();
      if (!active) return;

      if (categoriesResponse.success && categoriesResponse.data) {
        const matchedCategory = categoriesResponse.data.find(
          (item) => item.id === categoryId,
        );
        setCategoryNameById(matchedCategory?.name?.trim() || "");
      } else {
        setCategoryNameById("");
      }
    };

    void loadCategoryName();

    return () => {
      active = false;
    };
  }, [detail?.categoryId, detail?.categoryName]);

  const personName = useMemo(
    () => normalizeEntityName(detail?.title || "Danh nhân"),
    [detail?.title],
  );
  const resolvedCategoryName =
    detail?.categoryName?.trim() || categoryNameById || "Danh mục";
  const resolvedCategoryId = detail?.categoryId || "";
  const categoryHref = resolvedCategoryId
    ? `/categories/${encodeURIComponent(resolvedCategoryId)}`
    : "/#categories";
  const personContent =
    detail?.content?.trim() || detail?.description?.trim() || "";
  const renderedPersonContent = useMemo(() => {
    if (!personContent) return "";

    const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(personContent);
    const normalizedContent = hasHtmlTags
      ? personContent
      : personContent.replace(/\n/g, "<br />");

    const sanitized = sanitizeHtmlContent(normalizedContent);
    return stripLeadingDuplicateHeading(sanitized, personName);
  }, [personContent, personName]);
  const parserOptions: HTMLReactParserOptions = useMemo(() => {
    const options: HTMLReactParserOptions = {
      replace: (domNode) => {
        if (!(domNode instanceof Element) || domNode.name !== "a") {
          return;
        }

        const href = domNode.attribs?.href || "#";
        const isExternalLink = /^https?:\/\//i.test(href);
        const existingClass = domNode.attribs?.class || "";
        const mergedClass = [existingClass, "wiki-inline-link", "text-blue-600"]
          .filter(Boolean)
          .join(" ");

        return (
          <a
            {...domNode.attribs}
            href={href}
            className={mergedClass}
            target={isExternalLink ? "_blank" : undefined}
            rel={isExternalLink ? "noreferrer" : undefined}
          >
            {domToReact(domNode.children as unknown as DOMNode[], options)}
          </a>
        );
      },
    };

    return options;
  }, []);
  const parsedPersonContent = useMemo(() => {
    if (!renderedPersonContent) return null;
    return parse(renderedPersonContent, parserOptions);
  }, [renderedPersonContent, parserOptions]);
  const hasEmbeddedInfobox = useMemo(
    () =>
      /<(table|div)[^>]*class=["'][^"']*\binfobox\b/i.test(
        renderedPersonContent,
      ),
    [renderedPersonContent],
  );
  const wikipediaUrl = detail?.wikipediaUrl?.trim() || "";
  const thumbnailUrl = detail?.thumbnailUrl?.trim() || "";
  const createdDate = detail?.createdAt
    ? new Date(detail.createdAt).toLocaleDateString("vi-VN")
    : "Không rõ";

  return (
    <main className="wiki-detail-page min-h-screen">
      <div className="wiki-detail-shell mx-auto max-w-[1280px] px-3 sm:px-5 py-6 sm:py-8">
        <header className="wiki-top-header">
          <h1 className="wiki-main-title">{personName}</h1>
          <div className="wiki-top-actions">
            <button
              type="button"
              className="wiki-top-link"
              onClick={() => {
                if (window.history.length > 1) {
                  router.back();
                  return;
                }

                router.push(categoryHref);
              }}
            >
              Quay lại trang trước
            </button>
          </div>
        </header>

        <nav className="wiki-tabs" aria-label="Điều hướng bài viết">
          <span className="wiki-tab wiki-tab-active">Bài viết</span>
        </nav>

        {isLoading ? (
          <div className="animate-pulse py-8 space-y-3">
            <div className="h-8 w-72 bg-slate-200" />
            <div className="h-4 w-full bg-slate-200" />
            <div className="h-4 w-[92%] bg-slate-200" />
            <div className="h-4 w-[86%] bg-slate-200" />
          </div>
        ) : !detail ? (
          <section className="wiki-article-wrap py-12 text-center">
            <p className="wiki-not-found-title">Không tìm thấy danh nhân</p>
            <p className="wiki-not-found-desc">
              Dữ liệu chi tiết có thể đã bị thay đổi hoặc chưa sẵn sàng.
            </p>
          </section>
        ) : (
          <section className="wiki-content-grid">
            <article className="wiki-article-wrap">
              {!hasEmbeddedInfobox && (
                <aside
                  className="wiki-infobox"
                  aria-label="Thông tin danh nhân"
                >
                  <div className="wiki-infobox-title">{personName}</div>

                  {thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      alt={personName}
                      className="wiki-infobox-image"
                    />
                  ) : (
                    <div className="wiki-infobox-image-placeholder">
                      Chưa có ảnh
                    </div>
                  )}

                  <dl className="wiki-infobox-list">
                    <div className="wiki-infobox-row">
                      <dt>Danh mục</dt>
                      <dd>{resolvedCategoryName}</dd>
                    </div>
                    <div className="wiki-infobox-row">
                      <dt>Ngày tạo</dt>
                      <dd>{createdDate}</dd>
                    </div>
                    <div className="wiki-infobox-row">
                      <dt>Mã chi tiết</dt>
                      <dd className="wiki-mono">{detail.id}</dd>
                    </div>
                  </dl>
                </aside>
              )}

              <p className="wiki-lead-line">
                <strong>{personName}</strong> là một nhân vật thuộc danh mục{" "}
                <Link href={categoryHref} className="wiki-inline-link">
                  {resolvedCategoryName}
                </Link>
                .
              </p>

              {wikipediaUrl && (
                <p className="wiki-source-line">
                  Nguồn tham khảo:{" "}
                  <a
                    href={wikipediaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="wiki-inline-link"
                  >
                    {wikipediaUrl}
                  </a>
                </p>
              )}

              {parsedPersonContent && (
                <div className="detail-html-content wiki-detail-content">
                  {parsedPersonContent}
                </div>
              )}
            </article>
          </section>
        )}
      </div>
    </main>
  );
}
