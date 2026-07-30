"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/app/i18n";
import { incubatorMessages } from "./messages";
import { localizePath } from "@/app/libs/localePath";

export default function IncubatorRequestCard() {
  const locale = useLocale();
  const t = incubatorMessages[locale];
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <div
      className={
        "incubator-project-card incubator-project-card-reveal " +
        (isImageLoaded ? "incubator-project-card-loaded" : "")
      }
      key={"add-project"}
    >
      <div className="w-full" key={"image"}>
        <Image
          src={"/img/incubator_placeholder.jpg"}
          width={150}
          height={150}
          alt={t.requestAlt}
          className="mx-auto"
          onLoad={() => setIsImageLoaded(true)}
          onError={() => setIsImageLoaded(true)}
        />
      </div>
      <p className="header-3" key={"title"}>
        <b>{t.requestTitle}</b>
      </p>
      <p className="header-4">{t.status}</p>
      <div className="flex flex-wrap gap-2 mb-10">
        <span className="status-badge" key={"first contact"}>
          {t.requestStatus}
        </span>
        <span className="cycle-badge" key={"Cycle ?"}>
          {t.requestCycle}
        </span>
      </div>
      <p className="header-4">{t.relatedConsortia}</p>
      <div className="flex flex-wrap gap-2 mb-10" key={"tags"}>
        <span className="name-badge" key={"NFDI-consortia"}>
          {t.requestConsortium1}
        </span>
        <span className="name-badge" key={"no-consortia"}>
          {t.requestConsortium2}
        </span>
      </div>
      <p className="header-4">{t.duration}</p>
      <p key={"in-the-future"}>
        {t.requestDuration}
      </p>
      <p className="header-4">{t.description}</p>
      <p className="text-justify" key={"contact-us-description"}>
        {t.requestDescription}
        <br />
        <br />
        {t.requestDescription2}
      </p>
      <p className="header-4">{t.possibleGoals}</p>
      <ul>
        <li
          className="list-item list-disc ml-6 text-justify mb-2"
          key={"goal1"}
        >
          {t.requestGoal1}
        </li>
        <li
          className="list-item list-disc ml-6 text-justify mb-2"
          key={"goal2"}
        >
          {t.requestGoal2}
        </li>
        <li
          className="list-item list-disc ml-6 text-justify mb-2"
          key={"goal3"}
        >
          {t.requestGoal3}
        </li>
        <li
          className="list-item list-disc ml-6 text-justify mb-2"
          key={"goal4"}
        >
          {t.requestGoal4}
        </li>
        <li
          className="list-item list-disc ml-6 text-justify mb-2"
          key={"goal5"}
        >
          {t.requestGoal5}
        </li>
        <li
          className="list-item list-disc ml-6 text-justify mb-2"
          key={"goal6"}
        >
          {t.requestGoal6}
        </li>
      </ul>
      <Link
        className="btn mt-5 float-right"
        href={localizePath("/incubators/new/", locale)}
        key={"new-incubator-anchor"}
      >
        {t.requestLink}
      </Link>
    </div>
  );
}
