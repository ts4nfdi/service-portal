'use client'

import {Project, IncubatorsStatusCmpProps, ProjectStatus} from "./types";
import {SelectionInput, TextInput} from "../commons/snippets";
import React from "react";
import ProjectCard from "./projectCard";
import { useLocale } from "@/app/i18n";
import { incubatorMessages, statusLabels } from "./messages";
import { incubatorPageMessages } from "@/app/incubators/messages";
import { CopyToClipboard, ExternalLinkIcon } from "@/app/clientExports";
import Link from "next/link";


export default function IncubatorProjects(props: IncubatorsStatusCmpProps & {
    filters: { consortium: string; cycle: string; search: string };
    onFilterChange: (name: string, value: string) => void;
}) {
    const locale = useLocale();
    const t = incubatorMessages[locale];
    const pageMessages = incubatorPageMessages[locale];

    const selectedStatus = props.selectedStatus ?? "";
    const { consortium: selectedConsortium, cycle: selectedCycle, search } = props.filters;

    const statusToSkip = ['Requested', 'First contact', 'Postponed'];

    let projectsStatusOptions = [];
    for (let stat in props.projectsJson.stats) {
        if (!statusToSkip.includes(stat)) {
            let option = {label: statusLabels[locale][stat as ProjectStatus], value: stat};
            projectsStatusOptions.push(option);
        }
    }


    let consortiumOptions: { label: string, value: string }[] = [];
    for (let project of props.projectsJson.projects) {
        for (let consortia of project.consortium) {
            let option = {label: consortia, value: consortia};
            if (!consortiumOptions.find((el) => el.label === option.label)) {
                consortiumOptions.push(option);
            }
        }
    }

    let cycleOptions: { label: string, value: string }[] = [];
    for (let project of props.projectsJson.projects) {
        let option = {label: project.cycle.toString(), value: project.cycle.toString()};
        if (!cycleOptions.find((el) => el.label === option.label)) {
            cycleOptions.push(option);
        }
    }
    cycleOptions.sort((a, b) => a.label.localeCompare(b.label));


    const query = search.trim().toLocaleLowerCase(locale);
    const filteredProjectsList = props.projectsJson.projects.filter((p) => {
        let consortiumConditon = selectedConsortium ? p.consortium.includes(selectedConsortium) : true;
        let cycleCondition = selectedCycle ? p.cycle.toString() === selectedCycle : true;
        let statusCondition = selectedStatus ? p.status === selectedStatus : true;
        const searchCondition = !query || p.title.toLocaleLowerCase(locale).includes(query) || p.description.toLocaleLowerCase(locale).includes(query);
        return consortiumConditon && statusCondition && cycleCondition && searchCondition;
    });
    if (query) {
        filteredProjectsList.sort((a, b) => Number(b.title.toLocaleLowerCase(locale).includes(query)) - Number(a.title.toLocaleLowerCase(locale).includes(query)));
    }

    return (
        <div className="grid gap-8 md:grid-cols-3 md:items-start">
            <aside className="min-w-0 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                <div className="grid mb-4 gap-4" key={"filter-project"}>
                    <SelectionInput
                        id="status"
                        value={selectedStatus}
                        label={t.status}
                        defaultOptionLabel={t.any}
                        defaultValue=""
                        options={projectsStatusOptions}
                        onSelection={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            props.onFilterChange("status", e.target.value);
                        }}
                        key={"status-dropdown"}
                    />
                    <SelectionInput
                        id="consortium"
                        value={selectedConsortium}
                        label={t.consortium}
                        defaultOptionLabel={t.any}
                        defaultValue=""
                        options={consortiumOptions}
                        onSelection={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            props.onFilterChange("consortium", e.target.value)
                        }}
                        key={"consortium-dropdown"}
                    />
                    <SelectionInput
                        id="cycle"
                        value={selectedCycle}
                        label={t.cycle}
                        defaultOptionLabel={t.any}
                        defaultValue=""
                        options={cycleOptions}
                        onSelection={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            props.onFilterChange("cycle", e.target.value)
                        }}
                        key={"cycle-dropdown"}
                    />
                </div>
                <div>
                    <TextInput id="incubator-search" name="incubator-search" type="text" value={search} labelText={t.searchLabel}
                        placeHolder={t.searchPlaceholder} required={false} onChange={(event) => props.onFilterChange("search", event.target.value)} />
                </div>
                <section className="mt-20 border-l-2 border-gray-300 pl-4 dark:border-gray-600">
                    <h2 className="header-4 mb-2">{pageMessages.apiEndpoint}</h2>
                    <p className="!px-0">
                        {pageMessages.apiText}
                        <Link href={pageMessages.licenseLink} target="_blank" rel="noopener noreferrer">{pageMessages.licenseLabel}</Link>
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="min-w-0 break-all">https://terminology.services.base4nfdi.de/api-gateway/incubators/</span>
                        <CopyToClipboard textToCopy="https://terminology.services.base4nfdi.de/api-gateway/incubators/" />
                        <ExternalLinkIcon href="https://terminology.services.base4nfdi.de/api-gateway/incubators/" />
                    </div>
                </section>
            </aside>
            <div className="min-w-0 md:col-span-2">
                {filteredProjectsList.length === 0 && <p role="status">{t.noSearchResults}</p>}
                <div className="grid gap-8 lg:grid-cols-2" key={"incubators-grid"}>
                    {
                        filteredProjectsList.map((project: Project) => {
                            if (!statusToSkip.includes(project.status)) {
                                return (<ProjectCard incubator={project} key={project.title}/>)
                            }
                        })
                    }

                </div>
            </div>
        </div>
    );
}



