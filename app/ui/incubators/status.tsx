'use client'

import {IncubatorsStatusCmpProps, ProjectStatus} from "./types";
import {useEffect} from "react";


export default function IncubatorsStatus(props: IncubatorsStatusCmpProps) {
    const stats = props.projectsJson?.stats ?? {};
    const statusToSkip = ['Requested', 'First contact', 'Postponed'];

    useEffect(() => {
        if (props.selectedStatus === "") {
            const currentSelected = document.getElementsByClassName("clicked-status-card");
            for (let element of currentSelected) {
                element.classList.remove("clicked-status-card");
                element.classList.add("status-card");
            }
        }
    }, [props.selectedStatus]);

    return (
        <>

            <div className="grid md:grid-cols-3 grid-rows-1 gap-10">
                {
                    Object.keys(stats).map((key) => {
                        const status = key as ProjectStatus;
                        if (statusToSkip.includes(status)) {
                            return;
                        }
                        return (
                            <div
                                className="status-card"
                                key={status}
                                onClick={(event: React.MouseEvent<HTMLDivElement>) => {
                                    if (props.onClickStatus) {
                                        props.onClickStatus(event);
                                        const currentSelected = document.getElementsByClassName("clicked-status-card");
                                        for (let element of currentSelected) {
                                            element.classList.remove("clicked-status-card");
                                            element.classList.add("status-card");
                                        }
                                        event.currentTarget.classList.remove('status-card');
                                        event.currentTarget.classList.add('clicked-status-card');
                                    }
                                }}
                                data-value={status}>
                                <p className="lg:text-xl ">{status}: <b>{stats[status]}</b></p>
                            </div>
                        )
                    })
                }

                {/* <div className="flex lg:gap-10 md:gap-3 status-card" key={'completed'}> */}
                {/*   <div className="relative w-[160px] h-[160px] ml-6"> */}
                {/*     <Image src={'/img/completed.png'} fill alt="completed"></Image> */}
                {/*   </div> */}
                {/*   <p className="lg:text-xl ">Completed: <b>{completed}</b></p> */}
                {/* </div> */}
            </div>
        </>
    );
}
