import topics from "./genai.json";
import { MARKETPLACE } from "./content";

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ankitanand.dev"
).replace(/\/$/, "");
export const diagramSlug = (src: string) =>
  src
    .split("/")
    .at(-1)!
    .replace(/\.png$/, "");
export const topicPath = (id: string) => `/resources/genai/${id}`;
export const diagramPath = (id: string, src: string) =>
  `${topicPath(id)}/${diagramSlug(src)}`;
export const handbookPath = (slug: string) => `/resources/handbooks/${slug}`;

export function resourceParams() {
  return [
    ...topics.flatMap((topic) => [
      { slug: ["genai", topic.id] },
      ...topic.slides.map((slide) => ({
        slug: ["genai", topic.id, diagramSlug(slide.src)],
      })),
    ]),
    ...MARKETPLACE.map((doc) => ({ slug: ["handbooks", doc.slug] })),
  ];
}

export function findResource(slug: string[]) {
  if (slug[0] === "handbooks" && slug.length === 2) {
    const doc = MARKETPLACE.find((item) => item.slug === slug[1]);
    return doc
      ? {
          kind: "handbook" as const,
          title: doc.title,
          description: doc.description,
          image: doc.image,
          path: handbookPath(doc.slug),
          doc,
        }
      : null;
  }
  if (slug[0] !== "genai" || (slug.length !== 2 && slug.length !== 3))
    return null;
  const topic = topics.find((item) => item.id === slug[1]);
  if (!topic) return null;
  if (slug.length === 2)
    return {
      kind: "topic" as const,
      title: topic.title,
      description: topic.description,
      image: topic.slides[0].src,
      path: topicPath(topic.id),
      topic,
    };
  const slide = topic.slides.find((item) => diagramSlug(item.src) === slug[2]);
  return slide
    ? {
        kind: "diagram" as const,
        title: `${topic.title}: ${slide.title}`,
        description: `${slide.title} from the ${topic.title} visual collection. ${topic.description}`,
        image: slide.src,
        path: diagramPath(topic.id, slide.src),
        topic,
        slide,
      }
    : null;
}
