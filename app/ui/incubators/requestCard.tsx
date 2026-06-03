"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function IncubatorRequestCard() {
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
          alt={"Add your project"}
          className="mx-auto"
          onLoad={() => setIsImageLoaded(true)}
          onError={() => setIsImageLoaded(true)}
        />
      </div>
      <p className="header-3" key={"title"}>
        <b>Would you like to collaborate with us as an Incubator?</b>
      </p>
      <p className="header-4">Status</p>
      <div className="flex flex-wrap gap-2 mb-10">
        <span className="status-badge" key={"first contact"}>
          We could help you
        </span>
        <span className="cycle-badge" key={"Cycle ?"}>
          Cycle ?
        </span>
      </div>
      <p className="header-4">Related Consortia</p>
      <div className="flex flex-wrap gap-2 mb-10" key={"tags"}>
        <span className="name-badge" key={"NFDI-consortia"}>
          some NFDI consortia
        </span>
        <span className="name-badge" key={"no-consortia"}>
          no consortia - external
        </span>
      </div>
      <p className="header-4">Duration</p>
      <p key={"in-the-future"}>
        6 months somewhere in the future. The next call for incubators is
        currently open. The submission deadline is on the 23rd June 2026. The
        next incubator cycle itself will start in the middle of Q3/2026.
      </p>
      <p className="header-4">Description</p>
      <p className="text-justify" key={"contact-us-description"}>
        Have you considered one or more of the possible goals listed below?
        However, you may not have the resources or expertise to make it happen.
        Terminology Services 4 NFDI (TS4NFDI) can provide the assistance you
        need to bring your use case to life.
        <br />
        <br />
        We offer incubator projects to interested parties to support them in the
        interaction, integration or handling of terminology services. TS4NFDI
        will offer at least two incubator cycles per year. These cycles will be
        user-driven and will include requirements analysis, service integration,
        testing and user feedback. Each cycle is expected to span six months,
        during which TS4NFDI will allocate resources (e.g. developer capacity)
        to support your specific use case.
      </p>
      <p className="header-4">Possible Goals</p>
      <ul>
        <li
          className="list-item list-disc ml-6 text-justify mb-2"
          key={"goal1"}
        >
          Hosting of terminologies
        </li>
        <li
          className="list-item list-disc ml-6 text-justify mb-2"
          key={"goal2"}
        >
          Setup a terminology service
        </li>
        <li
          className="list-item list-disc ml-6 text-justify mb-2"
          key={"goal3"}
        >
          Adding terminology services to the API Gateway
        </li>
        <li
          className="list-item list-disc ml-6 text-justify mb-2"
          key={"goal4"}
        >
          Integration of TSS widgets
        </li>
        <li
          className="list-item list-disc ml-6 text-justify mb-2"
          key={"goal5"}
        >
          Provision of collection(s) via API Gateway
        </li>
        <li
          className="list-item list-disc ml-6 text-justify mb-2"
          key={"goal6"}
        >
          Adding mappings to the mapping service
        </li>
      </ul>
      <Link
        className="btn mt-5 float-right"
        href="/incubators/new/"
        key={"new-incubator-anchor"}
      >
        Send us your request
      </Link>
    </div>
  );
}
