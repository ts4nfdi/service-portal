export type Person = {
    person: string,
    consortium: string[]
}

export type Project = {
    title: string,
    cycle: number,
    status: ProjectStatus,
    start: string,
    end: string,
    description: string,
    goals: string[],
    consortium: string[],
    contactPersons?: Person[],
    logo: string,
    logoW?: number,
    logoH?: number,
    activityPage?: string,
    publications?: string[]
}

export type ProjectStatus = "In preparation" | "Running" | "Requested" | "Finished" | "First contact" | "Postponed";

export type IncubatorProjectList = {
    projects: Project[],
    stats: {
        [key in ProjectStatus]: number
    }
}

export type IncubatorsStatusCmpProps = {
    projectsJson: IncubatorProjectList;
    onClickStatus?: (event: React.MouseEvent<HTMLDivElement>) => void;
    selectedStatus?: ProjectStatus | "";
    setSelectedStatus?: React.Dispatch<React.SetStateAction<"" | ProjectStatus>>;
}
