'use client'

import '../ui/incubators/styles.css';
import {useState} from "react";
import IncubatorsStatus from '../ui/incubators/status';
import IncubatorProjects from '../ui/incubators/projects';
import {IncubatorProjectList, ProjectStatus} from '../ui/incubators/types';
import projectsJson from '../ui/incubators/projects.json';
import projectsJsonDe from '../ui/incubators/projects.de.json';
import { useLocale } from "../i18n";
import { incubatorPageMessages } from "./messages";
import {ExternalLinkIcon, CopyToClipboard} from "@/app/clientExports";
import Link from "next/link";


export default function Incubators() {
    const locale = useLocale();
    const t = incubatorPageMessages[locale];
    const projects = locale === "de" ? projectsJsonDe : projectsJson;

    const [selectedStatus, setSelectedStatus] = useState<ProjectStatus | "">("");

    return (
        <div className="md:col-span-3 w-full">
            <div className="gird grid-rows-1">
                <p className="header-1" key={'Incubatorsdashboardheader'}>{t.incubators}</p>
                <div className='grid'>
                    <div className="card-background md:col-span-5">
                        <p className='text-justify'>
                            {t.descriptionStart}<b>{t.incubators}</b>{t.descriptionEnd}
                        </p>
                    </div>
                </div>
                <p className="header-2" key={'IncubatorProjectsHeader'}>{t.projects}</p>
                <p className="font-bold" key={'Incubatorsstatusheader'}>{t.overview}</p>
                <IncubatorsStatus
                    key={'Incubatorsstatus'}
                    onClickStatus={(event) => setSelectedStatus((event.currentTarget.dataset.value ?? "") as ProjectStatus)}
                    selectedStatus={selectedStatus}
                    projectsJson={projects as IncubatorProjectList}
                >
                </IncubatorsStatus>
                <br/>
                <IncubatorProjects
                    key={'IncubatorProjects'}
                    onClickStatus={() => {
                    }}
                    projectsJson={projects as IncubatorProjectList}
                    selectedStatus={selectedStatus}
                    setSelectedStatus={setSelectedStatus}
                >
                </IncubatorProjects>
                <div className='grid'>
                    <p className="header-2" key={'IncubatorProjectsHeader'}>{t.apiEndpoint}</p>
                    <div className="card-background md:col-span-5">
                        <p className='text-justify'>
                            {t.apiText}
                            <Link
                                href={t.licenseLink}
                                target="_blank">{t.licenseLabel}
                            </Link>
                        </p>
                        <div className="flex flex-row flex-wrap justify-start px-1 mt-2">
                            <div>
                                <p className="bg-ts4nfdi-brand-color text-white inline font-bold p-1 mr-1 rounded">
                                    {t.apiEndpoint}
                                </p>
                                {"https://terminology.services.base4nfdi.de/api/incubators/"}
                            </div>
                            <CopyToClipboard
                                textToCopy={
                                    "https://terminology.services.base4nfdi.de/api/incubators/"
                                }
                            />
                            <ExternalLinkIcon
                                href="/api/incubators/"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
