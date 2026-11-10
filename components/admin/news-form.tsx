import { NEWS_KINDS, type NewsKind, type NewsPost, type ProjectStatus } from "@/lib/db/schema";
import { dateInputValue, NEWS_KIND_LABEL, PROJECT_STATUS_LABEL } from "@/lib/news";
import { ImageField } from "./image-field";
import { Card, Checkbox, TextArea, TextField } from "./ui";

export type ProjectOption = { id: number; title: string; status: ProjectStatus };

const KIND_HINT: Record<NewsKind, string> = {
  won: "Announces a new contract. The project is added to the admin as “Won, not started” and stays off the projects page.",
  started: "Construction has begun. The project moves to “Under construction”.",
  progress: "A milestone or site photos while the work goes on. The project's stage does not change.",
  completed: "Handover. The project moves to “Completed” and is published on the projects page.",
  general: "Anything else: a certificate, an event, a new team member.",
};

/** The fields of a news post. Wrapped by a plain form (new post) or an EditorForm (edit). */
export function NewsFields({
  post,
  projects,
  kind,
  projectId,
  mediaBase,
  uploadsEnabled,
}: {
  post?: NewsPost;
  projects: ProjectOption[];
  kind: NewsKind;
  projectId: number | null;
  mediaBase: string;
  uploadsEnabled: boolean;
}) {
  return (
    <div className="space-y-6">
      <Card className="space-y-5">
        <fieldset>
          <legend className="label">What are you announcing? *</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {NEWS_KINDS.map((k) => (
              <label key={k} className="flex cursor-pointer gap-3 rounded-md p-3 ring-1 ring-line has-[:checked]:bg-sand has-[:checked]:ring-2 has-[:checked]:ring-ink">
                <input type="radio" name="kind" value={k} defaultChecked={k === kind} className="mt-1 accent-brand" />
                <span>
                  <span className="block text-sm font-medium">{NEWS_KIND_LABEL[k]}</span>
                  <span className="mt-0.5 block text-xs text-muted">{KIND_HINT[k]}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="projectId" className="label">Project</label>
            <select id="projectId" name="projectId" defaultValue={projectId ?? ""} className="field">
              <option value="">{post ? "No project" : "None, or a new project (type its name)"}</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({PROJECT_STATUS_LABEL[p.status]})
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-muted">Not needed for company news.</p>
          </div>
          {!post && (
            <TextField
              name="newProject"
              label="New project name"
              placeholder="e.g. Office tower in New Cairo"
              hint="For a project that is not in the list yet, usually a new win. Leave the list above on “None”."
            />
          )}
        </div>
      </Card>

      <Card className="space-y-5">
        <TextField
          name="title"
          label="Headline"
          defaultValue={post?.title}
          hint="Leave empty for a ready-made one, e.g. “Work has started on Office tower in New Cairo”."
        />
        <TextArea
          name="summary"
          label="Short summary"
          defaultValue={post?.summary}
          rows={2}
          hint="One or two sentences. Shown on the news list, in Google, and in the LinkedIn preview."
        />
        <TextArea
          name="body"
          label="Full story"
          defaultValue={post?.body}
          rows={8}
          hint="Describe the project: the client, the scope, the size, the timeline. Separate paragraphs with an empty line."
        />
        <ImageField
          name="coverKey"
          label="Photo"
          folder="projects"
          defaultKey={post?.coverKey ?? null}
          mediaBase={mediaBase}
          enabled={uploadsEnabled}
          hint="A site photo or a render. Also used as the LinkedIn preview image, and as the project's first photo if it has none."
        />
      </Card>

      <Card className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            name="postedAt"
            label="Date"
            type="date"
            defaultValue={dateInputValue(post?.postedAt ?? new Date())}
            hint="The day it happened. Posts are listed newest first."
          />
          <TextField
            name="slug"
            label="URL slug"
            defaultValue={post?.slug}
            hint="The address of the post, e.g. /news/office-tower-awarded. Leave empty to generate from the headline."
          />
        </div>
        {post && (
          <TextField
            name="linkedinPostUrl"
            label="LinkedIn post link"
            type="url"
            defaultValue={post.linkedinPostUrl}
            placeholder="https://www.linkedin.com/feed/update/..."
            hint="Optional. After sharing, paste the link of the LinkedIn post to show “Also on LinkedIn” on the website."
          />
        )}
        <Checkbox name="published" label="Published (visible on the website)" defaultChecked={post?.published ?? true} />
      </Card>
    </div>
  );
}
