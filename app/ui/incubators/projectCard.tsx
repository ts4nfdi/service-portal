import {Project} from "./types";
import Image from "next/image";


export default function ProjectCard(props: { incubator: Project }) {
    let project = props.incubator;
    return (
        <>
            <div className="incubator-project-card" key={project.title}>
                <div className="w-full" key={'image'}>
                    <Image
                        src={'/img/' + project.logo}
                        width={project.logoW ?? 150}
                        height={project.logoH ?? 150}
                        alt={project.title}
                        className="mx-auto"
                    />
                </div>
                <p className="header-3" key={'title'}><b>{project.title}</b></p>
                <p className="header-4">Status</p>
                <div className="flex flex-wrap gap-2 mb-10">
                    <span className="status-badge" key={project.status}>{project.status}</span>
                    <span className="cycle-badge" key={project.cycle}>Cycle {project.cycle}</span>
                </div>
                {
                    project.consortium.length !== 0 && (
                        <div>
                            <p className="header-4">Related Consortia</p>
                            <div className="flex flex-wrap gap-2 mb-10" key={'tags'}>
                                {
                                    project.consortium.map((consortia) => {
                                        return (
                                            <span className="name-badge" key={consortia}>{consortia}</span>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    )
                }
                <p className="header-4">Duration</p>
                <p key={'period'}>{`From ${project.start} To ${project.end}`}</p>
                <p className="header-4">Description</p>
                <p className="text-justify" key={'description'}>{project.description}</p>
                <div>
                    {
                        project.goals.length !== 0 && (
                            <div>
                                <p className="header-4">Goals</p>
                                <ul>
                                    {
                                        project.goals.map((goals) => {
                                            return (
                                                <li className="list-disc ml-6 text-justify mb-2 hover:bg-blue"
                                                    key={goals}>{goals}</li>
                                            )
                                        })
                                    }
                                </ul>
                            </div>
                        )
                    }
                </div>
                {
                    project.publications !== undefined && (
                        <div>
                            <p className="header-4">Publications</p>
                            <ul key={project.publications.join("-")}>
                                {
                                    project.publications.map((publication: string) => {
                                        return (
                                            <li className="list-disc ml-6 text-justify mb-2 hover:underline"
                                                key={publication}>
                                                <a className="" href={publication} target={"_blank"}>{publication}</a>
                                            </li>
                                        )
                                    })
                                }
                            </ul>
                        </div>
                    )
                }
                {
                    project.activityPage !== undefined &&
                  <div>
                    <a className="btn float-right mt-5" href={project.activityPage} target={"_blank"}>Activity Page</a>
                  </div>
                }
            </div>
        </>
    );
}
