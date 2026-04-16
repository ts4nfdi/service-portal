'use client'

import { PortalPublication, PortalPublicationJsonData } from "@/app/concepts";
import { getCurrentDate } from "@/app/libs/toolkit";
import { fetchPublications } from "@/app/api/actions/publications";
import { useEffect, useState } from "react";
import { CardSkeleton } from "../commons/skeletons";
import {Pagination} from "@/app/clientExports";
import {PublicationActionResp} from "@/app/api/actions/types";

const DEFAULT_PAGE_SIZE = 5;

export default function PublicationCardsCmp() {

  const [pubs, setPubs] = useState<PortalPublication[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPubCount, setTotalPubCount] = useState<number>(0);

  function handleNextPageClick(): undefined {
    let maxPage = Math.ceil(totalPubCount / DEFAULT_PAGE_SIZE);
    if (page < maxPage) {
      setPage(page + 1);
      setPubs([]);
    }
  }

  function handlePrevPageClick(): undefined {
    if (page > 1) {
      setPage(page - 1);
      setPubs([]);
    }
  }

  useEffect(() => {
    fetchPublications(page, DEFAULT_PAGE_SIZE).then((pubsData: PublicationActionResp) => {
      if(!pubsData.publications){
        return;
      }
      let pubsList = pubsData.publications.map(pdata => PortalPublication.toObject(pdata));
      setPubs(pubsList);
      setTotalPubCount(pubsData?.total ?? 0);
    })
  }, [page]);

  return (
    <div className="col-span-3">
      <Pagination
        page={page}
        size={DEFAULT_PAGE_SIZE}
        objectName="Publications"
        total={totalPubCount}
        handleNextPageClick={handleNextPageClick}
        handlePrevPageClick={handlePrevPageClick}
        className="mb-4"
        />
      {pubs.length === 0 &&
        <CardSkeleton className="" count={5} />
      }
      {pubs.length !== 0 &&
        pubs.map((pub: PortalPublication, i: number) => {
          return (
            <div className='card' key={pub.doi}>
              <a href={pub.doi_url} target="_blank" key={"title"}>{pub.title}</a>
              <span className='name-badge' key={"type"}>{pub.type}</span>
              <br />
              <small key={"created_at"}>{getCurrentDate(pub.created)}</small>
              <br />
              <div dangerouslySetInnerHTML={{__html: pub.description}}></div>
            </div>
          )
        })
      }
    </div>
  );
}
