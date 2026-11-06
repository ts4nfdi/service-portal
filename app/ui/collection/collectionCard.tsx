'use client'

import { downloadJson } from "@/app/ui/commons/downloadJson";
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
import { useLocale } from "@/app/i18n";
import { collectionUiMessages } from "./messages";
import { localizePath } from "@/app/libs/localePath";
import CollectionStatistics from "./collectionStatistics";


type CmpProps = {
    collection: PortalCollection
}

export default function CollectionCard(props: CmpProps) {
    const locale = useLocale();
    const t = collectionUiMessages[locale];

    const session = useSession();
    const canManage = props.collection.canManage(session?.data?.user?.username, session?.data?.user?.orcid);
    const creatorIdentity = props.collection.creatorIdentity();

    function downloadCollectionJsonData() {
        downloadJson(props.collection.toJson(), `collection-${props.collection.id}.json`);
    }

    function renderTerminologies(terminologies: PortalTerminology[]) {
        return terminologies.slice(0, 3).map((terminology) =>
                <TerminologyInfoModal
                    collectionId={props.collection.id}
                    key={`${props.collection.id}-${terminology.source}-${terminology.label}`}
                    terminology={terminology}
                />
        );
    }

    return (
        <div className="collection-card" key={props.collection.id}>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2" key={"collection-card-header"}>
                <Link href={localizePath("/collection/" + props.collection.id, locale)} className="min-w-0">
                    <p className="header-4 inline-block" key={"collection-title"}>{props.collection.label}</p>
                    {!props.collection.isPublic &&
                      <p
                        className="badge inline-block ml-2 bg-black !text-white !font-bold px-1 py-1 dark:!bg-white dark:!text-black">{t.private}</p>
                    }
                </Link>
                <div className="flex items-center justify-end gap-2 p-0" key={"collection-actions"}>
                    {canManage &&
                      <>
                        <ModalButton label={<TrashIcon/>}
                                     targetModalId={"delete-collection-conf-" + props.collection.id}
                                     classNames="!bg-transparent !m-0 !p-0 !px-0 !pe-0 !text-white flex items-center justify-end"/>
                        <Modal
                          id={"delete-collection-conf-" + props.collection.id}
                          title={t.deleteCollection + props.collection.label}
                          content={<WarningAlert
                              message={t.deleteWarning}/>}
                          actionBtn
                          actionBtnLabel={t.confirmDelete}
                          actionBtnCallback={async () => {
                              let resp = await deleteCollection(props.collection.id!);
                              window.location.href = localizePath(`/collection/myCollections?deleted=${resp.status}`, locale);
                          }}
                        />
                        <a className="!bg-transparent text-end p-0" href={localizePath(`/collection/edit/${props.collection.id}`, locale)}
                           key={"edit-collection"}><EditIcon/></a>
                      </>
                    }
                    {props.collection.isPublic &&
                      <button
                          aria-label={t.downloadCollectionAsJson}
                          className="!bg-transparent text-end p-0"
                          onClick={downloadCollectionJsonData}
                          title={t.downloadCollectionAsJson}
                          type="button"
                      >
                          <DownloadIcon/>
                      </button>
                    }
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
                <div className="min-w-0 break-words">
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
                    <p key={"creator"} className="text-sm">
                        {t.createdBy}{creatorIdentity.url ? (
                            <a href={creatorIdentity.url} target="_blank" rel="noopener noreferrer">{creatorIdentity.id}</a>
                        ) : creatorIdentity.id}
                    </p>
                    <p key={"collection-desc"}>{props.collection.description}</p>
                    <div className="flex flex-row flex-wrap gap-2" key={"collection-terminologies"}>
                        <b>{t.terminologies}</b>
                        {renderTerminologies(props.collection.terminologies)}
                        {props.collection.terminologies.length > 3 &&
                          <Link
                            className="badge terminology-badge"
                            href={localizePath(`/collection/${props.collection.id}`, locale)}
                          >
                            {t.moreTerminologies.replace("{count}", (props.collection.terminologies.length - 3).toString())}
                          </Link>
                        }
                    </div>
                </div>
                <CollectionStatistics statistics={props.collection.statistics} variant="card"/>
            </div>
        </div>
    );
}
