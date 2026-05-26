'use client'

import {ModalButton, Modal} from "../commons/modal";
import {WarningAlert} from "../commons/snippets";
import {deleteCollection} from "@/app/api/actions/collections";
import {TrashIcon, EditIcon, DownloadIcon} from "../commons/icons";
import {CopyToClipboard} from "@/app/clientExports";
import './styles.css';
import Link from "next/link";
import {PortalTerminology, PortalCollection} from "@/app/concepts";
import {useSession} from "next-auth/react";
import TerminologyInfoModal from "@/app/ui/collection/terminologyInfoModal";


type CmpProps = {
    collection: PortalCollection
}

export default function CollectionCard(props: CmpProps) {

    const session = useSession();
    const isOwner = props.collection.creator === session?.data?.user?.username;

    function downloadCollectionJsonData() {
        const json = JSON.stringify(props.collection.toJson(), null, 2);
        const blob = new Blob([json], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `collection-${props.collection.id}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    }

    function renderTerminologies(terminologies: PortalTerminology[]) {
        let result = [];
        for (let terminology of terminologies) {
            result.push(
                <TerminologyInfoModal
                    collectionId={props.collection.id}
                    key={`${props.collection.id}-${terminology.source}-${terminology.label}`}
                    terminology={terminology}
                />
            );
        }
        return result;
    }

    return (
        <div className="collection-card" key={props.collection.id}>
            <div className="grid grid-cols-10" key={"collection-card-header"}>
                <Link href={"/collection/" + props.collection.id} className="col-span-9">
                    <p className="header-4 inline-block" key={"collection-title"}>{props.collection.label}</p>
                    {!props.collection.isPublic &&
                      <p
                        className="badge inline-block ml-2 bg-black !text-white !font-bold px-1 py-1 dark:!bg-white dark:!text-black">private</p>
                    }
                </Link>
                <div className="col-span-1 flex flex-col items-end gap-2 p-0" key={"collection-actions"}>
                    {isOwner &&
                      <>
                        <ModalButton label={<TrashIcon/>}
                                     targetModalId={"delete-collection-conf-" + props.collection.id}
                                     classNames="!bg-transparent !m-0 !p-0 !px-0 !pe-0 !text-white flex items-center justify-end"/>
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
                      </>
                    }
                    {props.collection.isPublic &&
                      <button
                          aria-label="Download collection as JSON"
                          className="!bg-transparent text-end p-0"
                          onClick={downloadCollectionJsonData}
                          title="Download collection as JSON"
                          type="button"
                      >
                          <DownloadIcon/>
                      </button>
                    }
                </div>
            </div>
            <div key={"label-and-copy"} className="!text-sm">
                <p className="font-bold inline mr-2">uuid:</p>
                <p key={"collection-id"} className="inline-block">{props.collection.id}</p>
                <CopyToClipboard textToCopy={props.collection.id!} key={"copy"}/>
            </div>
            <div key={"permalink-and-copy"} className="!text-sm">
                <p className="font-bold inline mr-2">PermaLink:</p>
                <p key={"collection-permalink"}
                   className="inline-block">{props.collection.permaLink}</p>
                <CopyToClipboard textToCopy={props.collection.permaLink}
                                 key={"copy"}/>
            </div>
            <p key={"creator"} className="text-sm">Created by: {props.collection.creator}</p>
            <p key={"collection-desc"}>{props.collection.description}</p>
            <div className="flex flex-row flex-wrap gap-2" key={"collection-terminologies"}>
                <b>Terminologies:</b> {renderTerminologies(props.collection.terminologies)}</div>
        </div>
    );
}
