'use client'

import '../ui/incubators/styles.css';
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
    return <Suspense><IncubatorDashboard /></Suspense>;
}

function IncubatorDashboard() {
    const locale = useLocale();
    const t = incubatorPageMessages[locale];
    const projects = locale === "de" ? projectsJsonDe : projectsJson;

    const searchParams = useSearchParams();
    const selectedStatus = Object.keys(projects.stats).includes(searchParams.get("status") ?? "")
        ? searchParams.get("status") as ProjectStatus : "";
    const filters = {
        consortium: projects.projects.some((project) => project.consortium.includes(searchParams.get("consortium") ?? "")) ? searchParams.get("consortium")! : "",
        cycle: projects.projects.some((project) => String(project.cycle) === searchParams.get("cycle")) ? searchParams.get("cycle")! : "",
        search: searchParams.get("search") ?? "",
    };

    function updateFilter(name: string, value: string) {
        const url = new URL(window.location.href);
        if (value) url.searchParams.set(name, value);
        else url.searchParams.delete(name);
        window.history.replaceState(null, "", url);
    }

    return (
        <div className="md:col-span-3 w-full">
            <div className="gird grid-rows-1">
                <p className="header-1" key={'Incubatorsdashboardheader'}>{t.incubators}</p>
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
                <div className="mb-8">
                    <IncubatorsStatus
                        key={'Incubatorsstatus'}
                        onClickStatus={(event) => updateFilter("status", event.currentTarget.dataset.value === selectedStatus ? "" : event.currentTarget.dataset.value ?? "")}
                        selectedStatus={selectedStatus}
                        projectsJson={projects as IncubatorProjectList}
                    >
                    </IncubatorsStatus>
                </div>
                <IncubatorProjects
                    key={'IncubatorProjects'}
                    onClickStatus={() => {
                    }}
                    projectsJson={projects as IncubatorProjectList}
                    selectedStatus={selectedStatus}
                    filters={filters}
                    onFilterChange={updateFilter}
                >
                </IncubatorProjects>
            </div>
        </div>
    );
}
