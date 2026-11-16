"use client";

import { useLocale } from "@/app/i18n";
import { incubatorMessages } from "./messages";

export default function IncubatorRequestInfo() {
  const locale = useLocale();
  const t = incubatorMessages[locale];

  return (
    <div className="form-input-group mb-6">
      <p className="mb-6 text-gray-700 dark:text-gray-200">{t.requestPurpose}</p>
      <section className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-gray-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:[&_ul]:bg-transparent dark:[&_li]:bg-transparent">
        <h2 className="text-xl font-bold mb-6" key={"title"}>
          {t.requestSampleTitle}
        </h2>
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
      </section>
    </div>
  );
}
