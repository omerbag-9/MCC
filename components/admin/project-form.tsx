import type { Project } from "@/lib/db/schema";
import { Card, Checkbox, TextArea, TextField } from "./ui";

/** The project's fields. Wrapped by a plain form (new project) or an EditorForm (edit). */
export function ProjectFields({ project }: { project?: Project }) {
  return (
    <div className="space-y-6">
      <Card className="space-y-5">
        <TextField name="title" label="Title" defaultValue={project?.title} required />
        <TextField
          name="slug"
          label="URL slug"
          defaultValue={project?.slug}
          hint="The address of the page, e.g. /projects/villa-in-new-cairo. Leave empty to generate from the title."
        />
        <TextArea name="summary" label="Short summary" defaultValue={project?.summary} rows={2} hint="Shown on project cards and in Google results." />
        <TextArea name="body" label="Description" defaultValue={project?.body} rows={10} hint="Separate paragraphs with an empty line." />
      </Card>

      <Card className="grid gap-5 sm:grid-cols-2">
        <TextField name="category" label="Category" defaultValue={project?.category} placeholder="e.g. Residential" hint="Used for the filter on the projects page." />
        <TextField name="location" label="Location" defaultValue={project?.location} />
        <TextField name="client" label="Client" defaultValue={project?.client} />
        <TextField name="year" label="Year completed" type="number" defaultValue={project?.year} />
        <TextField name="areaM2" label="Area (m²)" type="number" defaultValue={project?.areaM2} />
        <div className="sm:col-span-2">
          <TextArea
            name="specs"
            label="Specifications"
            defaultValue={project?.specs}
            rows={5}
            placeholder={"Floors: G + 11\nBasements: 2\nBuilding height: 34 m\nStatus: Completed"}
            hint="One per line, as “Label: value”. Shown in the project overview table, after the details above."
          />
        </div>
        <div className="sm:col-span-2">
          <TextArea
            name="highlights"
            label="Highlights"
            defaultValue={project?.highlights}
            rows={4}
            placeholder={"Landscaped plaza\nTwo basement parking levels\nGlass curtain-wall facade"}
            hint="One per line: features, systems or amenities delivered."
          />
        </div>
      </Card>

      <Card className="space-y-5">
        <div className="flex flex-wrap gap-6">
          <Checkbox name="published" label="Published (visible on the website)" defaultChecked={project?.published ?? false} />
          <Checkbox name="featured" label="Featured on the home page" defaultChecked={project?.featured ?? false} />
        </div>
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-ink-soft">SEO (optional)</summary>
          <div className="mt-4 space-y-5">
            <TextField name="seoTitle" label="SEO title" defaultValue={project?.seoTitle} hint="Defaults to the project title." />
            <TextArea name="seoDescription" label="SEO description" defaultValue={project?.seoDescription} rows={2} hint="Defaults to the summary. ~150 characters." />
          </div>
        </details>
      </Card>

    </div>
  );
}
