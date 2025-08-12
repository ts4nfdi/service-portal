'use client'

import {useParams} from "next/navigation";
import {useEffect, useState} from "react";
import {getUserCollectionList, editCollection} from "@/app/api/actions/collections";
import {ActionResponse, Collection} from "@/app/api/actions/types";
import {LeftArrowIcon} from "@/app/ui/commons/icons";
import {Loading, TextArea, TextInput} from "@/app/ui/commons/snippets";
import {AutoCompleteSelectedTermType} from "@/app/ui/widgets/types";
import AutoCompleteTSS from "@/app/ui/widgets/autocomplete";
import {Terminology} from "@/app/api/actions/types";


export default function CollectionEdit() {
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [collection, setCollection] = useState<Collection>({
        id: "",
        description: "",
        label: "",
        terminologies: [],
        isPublic: true,
        collaborators: []
    });
    const [formIsSubmitted, setFormIsSubmited] = useState<boolean>(false);
    const [selectedTermonologies, setSelectedTerminologies] = useState<AutoCompleteSelectedTermType[]>([]);
    const [preselectedTerminologies, setPreselectedTerminologies] = useState<{ "label": string, "iri": string }[]>();

    const params = useParams();
    const slug = params?.slug;

    async function submit(e: React.FormEvent) {
        try {
            e.preventDefault();
            let form = document.querySelector('form')!;
            let formData = new FormData(form);
            let collectionData: Collection = {
                description: formData.get("collection-desc")! as string,
                label: formData.get("collection-title")! as string,
                collaborators: [],
                isPublic: true,
                terminologies: selectedTermonologies.map((terminilogy: AutoCompleteSelectedTermType) => {
                    return {
                        label: terminilogy.label,
                        source: terminilogy.source,
                        uri: terminilogy.iri,
                        type: "DATABASE",
                    } as Terminology;
                }),
                id: collection.id
            };

            if (selectedTermonologies.length === 0) {
                (document.getElementsByClassName('autocomplete-in-form')[0]! as HTMLDivElement).style.border = "1px solid #445669";
                return;
            }

            setFormIsSubmited(true);
            setLoading(true);

            let res = await editCollection(collectionData);
            if (!res.status) {
                setError(res.content);
            }

            setLoading(false);
            window.location.href = `/collection/myCollections?edited=${!error}`;

        } catch {
            return;
        }
    }

    useEffect(() => {
        getUserCollectionList().then((resp: ActionResponse) => {
            if (!resp.status) {
                setError(resp.content);
                return;
            }

            let targetCollection = (resp.content as Collection[]).find((col) => col.id === slug);
            if (!targetCollection) {
                setError("not allowed");
                return;
            }
            let preselected = [];
            for (let terminology of targetCollection.terminologies as Terminology[]) {
                preselected.push({label: terminology.label, iri: ""});
            }
            setPreselectedTerminologies(preselected);
            setCollection(targetCollection);
        }).finally(() => setLoading(false));

    }, [slug]);

    return (
        <>
            {loading && <Loading/>}
            {error && !loading && <p>{error}</p>}
            {!error && !loading &&
              <div className="md:col-span-2 content-panel">
                <a className="btn" href="/collection/myCollections/" key={"back-btn"}><LeftArrowIcon/>Collection
                  list</a>
                <p className="header-2" key={"heading"}>Edit your collection: {collection.label}</p>
                  {!formIsSubmitted &&
                    <form key={"collection-form"} className="mt-10" onSubmit={submit}>
                      <div className="form-input-group">
                        <TextInput
                          id="collection-title"
                          name="collection-title"
                          type="text"
                          labelText="Collection Title"
                          placeHolder="please add the collection title ..."
                          key={"collection-title"}
                          defaultValue={collection.label}
                          required
                        />
                      </div>
                      <div className="form-input-group" key={"terminology-list"}>
                        <AutoCompleteTSS
                          setSelectedTerm={(terms: AutoCompleteSelectedTermType[]) => {
                              setSelectedTerminologies(terms);
                              (document.getElementsByClassName('autocomplete-in-form')[0]! as HTMLDivElement).style.border = "";
                          }}
                          label="Terminologies"
                          placeholder="Choose your terminologies ..."
                          parameter="type=ontology"
                          preselected={preselectedTerminologies}
                          required
                        />
                      </div>
                      <div className="form-input-group" key="description">
                        <TextArea
                          id="description"
                          required
                          name="collection-desc"
                          placeholder="please add a description for your collection ..."
                          labelText="Description"
                          rows={10}
                        />
                      </div>
                      <div className="text-center" key={"submit-btn"}>
                        <button type="submit" className="btn">Save</button>
                      </div>
                    </form>
                  }
              </div>
            }
        </>
    );
} 
