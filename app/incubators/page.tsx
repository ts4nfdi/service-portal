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


export default function Incubators() {
    const locale = useLocale();
    const t = incubatorPageMessages[locale];
    const projects = locale === "de" ? projectsJsonDe : projectsJson;

    const [selectedStatus, setSelectedStatus] = useState<ProjectStatus | "">("");

    return (
        <div className="md:col-span-3 w-full">
            <div className="gird grid-rows-1">
                <p className="header-1" key={'Incubatorsstatusheader'}>{t.incubators}</p>
                <IncubatorsStatus
                    key={'Incubatorsstatus'}
                    onClickStatus={(event) => setSelectedStatus((event.currentTarget.dataset.value ?? "") as ProjectStatus)}
                    selectedStatus={selectedStatus}
                    projectsJson={projects as IncubatorProjectList}
                >
                </IncubatorsStatus>
                <br/>
                <br/>
                <p className="header-1" key={'IncubatorProjectsHeader'}>{t.projects}</p>
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
