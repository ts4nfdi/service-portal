import {InfoAlert, PublicationCards} from "../clientExports";
import peerReviewedPublications from "./peerReviewdPublications.json";
import {PeerReviewedPublicationData} from "@/app/publications/types";
import { getRequestLocale } from "../libs/locale";
import { publicationMessages } from "./messages";


export default async function Publications() {
    const locale = await getRequestLocale();
    const t = publicationMessages[locale];
    const publications: PeerReviewedPublicationData[] = peerReviewedPublications;

    return (
        <div className='col-span-3'>
            <div className="">
                <p className="header-main-1 !mt-0 inline-block">{t.title}</p>
            </div>
            <div className="flex flex-col md:col-span-3 w-full">
                <InfoAlert
                    title={t.peerReviewed}
                    body={t.intro}
                />
                {publications.map((pub: PeerReviewedPublicationData, index: number) => {
                    return (
                        <div className="card" key={index}>
                            <a className="header-main-3 !text-[#45546b]" href={pub.doi}
                               target="_blank" rel="noopener noreferrer">
                                {`${index + 1}. ${pub.title}`}
                            </a>
                            <br/><br/>
                            <p key="contributor">
                                <b>{t.authors}</b>{pub.authors}
                                <small className="float-right" key="created_at">
                                    <span className="name-badge" key="type">{pub.type}</span>{t.publishedOn}
                                    {pub.date}
                                </small>
                            </p>
                            <br/>
                            <p className="text-justify"><b>{t.abstract}</b>{pub.abstract}</p>
                            <p className="float-right" key="type">
                                <a className="name-badge text-white text-xs"
                                   href={pub.doi}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                >
                                    <b>{t.doi}</b>{pub.doi}
                                </a>
                            </p>
                            <br/>
                        </div>
                    )
                })}
            </div>
            <div className="md:col-span-3 p-4 mt-8" key={"publications"}>
                <PublicationCards/>
            </div>
        </div>
    );
}
