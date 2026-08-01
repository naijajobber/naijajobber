"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createAdminBlogPost,
  createAdminCmsPage,
  createAdminLearning,
  deleteAdminBlogPost,
  deleteAdminCmsPage,
  deleteAdminLearning,
  listAdminBlogPosts,
  listAdminCmsPages,
  listAdminLearning,
} from "@/lib/admin-api";

export default function AdminCmsPage() {
  const qc = useQueryClient();
  const pagesQ = useQuery({
    queryKey: ["admin-cms-pages"],
    queryFn: listAdminCmsPages,
  });
  const blogQ = useQuery({
    queryKey: ["admin-blog"],
    queryFn: listAdminBlogPosts,
  });
  const learningQ = useQuery({
    queryKey: ["admin-learning"],
    queryFn: listAdminLearning,
  });

  const [pageSlug, setPageSlug] = useState("");
  const [pageTitle, setPageTitle] = useState("");
  const [pageBody, setPageBody] = useState("");
  const [blogSlug, setBlogSlug] = useState("");
  const [blogTitle, setBlogTitle] = useState("");
  const [blogBody, setBlogBody] = useState("");
  const [learnTitle, setLearnTitle] = useState("");
  const [learnBody, setLearnBody] = useState("");

  return (
    <div className="mx-auto max-w-3xl space-y-12">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          CMS
        </h1>
        <p className="mt-1 text-sm text-muted">
          Pages, blog posts, and learning items.
        </p>
      </div>

      <section>
        <h2 className="text-lg font-semibold">Pages</h2>
        <div className="mt-3 space-y-2">
          {(pagesQ.data?.data ?? []).map((p) => (
            <div
              key={p._id}
              className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium">{p.title}</p>
                <p className="text-xs text-muted">
                  /{p.slug} · {p.status}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  await deleteAdminCmsPage(p._id);
                  void qc.invalidateQueries({ queryKey: ["admin-cms-pages"] });
                }}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
        <form
          className="mt-4 space-y-2"
          onSubmit={async (e) => {
            e.preventDefault();
            await createAdminCmsPage({
              slug: pageSlug,
              title: pageTitle,
              bodyHtml: pageBody,
              status: "PUBLISHED",
            });
            setPageSlug("");
            setPageTitle("");
            setPageBody("");
            void qc.invalidateQueries({ queryKey: ["admin-cms-pages"] });
          }}
        >
          <Input
            placeholder="slug"
            value={pageSlug}
            onChange={(e) => setPageSlug(e.target.value)}
            required
          />
          <Input
            placeholder="title"
            value={pageTitle}
            onChange={(e) => setPageTitle(e.target.value)}
            required
          />
          <textarea
            className="min-h-[80px] w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
            placeholder="HTML body"
            value={pageBody}
            onChange={(e) => setPageBody(e.target.value)}
          />
          <Button type="submit">Create page</Button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Blog</h2>
        <div className="mt-3 space-y-2">
          {(blogQ.data?.data ?? []).map((p) => (
            <div
              key={p._id}
              className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium">{p.title}</p>
                <p className="text-xs text-muted">
                  /{p.slug} · {p.status}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  await deleteAdminBlogPost(p._id);
                  void qc.invalidateQueries({ queryKey: ["admin-blog"] });
                }}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
        <form
          className="mt-4 space-y-2"
          onSubmit={async (e) => {
            e.preventDefault();
            await createAdminBlogPost({
              slug: blogSlug,
              title: blogTitle,
              bodyMarkdown: blogBody,
              status: "PUBLISHED",
            });
            setBlogSlug("");
            setBlogTitle("");
            setBlogBody("");
            void qc.invalidateQueries({ queryKey: ["admin-blog"] });
          }}
        >
          <Input
            placeholder="slug"
            value={blogSlug}
            onChange={(e) => setBlogSlug(e.target.value)}
            required
          />
          <Input
            placeholder="title"
            value={blogTitle}
            onChange={(e) => setBlogTitle(e.target.value)}
            required
          />
          <textarea
            className="min-h-[80px] w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
            placeholder="Markdown body"
            value={blogBody}
            onChange={(e) => setBlogBody(e.target.value)}
          />
          <Button type="submit">Create post</Button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Learning</h2>
        <div className="mt-3 space-y-2">
          {(learningQ.data?.data ?? []).map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-muted">{item.type}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  await deleteAdminLearning(item._id);
                  void qc.invalidateQueries({ queryKey: ["admin-learning"] });
                }}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
        <form
          className="mt-4 space-y-2"
          onSubmit={async (e) => {
            e.preventDefault();
            await createAdminLearning({
              title: learnTitle,
              body: learnBody,
              type: "ARTICLE",
            });
            setLearnTitle("");
            setLearnBody("");
            void qc.invalidateQueries({ queryKey: ["admin-learning"] });
          }}
        >
          <Input
            placeholder="title"
            value={learnTitle}
            onChange={(e) => setLearnTitle(e.target.value)}
            required
          />
          <textarea
            className="min-h-[80px] w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
            placeholder="body"
            value={learnBody}
            onChange={(e) => setLearnBody(e.target.value)}
            required
          />
          <Button type="submit">Create learning item</Button>
        </form>
      </section>
    </div>
  );
}
