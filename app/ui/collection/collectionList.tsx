'use client'

import {Collection, Terminology} from "@/app/api/actions/types";
import CollectionCard from "@/app/ui/collection/collectionCard";
import {TextInput} from "@/app/ui/commons/snippets";
import {useEffect, useState} from "react";


export default function CollectionListCmp(props: { collections: Collection[] }) {

    const [collectionsList, setCollectionsList] = useState<Collection[]>([]);

    function filterList(query: string) {
        let filteredCollections: Collection[] = [];
        if (query) {
            query = query.toLowerCase();
            filteredCollections = props.collections.filter((collection: Collection) => {
                if (collection.label.toLowerCase().includes(query)) {
                    return true
                }
                if (collection.id && collection.id.includes(query)) {
                    return true
                }
                if (collection.description.toLowerCase().includes(query)) {
                    return true
                }
                return collection.terminologies.find((terminology: Terminology) => terminology.label.toLowerCase().includes(query));
            });
            setCollectionsList(filteredCollections);
        } else {
            setCollectionsList(props.collections);
        }
    }

    useEffect(() => {
        setCollectionsList(props.collections);
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
            {collectionsList.map((col: Collection) => {
                return (
                    <>
                        <div className="pt-5" key={"collections-list-container"}>
                            <CollectionCard collection={col}/>
                        </div>
                    </>
                )
            })}
        </>
    );
}