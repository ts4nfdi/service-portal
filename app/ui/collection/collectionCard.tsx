'use client'

import {Collection} from "@/app/api/actions/types";
import {ModalButton, Modal} from "../commons/modal";
import {WarningAlert} from "../commons/snippets";
import {deleteCollection} from "@/app/api/actions/collections";
import {TrashIcon, EditIcon} from "../commons/icons";
import {CopyToClipboard} from "@/app/ui/commons/clientExports";
import './styles.css';


type CmpProps = {
    collection: Collection
}

export default function CollectionCard(props: CmpProps) {


    return (
        <div className="collection-card" key={props.collection.id}>
            <div className="grid grid-cols-10" key={"collection-card-header"}>
                <p className="header-4 col-span-9" key={"collection-title"}>{props.collection.label}</p>
                <div className="col-span-1 grid grid-rows-1 p-0" key={"trash-icon"}>
                    <ModalButton label={<TrashIcon/>} targetModalId={"delete-collection-conf-" + props.collection.id}
                                 classNames="!bg-transparent !p-0 !text-white"/>
                    <Modal
                        id={"delete-collection-conf-" + props.collection.id}
                        title={"Delete Collection: " + props.collection.label}
                        content={<WarningAlert
                            message="Are you sure about deleting this collection? This action is irreversible!"/>}
                        actionBtn
                        actionBtnLabel="Yes, I am sure"
                        actionBtnCallback={async () => {
                            let resp = await deleteCollection(props.collection.id!);
                            window.location.href = `/collection/myCollections?deleted=${resp.status}`;
                        }}
                    />
                    <a className="!bg-transparent text-end p-0" href={`/collection/edit/${props.collection.id}`}
                       key={"edit-collection"}><EditIcon/></a>
                </div>
            </div>
            <div key={"label-and-copy"}>
                <p key={"collection-id"} className="inline-block">{props.collection.id}</p>
                <CopyToClipboard textToCopy={props.collection.id!} key={"copy"}/>
            </div>
            <p key={"collection-desc"} dangerouslySetInnerHTML={{__html: props.collection.description}}></p>
            <p key={"collection-terminologies"}><b>Terminologies:</b> {props.collection.terminologies.join(", ")}</p>
        </div>
    );
}
