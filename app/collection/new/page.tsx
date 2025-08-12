'use client'

import {TextInput} from "@/app/ui/commons/snippets";
import AutoCompleteTSS from "@/app/ui/widgets/autocomplete";
import {LeftArrowIcon} from "@/app/ui/commons/icons";
import {useState} from "react";
import {AutoCompleteSelectedTermType} from "@/app/ui/widgets/types";
import {Collection} from "@/app/api/actions/types";
import {createCollection} from "@/app/api/actions/collections";
import {Loading, TextArea} from "@/app/ui/commons/snippets";
import {Terminology} from "@/app/api/actions/types";
import {ToggleButton} from "@/app/ui/commons/snippets";


export default function NewCollection() {

    const [selectedTermonologies, setSelectedTerminologies] = useState<AutoCompleteSelectedTermType[]>([]);
    const [formIsSubmitted, setFormIsSubmited] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);


    async function submit(e: React.FormEvent) {
        try {
            e.preventDefault();
            let visBox = (document.getElementById("visibility")! as HTMLInputElement);
            let form = document.querySelector('form')!;
            let formData = new FormData(form);
            let collectionData: Collection = {
                description: formData.get("collection-desc")! as string,
                label: formData.get("collection-title")! as string,
                collaborators: [],
                isPublic: visBox.checked,
                terminologies: selectedTermonologies.map((terminilogy: AutoCompleteSelectedTermType) => {
                    return {
                        label: terminilogy.label,
                        source: terminilogy.source,
                        uri: terminilogy.iri,
                        type: "DATABASE"
                    } as Terminology;
                })
            };

            if (selectedTermonologies.length === 0) {
                (document.getElementsByClassName('autocomplete-in-form')[0]! as HTMLDivElement).style.border = "1px solid #445669";
                return;
            }

            setFormIsSubmited(true);
            setLoading(true);

            let res = await createCollection(collectionData);
            window.location.href = `/collection/myCollections?created=${res.status}`;

        } catch (e) {
            return;
        }
    }

    return (
        <div className="md:col-span-2 content-panel">
            <a className="btn" href="/collection/myCollections/" key={"back-btn"}><LeftArrowIcon/>Collection list</a>
            <p className="header-2" key={"heading"}>Define your new collection</p>
            {loading && <Loading/>}
            {!formIsSubmitted &&
              <form key={"collection-form"} className="mt-10" onSubmit={submit}>
                <div className="form-input-group">
                  <ToggleButton id={"visibility"} label="Public"/>
                </div>
                <div className="form-input-group">
                  <TextInput
                    id="collection-title"
                    name="collection-title"
                    type="text"
                    labelText="Collection Title"
                    placeHolder="please add the collection title ..."
                    key={"collection-title"}
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
                  <button type="submit" className="btn">Create</button>
                </div>
              </form>
            }
        </div>
    );
}
