'use client'

import CollectionCard from "@/app/ui/collection/collectionCard";
import { TextInput } from "@/app/ui/commons/snippets";
import { useEffect, useState } from "react";
import { PortalTerminology, PortalCollection, PortalCollectionJsonData } from "@/app/concepts";

const COLLECTION_LIST_PAGE_SIZE = 5;

export default function CollectionListCmp(props: { collections: PortalCollectionJsonData[] }) {
  const collections = props.collections.map((data: PortalCollectionJsonData) => PortalCollection.toObject(data));

  const [collectionsList, setCollectionsList] = useState<PortalCollection[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(COLLECTION_LIST_PAGE_SIZE);

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
        return collection.terminologies.find((terminology: PortalTerminology) => terminology.label.toLowerCase().includes(query));
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
      <div className="mt-5">
        <TextInput
          id="filter"
          name="collection-filter"
          type="text"
          labelText="Search For Collection"
          placeHolder="search for collections ..."
          key={"collection-filter"}
          required={false}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            filterList(e.target.value)
          }}
        />
      </div>

      {collectionsList.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((col: PortalCollection) => {
        return (
          <>
            <div className="pt-5" key={"collections-list-container"}>
              <CollectionCard collection={col} />
            </div>
          </>
        )
      })}
      <div className="flex flex-col items-center mt-3">
        <span className="text-sm text-gray-700 dark:text-gray-400">
          Showing <span className="mr-1 font-semibold text-gray-900 dark:text-white">{collectionsList.length ? (currentPage - 1) * pageSize + 1 : 0}</span>
          to
          <span className="ml-1 mr-1 font-semibold text-gray-900 dark:text-white">
            {collectionsList.length >= pageSize
              ? (currentPage * pageSize <= collectionsList.length ? currentPage * pageSize : collectionsList.length)
              : collectionsList.length
            }</span>
          of <span className="mr-1 font-semibold text-gray-900 dark:text-white">{collectionsList.length}</span>
          Collections
        </span>
        <div className="inline-flex mt-2 xs:mt-0">
          <button
            className="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-ts4nfdi-brand-color rounded-s hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            onClick={handlePrevPageClick}
          >
            <svg className="w-3.5 h-3.5 me-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5H1m0 0 4 4M1 5l4-4" />
            </svg>
            Prev
          </button>
          <button
            className="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-ts4nfdi-brand-color border-0 border-s border-gray-700 rounded-e hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            onClick={handleNextPageClick}
          >
            Next
            <svg className="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}