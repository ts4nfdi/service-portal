"use client";

import { useState } from "react";
import { Project } from "./types";
import Image from "next/image";
import { useLocale } from "@/app/i18n";
import { incubatorMessages, statusLabels } from "./messages";

export default function ProjectCard(props: { incubator: Project }) {
  const locale = useLocale();
  const t = incubatorMessages[locale];
  let project = props.incubator;
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  return (
    <>
      <div
        className={
          "incubator-project-card incubator-project-card-reveal " +
          (isImageLoaded ? "incubator-project-card-loaded" : "")
        }
        key={project.title}
      >
        <div className="w-full" key={"image"}>
          <Image
            src={"/img/" + project.logo}
            width={project.logoW ?? 150}
            height={project.logoH ?? 150}
            alt={project.title}
            className="mx-auto"
            onLoad={() => setIsImageLoaded(true)}
            onError={() => setIsImageLoaded(true)}
          />
        </div>
        <p className="header-3" key={"title"}>
          <b>{project.title}</b>
        </p>
        <p className="header-4">{t.status}</p>
        <div className="flex flex-wrap gap-2 mb-10">
          <span className="status-badge" key={project.status}>
            {statusLabels[locale][project.status]}
          </span>
          <span className="cycle-badge" key={project.cycle}>
            {t.cycle} {project.cycle}
          </span>
        </div>
        {project.consortium.length !== 0 && (
          <div>
            <p className="header-4">{t.relatedConsortia}</p>
            <div className="flex flex-wrap gap-2 mb-10" key={"tags"}>
              {project.consortium.map((consortia) => {
                return (
                  <span className="name-badge" key={consortia}>
                    {consortia}
                  </span>
                );
              })}
            </div>
          </div>
        )}
        <p className="header-4">{t.duration}</p>
        <p key={"period"}>{t.durationRange(project.start, project.end)}</p>
        <p className="header-4">{t.description}</p>
        <p className="text-justify" key={"description"}>
          {project.description}
        </p>
        <div>
          {project.goals.length !== 0 && (
            <div>
              <p className="header-4">{t.goals}</p>
              <ul>
                {project.goals.map((goals) => {
                  return (
                    <li
                      className="list-item list-disc ml-6 text-justify mb-2 hover:bg-blue"
                      key={goals}
                    >
                      {goals}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
        {project.publications !== undefined && (
          <div>
            <p className="header-4">{t.publications}</p>
            <ul key={project.publications.join("-")}>
              {project.publications.map((publication: string) => {
                return (
                  <li
                    className="list-item list-disc ml-6 text-justify mb-2 hover:underline"
                    key={publication}
                  >
                    <a className="" href={publication} target={"_blank"}>
                      {publication}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {project.activityPage !== undefined && (
          <div>
            <a
              className="btn float-right mt-5"
              href={project.activityPage}
              target={"_blank"}
            >
              {t.activityPage}
            </a>
          </div>
        )}
      </div>
    </>
  );
}
