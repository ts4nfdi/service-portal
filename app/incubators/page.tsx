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
import {CopyToClipboard} from "@/app/clientExports";


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
                        <br/>
                        <div className="flex flex-row flex-wrap justify-start px-1 mt-2">
                            <div>
                                <p className="bg-ts4nfdi-brand-color text-white inline font-bold p-1 mr-1 rounded">
                                    {t.apiEndpoint}
                                </p>
                                {(process.env.GATEWAY_BASE_URL! as string) + "/incubators/"}
                            </div>
                            <CopyToClipboard
                                textToCopy={
                                    (process.env.GATEWAY_BASE_URL! as string) + "/incubators/"
                                }
                            />
                        </div>
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
            </div>
        </div>
    );
}
