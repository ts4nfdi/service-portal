"use client";

import { useState } from "react";
import { Project } from "./types";
import Image from "next/image";
import Link from "next/link";
import { localizePath } from "@/app/libs/localePath";
import { useLocale } from "@/app/i18n";
import { incubatorMessages, statusLabels } from "./messages";

export default function ProjectCard(props: { incubator: Project }) {
  const locale = useLocale();
  const t = incubatorMessages[locale];
  let project = props.incubator;
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  return (
    <>
      <Link
        href={localizePath(`/incubators/${project.url}`, locale)}
        aria-labelledby={`${project.incubatorID}-title`}
        id={project.incubatorID}
        className={
          "incubator-project-card incubator-project-card-summary incubator-project-card-reveal " +
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
        <h2 id={`${project.incubatorID}-title`} className="text-xl font-bold my-6" key={"title"}>
          {project.title}
        </h2>
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
        <p className="line-clamp-3" key={"description"}>
          {project.description}
        </p>
        <span className="btn mt-5">{t.showMore}</span>
      </Link>
    </>
  );
}
