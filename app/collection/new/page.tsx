'use client'

import { CheckBox, TextInput } from "@/app/ui/commons/snippets";
import AutoCompleteTSS from "@/app/ui/widgets/autocomplete";
import { LeftArrowIcon } from "@/app/ui/commons/icons";
import { useEffect, useState } from "react";
import { AutoCompleteSelectedTermType } from "@/app/ui/widgets/types";
import { createCollection } from "@/app/api/actions/collections";
import { Loading, TextArea } from "@/app/ui/commons/snippets";
import { ToggleButton } from "@/app/ui/commons/snippets";
import { getAllDatabases, getDatabasedListOfTerminologies } from "@/app/api/actions/databases";
import { PortalCollection, PortalTerminology, PortalDatabase, PortalDatabaseJsonData } from "@/app/concepts";


export default function NewCollection() {

  const [selectedTermonologies, setSelectedTerminologies] = useState<AutoCompleteSelectedTermType[]>([]);
  const [formIsSubmitted, setFormIsSubmited] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [dbs, setDbs] = useState<PortalDatabase[]>([]);
  const [preselectedTerminologies, setPreselectedTerminologies] = useState<{
    "label": string,
    "iri": string,
    source: string
  }[]>();
  const [autocompleteIsLoaded, setAutocompleteIsLoaded] = useState<boolean>(true);


  async function submit(e: React.FormEvent) {
    try {
      e.preventDefault();
      if (selectedTermonologies.length === 0) {
        (document.getElementsByClassName('autocomplete-in-form')[0]! as HTMLDivElement).style.border = "1px solid #445669";
        return;
      }
      let visBox = (document.getElementById("visibility")! as HTMLInputElement);
      let form = document.querySelector('form')!;
      let formData = new FormData(form);
      let pCollection = new PortalCollection();
      pCollection.description = formData.get("collection-desc")! as string;
      pCollection.label = formData.get("collection-title")! as string;
      pCollection.collaborators = [];
      pCollection.isPublic = visBox.checked;
      pCollection.terminologies = selectedTermonologies.map((terminilogy: AutoCompleteSelectedTermType) => {
        let t = new PortalTerminology();
        t.label = terminilogy.label ?? "";
        t.uri = terminilogy.iri ?? "";
        t.source = terminilogy.source ?? "";
        t.type = "DATABASE";
        return t;
      });

      setFormIsSubmited(true);
      setLoading(true);

      let res = await createCollection(pCollection.toJson());
      window.location.href = `/collection/myCollections?created=${res.status}`;

    } catch {
      return;
    }
  }

  function loadTerminologies(e: React.ChangeEvent<HTMLInputElement>) {
    let db = e.target.id;
    setAutocompleteIsLoaded(false)
    if (e.target.checked) {
      getDatabasedListOfTerminologies(db).then((terminologies) => {
        let preselected = [];
        for (let terminology of terminologies) {
          preselected.push({ label: terminology.label, iri: terminology.iri, source: db });
        }
        if (preselectedTerminologies) {
          setPreselectedTerminologies([...preselectedTerminologies, ...preselected]);
        } else {
          setPreselectedTerminologies(preselected);
        }
      })
    } else {
      let preselected = preselectedTerminologies?.filter((item) => item.source != db);
      setPreselectedTerminologies(preselected);
    }
  }

  useEffect(() => {
    setAutocompleteIsLoaded(true)
  }, [preselectedTerminologies]);

  useEffect(() => {
    getAllDatabases().then((dbs: PortalDatabaseJsonData[]) => {
      let databases = [];
      for (let db of dbs) {
        databases.push(PortalDatabase.toObject(db));
      }
      setDbs(databases);
    })
  }, []);

  return (
    <div className="md:col-span-2 content-panel">
      <a className="btn" href="/collection/myCollections/" key={"back-btn"}><LeftArrowIcon />Collection list</a>
      <p className="header-2" key={"heading"}>Define your new collection</p>
      {loading && <Loading />}
      {!formIsSubmitted &&
        <form key={"collection-form"} className="mt-10" onSubmit={submit}>
          <div className="form-input-group">
            <ToggleButton id={"visibility"} label="Public" />
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
          <div className="form-input-group">
            <p className="" key={"title"}>You can import all the terminologies from the selected terminology
              services.</p>
            <ul
              className="flex md:flex-row flex-col flex-wrap  items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              {dbs.map((db: PortalDatabase) => {
                return (
                  <li className="w-1/5 ml-0 mr-0 list-none p-2 border-b border-gray-200 sm:border-b-0  dark:border-gray-600"
                    key={db.name}>
                    <CheckBox id={db.name} label={db.name} onChange={loadTerminologies} />
                  </li>
                );
              })
              }
            </ul>
          </div>
          <div className="form-input-group" key={"terminology-list"}>
            {autocompleteIsLoaded &&
              <AutoCompleteTSS
                setSelectedTerm={(terms: AutoCompleteSelectedTermType[]) => {
                  setSelectedTerminologies(terms);
                  (document.getElementsByClassName('autocomplete-in-form')[0]! as HTMLDivElement).style.border = "";
                }}
                label="Terminologies"
                placeholder="Choose your terminologies ..."
                parameter="type=ontology"
                required
                preselected={preselectedTerminologies}
              />
            }
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
          <div className="text-end" key={"submit-btn"}>
            <button type="submit" className="btn">Create</button>
          </div>
        </form>
      }
    </div>
  );
}
