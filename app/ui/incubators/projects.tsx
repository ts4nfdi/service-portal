'use client'

import {Project, IncubatorsStatusCmpProps, ProjectStatus} from "./types";
import {SelectionInput} from "../commons/snippets";
import React, {useState, useEffect} from "react";
import ProjectCard from "./projectCard";
import IncubatorRequestCard from "./requestCard";


export default function IncubatorProjects(props: IncubatorsStatusCmpProps) {

    const [selectedStatus, setSelectedStatus] = useState<string>(props.selectedStatus ?? "");
    const [selectedConsortium, setSelectedConsortium] = useState<string>("");
    const [selectedCycle, setSelectedCycle] = useState<string>("");
    const [projectsList, setProjectsList] = useState<Project[]>(props.projectsJson?.projects ?? []);

    const statusToSkip = ['Requested', 'First contact', 'Postponed'];

    let projectsStatusOptions = [];
    for (let stat in props.projectsJson.stats) {
        if (!statusToSkip.includes(stat)) {
            let option = {label: stat, value: stat};
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


    useEffect(() => {
        let filteredProjectsList: Project[];
        filteredProjectsList = props.projectsJson.projects.filter((p) => {
            let consortiumConditon = selectedConsortium ? p.consortium.includes(selectedConsortium) : true;
            let cycleCondition = selectedCycle ? p.cycle.toString() === selectedCycle : true;
            let statusCondition = selectedStatus ? p.status === selectedStatus : true;
            return consortiumConditon && statusCondition && cycleCondition;
        });
        setProjectsList(filteredProjectsList);

    }, [selectedStatus, selectedConsortium, selectedCycle]);

    useEffect(() => {
        setSelectedStatus(props.selectedStatus ?? "");
        const statusSelection = document.getElementById("status")! as HTMLSelectElement;
        for (let option of statusSelection.options) {
            option.selected = (option.value === props.selectedStatus);
        }
    }, [props.selectedStatus]);

    return (
        <>
            <div className="grid md:grid-cols-3 mb-4 gap-4" key={"filter-project"}>
                <SelectionInput
                    id="status"
                    label="Status"
                    defaultOptionLabel="any"
                    defaultValue=""
                    options={projectsStatusOptions}
                    onSelection={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        setSelectedStatus(e.target.value);
                        if (props.setSelectedStatus) {
                            props.setSelectedStatus(e.target.value as ProjectStatus);
                        }
                    }}
                    key={"status-dropdown"}
                />
                <SelectionInput
                    id="consortium"
                    label="Consortium"
                    defaultOptionLabel="any"
                    defaultValue=""
                    options={consortiumOptions}
                    onSelection={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        setSelectedConsortium(e.target.value)
                    }}
                    key={"consortium-dropdown"}
                />
                <SelectionInput
                    id="cycle"
                    label="Cycle"
                    defaultOptionLabel="any"
                    defaultValue=""
                    options={cycleOptions}
                    onSelection={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        setSelectedCycle(e.target.value)
                    }}
                    key={"cycle-dropdown"}
                />
            </div>
            <div className="grid md:grid-cols-3 grid-rows-1 gap-8" key={"incubators-grid"}>
                <IncubatorRequestCard/>
                {
                    projectsList.map((project: Project) => {
                        if (!statusToSkip.includes(project.status)) {
                            return (<ProjectCard incubator={project} key={project.title}/>)
                        }
                    })
                }

            </div>
        </>
    );
}




