'use server';

import {InfoAlert, PublicationCards} from "../clientExports";
import peerReviewedPublications from "./peerReviewdPublications.json";
import {PeerReviewedPublicationData} from "@/app/publications/types";


export default async function Publications() {
    const publications: PeerReviewedPublicationData[] = peerReviewedPublications;

    return (
        <div className='col-span-3'>
            <div className="">
                <p className="header-main-1 !mt-0 inline-block">Publications</p>
            </div>
            <div className="flex flex-col md:col-span-3 w-full">
                <InfoAlert
                    title={"Peer-reviewed Publications"}
                    body={
                        `The following section presents a collection of peer-reviewed publications which where published 
                      during the project Terminology Services 4 NFDI (TS4NFDI). All publications have been evaluated 
                      through established peer-review processes. They provide a comprehensive overview of the work of 
                      TS4NFDI.`
                    }
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
                                <b>Authors: </b>{pub.authors}
                                <small className="float-right" key="created_at">
                                    <span className="name-badge" key="type">{pub.type}</span> Published on:
                                    {pub.date}
                                </small>
                            </p>
                            <br/>
                            <p className="text-justify"><b>Abstract: </b>{pub.abstract}</p>
                            <p className="float-right" key="type">
                                <a className="name-badge text-white text-xs"
                                   href={pub.doi}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                >
                                    <b>DOI: </b>{pub.doi}
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
