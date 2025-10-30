'use client'

import CollectionCard from "@/app/ui/collection/collectionCard";
import { TextInput } from "@/app/ui/commons/snippets";
import { useEffect, useState } from "react";
import { PortalTerminology, PortalCollection, PortalCollectionJsonData } from "@/app/concepts";


export default function CollectionListCmp(props: { collections: PortalCollectionJsonData[] }) {
  const collections = props.collections.map((data: PortalCollectionJsonData) => PortalCollection.toObject(data));

  const [collectionsList, setCollectionsList] = useState<PortalCollection[]>([]);

  function filterList(query: string) {
    let filteredCollections: PortalCollection[] = [];
    if (query) {
      query = query.toLowerCase();
      filteredCollections = collections.filter((collection: PortalCollection) => {
        if (collection.label.toLowerCase().includes(query)) {
          return true
        }
        if (collection.id && collection.id.includes(query)) {
          return true
        }
        if (collection.description.toLowerCase().includes(query)) {
          return true
        }
        return collection.terminologies.find((terminology: PortalTerminology) => terminology.label.toLowerCase().includes(query));
      });
      setCollectionsList(filteredCollections);
    } else {
      setCollectionsList(collections);
    }
  }

  useEffect(() => {
    setCollectionsList(collections);
  }, []);

  return (
    <>
      <div className="mt-5">
        <TextInput
          id="filter"
          name="collection-filter"
          type="text"
          labelText="Search For Collection"
          placeHolder="enter search query ..."
          key={"collection-filter"}
          required={false}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            filterList(e.target.value)
          }}
        />
      </div>
      {collectionsList.map((col: PortalCollection) => {
        return (
          <>
            <div className="pt-5" key={"collections-list-container"}>
              <CollectionCard collection={col} />
            </div>
          </>
        )
      })}
    </>
  );
}