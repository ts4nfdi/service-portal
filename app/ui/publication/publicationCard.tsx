'use client'

import { PortalPublication, PortalPublicationJsonData } from "@/app/concepts";
import { getCurrentDate } from "@/app/libs/toolkit";
import { fetchPublications } from "@/app/api/actions/publications";
import { useEffect, useState } from "react";
import { CardSkeleton } from "../commons/skeletons";


export default function PublicationCardsCmp() {

  const [pubs, setPubs] = useState<PortalPublication[]>([]);

  useEffect(() => {
    fetchPublications().then((pubsData: PortalPublicationJsonData[]) => {
      let pubsList = pubsData.map(pdata => PortalPublication.toObject(pdata));
      setPubs(pubsList);
    })
  }, []);

  return (
    <div className="col-span-3">
      {pubs.length === 0 &&
        <CardSkeleton className="" count={5} />
      }
      {pubs.length !== 0 &&
        (pubs).map((pub: PortalPublication, i: number) => {
          return (
            <div className='card' key={pub.doi}>
              <a href={pub.doi_url} target="_blank" key={"title"}>{`${i + 1}. ${pub.title}`}</a>
              <span className='name-badge' key={"type"}>{pub.type}</span>
              <br />
              <small key={"created_at"}>{getCurrentDate(pub.created)}</small>
              <br />
            </div>
          )
        })
      }
    </div>
  );
}
