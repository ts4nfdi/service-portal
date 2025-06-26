'use client'

import '../ui/incubators/style.css';
import {useState} from "react";
import IncubatorsStatus from '../ui/incubators/status';
import IncubatorProjects from '../ui/incubators/projects';
import {IncubatorProjectList, ProjectStatus} from '../ui/incubators/types';
import projectsJson from '../ui/incubators/projects.json';


export default function Incubators() {

    const [selectedStatus, setSelectedStatus] = useState<ProjectStatus | "">("");

    return (
        <div className="md:col-span-3 w-full">
            <div className="gird grid-rows-1">
                <p className="header-1" key={'Incubatorsstatusheader'}>Incubators</p>
                <IncubatorsStatus
                    key={'Incubatorsstatus'}
                    onClickStatus={(event) => setSelectedStatus((event.currentTarget.dataset.value ?? "") as ProjectStatus)}
                    projectsJson={projectsJson as IncubatorProjectList}>
                </IncubatorsStatus>
                <br/>
                <br/>
                <p className="header-1" key={'IncubatorProjectsHeader'}>Projects</p>
                <IncubatorProjects
                    key={'IncubatorProjects'}
                    onClickStatus={(event) => {
                    }}
                    projectsJson={projectsJson as IncubatorProjectList}
                    selectedStatus={selectedStatus}
                >
                </IncubatorProjects>
            </div>
        </div>
    );
}
