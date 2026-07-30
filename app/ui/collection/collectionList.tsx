'use client'

import CollectionCard from "@/app/ui/collection/collectionCard";
import {TextInput} from "@/app/ui/commons/snippets";
import {useEffect, useState} from "react";
import {PortalCollection, PortalCollectionJsonData} from "@/app/concepts";
import {Pagination} from "@/app/clientExports";
import {DownloadIcon} from "@/app/ui/commons/icons";
import { useLocale } from "@/app/i18n";
import { collectionUiMessages } from "./messages";


const COLLECTION_LIST_PAGE_SIZE = 5;

export default function CollectionListCmp(props: {
    collections: PortalCollectionJsonData[],
    showDownloadButton?: boolean
}) {
    const t = collectionUiMessages[useLocale()];
    const collections = props.collections.map((data: PortalCollectionJsonData) => PortalCollection.toObject(data));

    const [collectionsList, setCollectionsList] = useState<PortalCollection[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(COLLECTION_LIST_PAGE_SIZE);

  function downloadCollectionsJsonData() {
    const publicCollections = props.collections.filter((collection) => collection.isPublic);
    const json = JSON.stringify(publicCollections, null, 2);
        const blob = new Blob([json], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "my-collections.json";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    }

    function filterList(query: string) {
        let filteredCollections: PortalCollection[] = [];
        if (query) {
            query = query.toLowerCase();
            filteredCollections = collections.filter((collection: PortalCollection) => {
                if (collection.label.toLowerCase().includes(query)) {
                    return true;
                }
                if (collection.id && collection.id.includes(query)) {
                    return true;
                }
                if (collection.description.toLowerCase().includes(query)) {
                    return true;
                }
                return false;
            });
            setCollectionsList(filteredCollections);
            setCurrentPage(1);
        } else {
            setCollectionsList(collections);
            setCurrentPage(1);
        }
    }

    function handleNextPageClick(): undefined {
        let maxPage = Math.ceil(collectionsList.length / pageSize);
        if (currentPage < maxPage) {
            setCurrentPage(currentPage + 1);
        }
    }

    function handlePrevPageClick(): undefined {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    }

    useEffect(() => {
        setCollectionsList(collections);
        setPageSize(collections.length < pageSize ? collections.length : COLLECTION_LIST_PAGE_SIZE);
    }, []);


    return (
        <>
            <div className="flex flex-row my-5">
                <div className="w-3/4">
                    <TextInput
                        id="filter"
                        name="collection-filter"
                        type="text"
                        labelText={t.searchLabel}
                        placeHolder={t.searchPlaceholder}
                        key={"collection-filter"}
                        required={false}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            filterList(e.target.value)
                        }}
                    />
                </div>
                <div className="w-1/4">
                    <Pagination
                        size={pageSize}
                        page={currentPage}
                        objectName={t.collections}
                        total={collectionsList.length}
                        handleNextPageClick={handleNextPageClick}
                        handlePrevPageClick={handlePrevPageClick}
                    />
                </div>

            </div>
            {props.showDownloadButton &&
              <div className="mb-2 flex justify-start">
                <button
                  aria-label={t.downloadMyPublicJson}
                  className="btn !mb-0 !me-0 !p-2 !text-sm flex items-center gap-2"
                  onClick={downloadCollectionsJsonData}
                  title={t.downloadPublicJson}
                  type="button"
                >
                  <DownloadIcon/>
                  {t.downloadMyPublic}
                </button>
              </div>
            }
            {collectionsList.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((col: PortalCollection) => {
                return (
                    <>
                        <div className="pt-5" key={"collections-list-container"}>
                            <CollectionCard collection={col}/>
                        </div>
                    </>
                )
            })}
            <Pagination
                size={pageSize}
                page={currentPage}
                objectName={t.collections}
                total={collectionsList.length}
                handleNextPageClick={handleNextPageClick}
                handlePrevPageClick={handlePrevPageClick}
            />

        </>
    );
}
