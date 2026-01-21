'use client'

// import { Modal } from "@/app/ui/commons/modal";
// import { EditIcon, TrashIcon } from "@/app/ui/commons/icons";
// import { WarningAlert } from "@/app/ui/commons/snippets";
// import { deleteCollection } from "@/app/api/actions/collections";
import { CopyToClipboard } from "@/app/clientExports";
import { PortalCollection, PortalTerminology, PortalCollectionJsonData } from "@/app/concepts";



export default function CollectionContentCmp(props: { collection: PortalCollectionJsonData }) {
  const collection = PortalCollection.toObject(props.collection);

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
    <>
      <div className="grid grid-cols-10" key={"collection-card-header"}>
        <div className="col-span-9 flex flex-col flex-wrap gap-6">
          <div key={"label-and-copy"} className="border rounded bg-gray-100 md:p-3 md:w-1/4 dark:bg-gray-700">
            <CopyToClipboard textToCopy={props.collection.id!} key={"copy"} />
            <p key={"collection-id"} className="inline-block  text-sm">{props.collection.id}</p>
          </div>
          <p key={"collection-desc"} dangerouslySetInnerHTML={{ __html: props.collection.description }}></p>
          <div className="flex flex-row flex-wrap gap-2" key={"collection-terminologies"}>
            <b>Terminologies:</b> {renderTerminologies(collection.terminologies)}
          </div>
        </div>
        {/*<div className="col-span-1 flex flex-col flex-wrap" key={"trash-icon"}>
          <ModalButton label={<TrashIcon />} targetModalId={"delete-collection-conf-" + props.collection.id}
            classNames="!bg-transparent !p-0 !text-white" />
          <a className="!bg-transparent text-end p-0" href={`/collection/edit/${props.collection.id}`}
            key={"edit-collection"}><EditIcon /></a>
        </div>*/}
      </div>
      {/*<Modal
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
      />*/}
    </>
  )
}