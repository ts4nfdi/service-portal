'use client'

import { ModalButton, Modal } from "../commons/modal";
import { WarningAlert } from "../commons/snippets";
import { deleteCollection } from "@/app/api/actions/collections";
import { TrashIcon, EditIcon } from "../commons/icons";
import { CopyToClipboard } from "@/app/clientExports";
import './styles.css';
import Link from "next/link";
import { PortalTerminology, PortalCollection } from "@/app/concepts";
import { useSession } from "next-auth/react";


type CmpProps = {
  collection: PortalCollection
}

export default function CollectionCard(props: CmpProps) {

  const session = useSession();

  function renderTerminologies(terminologies: PortalTerminology[]) {
    let result = [];
    for (let terminology of terminologies) {
      result.push(
        <span className="badge terminology-badge">{terminology.label} ({terminology.source})</span>
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
            <p className="badge inline-block ml-2 bg-black !text-white !font-bold px-1 py-1 dark:!bg-white dark:!text-black">private</p>
          }
        </Link>
        {props.collection.creator === session?.data?.user?.username &&
          <div className="col-span-1 grid grid-rows-1 p-0" key={"trash-icon"}>
            <ModalButton label={<TrashIcon />} targetModalId={"delete-collection-conf-" + props.collection.id}
              classNames="!bg-transparent !p-0 !text-white" />
            <Modal
              id={"delete-collection-conf-" + props.collection.id}
              title={"Delete Collection: " + props.collection.label}
              content={<WarningAlert
                message="Are you sure about deleting this collection? This action is irreversible!" />}
              actionBtn
              actionBtnLabel="Yes, I am sure"
              actionBtnCallback={async () => {
                let resp = await deleteCollection(props.collection.id!);
                window.location.href = `/collection/myCollections?deleted=${resp.status}`;
              }}
            />
            <a className="!bg-transparent text-end p-0" href={`/collection/edit/${props.collection.id}`}
              key={"edit-collection"}><EditIcon /></a>
          </div>
        }
      </div>
      <div key={"label-and-copy"}>
        <p key={"collection-id"} className="inline-block">{props.collection.id}</p>
        <CopyToClipboard textToCopy={props.collection.id!} key={"copy"} />
      </div>
      <p key={"creator"} className="text-sm">Created by: {props.collection.creator}</p>
      <p key={"collection-desc"}>{props.collection.description}</p>
      <div className="flex flex-row flex-wrap gap-2" key={"collection-terminologies"}>
        <b>Terminologies:</b> {renderTerminologies(props.collection.terminologies)}</div>
    </div>
  );
}
