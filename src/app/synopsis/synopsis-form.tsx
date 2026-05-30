"use client";

import { useActionState, useMemo, useState } from "react";
import { saveSynopsisAction } from "@/actions/synopsis";
import type { ActionState } from "@/actions/types";
import { FieldErrors } from "@/components/FieldErrors";
import { MaterialIcon } from "@/components/MaterialIcon";
import { buildSynopsisMarkdown } from "@/domain/synopsis";
import type { SynopsisInput } from "@/domain/validation";

const label = "text-xs font-bold uppercase tracking-wider text-on-surface-variant";
const input =
  "mt-2 w-full rounded-t-xl border-0 border-b-2 border-outline-variant/40 bg-surface-container-lowest px-4 py-3 text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10";
const textarea =
  "mt-2 w-full resize-y rounded-xl border-0 border-b-2 border-outline-variant/40 bg-surface-container-low px-5 py-4 text-on-surface outline-none transition placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/10";

const COURSE_TOPICS = [
  "Web frameworks",
  "Quality Assurance",
  "Version Control (VCS)",
  "Deployment",
  "CI/CD",
  "Development environment / IDEs",
] as const;

export type SynopsisFormProps = {
  initial: SynopsisInput;
};

export function SynopsisForm({ initial }: SynopsisFormProps) {
  const [state, formAction, pending] = useActionState(
    saveSynopsisAction,
    null as ActionState,
  );

  const [values, setValues] = useState<SynopsisInput>(initial);
  const [copied, setCopied] = useState(false);

  const set = <K extends keyof SynopsisInput>(key: K, value: SynopsisInput[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const markdown = useMemo(() => buildSynopsisMarkdown(values), [values]);

  const canExport = values.title.trim().length > 0;

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const downloadMarkdown = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const slug =
      values.title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "synopsis";
    a.download = `${slug}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <form action={formAction} className="space-y-6">
        <div>
          <label htmlFor="title" className={label}>
            Project title
          </label>
          <input
            id="title"
            name="title"
            required
            value={values.title}
            onChange={(e) => set("title", e.target.value)}
            className={input}
          />
          <FieldErrors errors={state?.errors} name="title" />
        </div>

        <div>
          <label htmlFor="description" className={label}>
            Short project description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="What the prototype does, in a couple of sentences."
            className={textarea}
          />
          <FieldErrors errors={state?.errors} name="description" />
        </div>

        <datalist id="course-topics">
          {COURSE_TOPICS.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="topicOne" className={label}>
              Chosen topic 1
            </label>
            <input
              id="topicOne"
              name="topicOne"
              list="course-topics"
              required
              value={values.topicOne}
              onChange={(e) => set("topicOne", e.target.value)}
              className={input}
            />
            <FieldErrors errors={state?.errors} name="topicOne" />
          </div>
          <div>
            <label htmlFor="topicTwo" className={label}>
              Chosen topic 2
            </label>
            <input
              id="topicTwo"
              name="topicTwo"
              list="course-topics"
              required
              value={values.topicTwo}
              onChange={(e) => set("topicTwo", e.target.value)}
              className={input}
            />
            <FieldErrors errors={state?.errors} name="topicTwo" />
          </div>
        </div>

        <div>
          <label htmlFor="features" className={label}>
            Main prototype features
          </label>
          <textarea
            id="features"
            name="features"
            rows={4}
            value={values.features}
            onChange={(e) => set("features", e.target.value)}
            placeholder={"One per line, e.g.\nExam Mode timer\nSynopsis Builder\nReadiness dashboard"}
            className={textarea}
          />
          <FieldErrors errors={state?.errors} name="features" />
        </div>

        <div>
          <label htmlFor="technologies" className={label}>
            Technologies used
          </label>
          <textarea
            id="technologies"
            name="technologies"
            rows={2}
            value={values.technologies}
            onChange={(e) => set("technologies", e.target.value)}
            placeholder="Next.js, React, TypeScript, Tailwind, Zod, Vitest"
            className={textarea}
          />
          <FieldErrors errors={state?.errors} name="technologies" />
        </div>

        <div>
          <label htmlFor="githubUrl" className={label}>
            GitHub / deployment link
          </label>
          <input
            id="githubUrl"
            name="githubUrl"
            type="url"
            value={values.githubUrl ?? ""}
            onChange={(e) => set("githubUrl", e.target.value)}
            placeholder="https://github.com/..."
            className={input}
          />
          <FieldErrors errors={state?.errors} name="githubUrl" />
        </div>

        <div>
          <label htmlFor="reflection" className={label}>
            Reflection
          </label>
          <textarea
            id="reflection"
            name="reflection"
            rows={3}
            value={values.reflection ?? ""}
            onChange={(e) => set("reflection", e.target.value)}
            placeholder="What you learned, limitations, future improvements."
            className={textarea}
          />
          <FieldErrors errors={state?.errors} name="reflection" />
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-surface-container pt-6">
          <button
            type="submit"
            disabled={pending}
            className="academic-gradient tonal-depth rounded-xl px-8 py-3 font-headline text-sm font-bold text-on-primary transition hover:opacity-95 disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save synopsis"}
          </button>
          {state?.message ? (
            <span className="flex items-center gap-1 text-sm font-semibold text-tertiary" role="status">
              <MaterialIcon name="reviews" className="text-base" />
              {state.message}
            </span>
          ) : null}
        </div>
      </form>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-headline text-lg font-bold text-on-surface">Preview</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={copyMarkdown}
              disabled={!canExport}
              className="flex items-center gap-1.5 rounded-lg border border-outline-variant/40 px-3 py-2 text-xs font-bold text-on-surface transition hover:bg-surface-container disabled:opacity-40"
            >
              <MaterialIcon name={copied ? "reviews" : "list_alt"} className="text-sm" />
              {copied ? "Copied" : "Copy Markdown"}
            </button>
            <button
              type="button"
              onClick={downloadMarkdown}
              disabled={!canExport}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-on-primary transition hover:opacity-95 disabled:opacity-40"
            >
              <MaterialIcon name="download" className="text-on-primary text-sm" />
              Export .md
            </button>
          </div>
        </div>
        <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap rounded-xl bg-surface-container-lowest p-6 font-mono text-sm leading-relaxed text-on-surface tonal-depth">
          {markdown}
        </pre>
      </div>
    </div>
  );
}
