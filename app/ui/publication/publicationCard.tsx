'use client'

import {PortalPublication} from "@/app/concepts";
import {getCurrentDate} from "@/app/libs/toolkit";
import {fetchPublications} from "@/app/api/actions/publications";
import {useEffect, useState} from "react";
import {CardSkeleton} from "../commons/skeletons";
import {Pagination} from "@/app/clientExports";
import {PublicationActionResp} from "@/app/api/actions/types";
import { useLocale } from "@/app/i18n";
import { publicationMessages } from "@/app/publications/messages";

const DEFAULT_PAGE_SIZE = 5;

export default function PublicationCardsCmp() {
    const t = publicationMessages[useLocale()];

    const [pubs, setPubs] = useState<PortalPublication[]>([]);
    const [page, setPage] = useState<number>(1);
    const [totalPubCount, setTotalPubCount] = useState<number>(0);
    const [failed, setFailed] = useState<boolean>(false);

    function handleNextPageClick(): undefined {
        let maxPage = Math.ceil(totalPubCount / DEFAULT_PAGE_SIZE);
        if (page < maxPage) {
            setPage(page + 1);
            setPubs([]);
            setFailed(false);
        }
    }

    function handlePrevPageClick(): undefined {
        if (page > 1) {
            setPage(page - 1);
            setPubs([]);
            setFailed(false);
        }
    }

    useEffect(() => {
        fetchPublications(page, DEFAULT_PAGE_SIZE).then((pubsData: PublicationActionResp) => {
            if (pubsData.failed || !pubsData.publications) {
                setFailed(true);
                return;
            }
            let pubsList = pubsData.publications.map(pdata => PortalPublication.toObject(pdata));
            setPubs(pubsList);
            setTotalPubCount(pubsData?.total ?? 0);
        }).catch(() => setFailed(true));
    }, [page]);

    return (
        <div className="col-span-3">
            <div className="grid grid-cols-3 gap-4">
                <p className="header-main-1 inline-block col-span-2">{t.further}</p>
                <Pagination
                    page={page}
                    size={DEFAULT_PAGE_SIZE}
                    objectName={t.objectName}
                    total={totalPubCount}
                    handleNextPageClick={handleNextPageClick}
                    handlePrevPageClick={handlePrevPageClick}
                    className="mb-4 col-span-1"
                />
            </div>
            {failed &&
              <p className="text-red-700 dark:text-red-400">{t.loadError}</p>
            }
            {!failed && pubs.length === 0 &&
              <CardSkeleton className="" count={5}/>
            }
            {pubs.length !== 0 &&
                pubs.map((pub: PortalPublication) => {
                    return (
                        <div className='card' key={pub.doi}>
                            <a href={pub.doi_url} target="_blank" key={"title"}>{pub.title}</a>
                            <span className='name-badge' key={"type"}>{pub.type}</span>
                            <br/>
                            <small key={"created_at"}>{getCurrentDate(pub.created)}</small>
                            <br/>
                            <div dangerouslySetInnerHTML={{__html: pub.description}}></div>
                        </div>
                    )
                })
            }
        </div>
    );
}
