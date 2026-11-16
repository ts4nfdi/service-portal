import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRequestLocale } from "@/app/libs/locale";
import { localizePath } from "@/app/libs/localePath";
import { incubatorMessages, statusLabels } from "@/app/ui/incubators/messages";
import projectsJson from "@/app/ui/incubators/projects.json";
import projectsJsonDe from "@/app/ui/incubators/projects.de.json";
import { IncubatorProjectList } from "@/app/ui/incubators/types";
import { ExternalLink } from "@/app/ui/commons/icons";
import "../../ui/incubators/styles.css";

export default async function IncubatorPage({ params }: { params: Promise<{ incubatorId: string }> }) {
  const { incubatorId } = await params;
  const locale = await getRequestLocale();
  const t = incubatorMessages[locale];
  const projects = (locale === "de" ? projectsJsonDe : projectsJson) as IncubatorProjectList;
  const project = projects.projects.find((project) => project.url === incubatorId);

  if (!project) notFound();

  return (
    <div className="md:col-span-3 w-full min-w-0">
      <Link className="btn" href={localizePath("/incubators", locale)}>{t.backToList}</Link>
      <article className="incubator-profile mt-6">
        <div className="grid gap-8 md:grid-cols-3 md:items-start">
          <div className="space-y-6">
            <div className="incubator-profile-logo">
              <Image src={`/img/${project.logo}`} width={project.logoW ?? 150} height={project.logoH ?? 150}
                alt={project.title} className="max-h-48 w-auto max-w-full object-contain" priority />
            </div>
            <aside className="space-y-6">
              <section>
                <h2 className="header-4">{t.duration}</h2>
                <p>{t.durationRange(project.start, project.end)}</p>
              </section>
              {project.consortium.length > 0 && (
                <section>
                  <h2 className="header-4 mb-2">{t.relatedConsortia}</h2>
                  <div className="flex flex-wrap gap-2">
                    {project.consortium.map((consortium) => <span className="name-badge" key={consortium}>{consortium}</span>)}
                  </div>
                </section>
              )}
              {project.contactPersons?.some((contact) => contact.person || contact.consortium.length > 0) && (
                <section>
                  <h2 className="header-4">{t.contactPersons}</h2>
                  {project.contactPersons.map((contact, index) => (
                    <p key={index}>{[contact.person, ...contact.consortium].filter(Boolean).join(" · ")}</p>
                  ))}
                </section>
              )}
            </aside>
          </div>
          <div className="min-w-0 w-full md:col-span-2">
            <div className="flex items-start justify-between gap-4 mb-6">
              <h1 className="min-w-0 text-xl md:text-2xl font-bold break-words">{project.title}</h1>
              {project.activityPage && (
                <Link className="incubator-activity-link shrink-0" href={project.activityPage.startsWith("http") ? project.activityPage : localizePath(`/${project.activityPage.replace(/^\//, "")}`, locale)}
                  target="_blank" rel="noopener noreferrer">
                  {t.activityPage}<ExternalLink width={14} height={14} />
                </Link>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="status-badge">{statusLabels[locale][project.status]}</span>
              <span className="cycle-badge">{t.cycle} {project.cycle}</span>
            </div>
            <div className="min-w-0 space-y-8 mt-6">
              <section>
                <h2 className="header-4 mb-2">{t.description}</h2>
                <p className="whitespace-pre-line">{project.description}</p>
              </section>
              {project.goals.length > 0 && (
                <section>
                  <h2 className="header-4 mb-2">{t.goals}</h2>
                  <ul>{project.goals.map((goal) => <li className="list-item mb-2" key={goal}>{goal}</li>)}</ul>
                </section>
              )}
              {!!project.publications?.length && (
                <section>
                  <h2 className="header-4 mb-2">{t.publications}</h2>
                  <ul>{project.publications.map((publication) => (
                    <li className="list-item mb-2 break-words" key={publication}>
                      <a href={publication} target="_blank" rel="noopener noreferrer">{publication}</a>
                    </li>
                  ))}</ul>
                </section>
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
