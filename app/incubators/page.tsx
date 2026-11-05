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
import Link from "next/link";
import { incubatorMessages } from "../ui/incubators/messages";
import { localizePath } from "../libs/localePath";


export default function Incubators() {
    const locale = useLocale();
    const t = incubatorPageMessages[locale];
    const projects = locale === "de" ? projectsJsonDe : projectsJson;

    const [selectedStatus, setSelectedStatus] = useState<ProjectStatus | "">("");

    return (
        <div className="md:col-span-3 w-full">
            <div className="gird grid-rows-1">
                <p className="header-1" key={'Incubatorsdashboardheader'}>{t.incubators}</p>
                <div className="mb-8">
                    <IncubatorsStatus
                        key={'Incubatorsstatus'}
                        onClickStatus={(event) => setSelectedStatus((event.currentTarget.dataset.value ?? "") as ProjectStatus)}
                        selectedStatus={selectedStatus}
                        projectsJson={projects as IncubatorProjectList}
                    >
                    </IncubatorsStatus>
                </div>
                <div className='grid mb-8'>
                    <div className="card-background md:col-span-5">
                        <p className='text-justify'>
                            {t.descriptionStart}<b>{t.incubators}</b>{t.descriptionEnd}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-4">
                            <strong>{incubatorMessages[locale].requestTitle}</strong>
                            <Link className="btn !mb-0" href={localizePath("/incubators/new", locale)}>
                                {incubatorMessages[locale].applyNow}
                            </Link>
                        </div>
                    </div>
                </div>
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
