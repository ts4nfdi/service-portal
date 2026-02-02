'use client'

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserCollectionList, updateCollection } from "@/app/api/actions/collections";
import { ActionResponse } from "@/app/api/actions/types";
import { LeftArrowIcon } from "@/app/ui/commons/icons";
import { Loading, TextArea, TextInput, ToggleButton, MultiSelectDropdown, CheckBox } from "@/app/ui/commons/snippets";
import { AutoCompleteSelectedTermType } from "@/app/ui/widgets/types";
import AutoCompleteTSS from "@/app/ui/widgets/autocomplete";
import { PortalCollection, PortalTerminology, PortalDatabase, PortalDatabaseJsonData } from "@/app/concepts";
import { getUserList } from "@/app/api/actions/users";
import { getDatabasedListOfTerminologies, getAllDatabases } from "@/app/api/actions/databases";



export default function CollectionEdit() {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [collection, setCollection] = useState<PortalCollection>(new PortalCollection());
  const [formIsSubmitted, setFormIsSubmited] = useState<boolean>(false);
  const [selectedTermonologies, setSelectedTerminologies] = useState<AutoCompleteSelectedTermType[]>([]);
  const [preselectedTerminologies, setPreselectedTerminologies] = useState<{ "label": string, "iri": string, source: string }[]>();
  const [users, setUsers] = useState<string[]>([]);
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>([]);
  const [autocompleteIsLoaded, setAutocompleteIsLoaded] = useState<boolean>(true);
  const [dbs, setDbs] = useState<PortalDatabase[]>([]);

  const params = useParams();
  const slug = params?.slug;

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
      pCollection.id = collection.id;
      pCollection.description = (document.getElementById("description")! as HTMLTextAreaElement).value;
      pCollection.label = formData.get("collection-title")! as string;
      pCollection.collaborators = selectedCollaborators.map((username: string) => {
        return { username: username, role: "ADMIN" };
      });
      pCollection.isPublic = visBox.checked;
      pCollection.terminologies = selectedTermonologies.map((terminilogy: AutoCompleteSelectedTermType) => {
        let t = new PortalTerminology();
        t.label = terminilogy.label ?? "";
        t.source = terminilogy.source ?? "";
        t.type = "DATABASE";
        t.uri = terminilogy.iri ?? "";
        return t;
      });
      setFormIsSubmited(true);
      setLoading(true);
      let res = await updateCollection(pCollection.toJson());
      window.location.href = `/collection/myCollections?edited=${res.status}`;

    } catch {
      return;
    }
  }

  function loadTerminologies(e: React.ChangeEvent<HTMLInputElement>) {
    let db = e.target.id;
    setAutocompleteIsLoaded(false);
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
    setAutocompleteIsLoaded(true);
  }

  function onSelect(selectedList: string[], _selectedItem: string) {
    setSelectedCollaborators(selectedList);
  }

  function onRemove(selectedList: string[], _removedItem: string) {
    setSelectedCollaborators(selectedList);
  }

  useEffect(() => {
    getAllDatabases().then((dbs: PortalDatabaseJsonData[]) => {
      let databases = [];
      for (let db of dbs) {
        databases.push(PortalDatabase.toObject(db));
      }
      setDbs(databases);
    });
    getUserList().then((resp) => {
      if (!resp.status) {
        return;
      }
      let users = resp.content.map((user: { username: string }) => user.username);
      setUsers(users);

    });
    getUserCollectionList().then((resp: ActionResponse) => {
      if (!resp.status) {
        setError(resp.content);
        return;
      }

      let targetCollection = resp.content.find((col: PortalCollection) => col.id === slug);
      if (!targetCollection) {
        setError("not allowed");
        return;
      }
      let preselected = [];
      for (let terminology of targetCollection.terminologies) {
        preselected.push({ label: terminology.label, iri: "", source: terminology.source });
      }
      let collaborators = targetCollection.collaborators.map((user: { username: string }) => user.username);
      setSelectedCollaborators(collaborators);
      setPreselectedTerminologies(preselected);
      setCollection(targetCollection);

    }).finally(() => setLoading(false));

  }, [slug]);

  useEffect(() => {
    if (!collection.id || loading) {
      return;
    }
    let visBox = (document.getElementById("visibility")! as HTMLInputElement);
    visBox.checked = collection.isPublic;
  }, [collection]);


  return (
    <>
      {loading && <Loading />}
      {error && !loading && <p>{error}</p>}
      {!error && !loading &&
        <div className="md:col-span-2 content-panel">
          <a className="btn" href="/collection/myCollections/" key={"back-btn"}><LeftArrowIcon />Collection
            list</a>
          <p className="header-2" key={"heading"}>Edit your collection: {collection.label}</p>
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
                  defaultValue={collection.label}
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
                      <li className="list-item w-1/5 ml-0 mr-0 list-none p-2 border-b border-gray-200 sm:border-b-0  dark:border-gray-600 dark:bg-gray-700"
                        key={db.name}>
                        <CheckBox id={db.name} label={db.name} onChange={loadTerminologies} />
                      </li>
                    );
                  })
                  }
                </ul>
              </div>
              <div className="form-input-group" key={"terminology-list"}>
                {autocompleteIsLoaded && preselectedTerminologies &&
                  <AutoCompleteTSS
                    setSelectedTerm={(terms: AutoCompleteSelectedTermType[]) => {
                      let selected = terms.filter((term) => !preselectedTerminologies.find((preSelectedTerm) => preSelectedTerm.iri === term.iri));
                      setSelectedTerminologies([...preselectedTerminologies, ...selected]);
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
                  defaultValue={collection.description}
                />
              </div>
              <div className="form-input-group" key={"collaborators-list"}>
                <label htmlFor="collection-collaborators" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Collaborators (attention: collaborators will have full control over the collection)
                </label>
                <MultiSelectDropdown
                  id="collection-collaborators"
                  placeholder="Search for users ..."
                  options={users}
                  selectedValues={selectedCollaborators}
                  onSelect={onSelect}
                  onRemove={onRemove}
                />
              </div>
              <div className="text-end" key={"submit-btn"}>
                <button type="submit" className="btn">Save</button>
              </div>
            </form>
          }
        </div>
      }
    </>
  );
} 
