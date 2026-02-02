'use client'

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserCollectionList, updateCollection } from "@/app/api/actions/collections";
import { ActionResponse } from "@/app/api/actions/types";
import { LeftArrowIcon } from "@/app/ui/commons/icons";
import { Loading, TextArea, TextInput, ToggleButton, MultiSelectDropdown } from "@/app/ui/commons/snippets";
import { AutoCompleteSelectedTermType } from "@/app/ui/widgets/types";
import AutoCompleteTSS from "@/app/ui/widgets/autocomplete";
import { PortalCollection, PortalTerminology } from "@/app/concepts";
import { getUserList } from "@/app/api/actions/users";



export default function CollectionEdit() {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [collection, setCollection] = useState<PortalCollection>(new PortalCollection());
  const [formIsSubmitted, setFormIsSubmited] = useState<boolean>(false);
  const [selectedTermonologies, setSelectedTerminologies] = useState<AutoCompleteSelectedTermType[]>([]);
  const [preselectedTerminologies, setPreselectedTerminologies] = useState<{ "label": string, "iri": string }[]>();
  const [users, setUsers] = useState<string[]>([]);
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>([]);

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

  function onSelect(selectedList: string[], selectedItem: string) {
    setSelectedCollaborators(selectedList);
  }

  function onRemove(selectedList: string[], removedItem: string) {
    setSelectedCollaborators(selectedList);
  }

  useEffect(() => {
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
        preselected.push({ label: terminology.label, iri: "" });
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
              <div className="form-input-group" key={"terminology-list"}>
                <AutoCompleteTSS
                  setSelectedTerm={(terms: AutoCompleteSelectedTermType[]) => {
                    setSelectedTerminologies(terms);
                    (document.getElementsByClassName('autocomplete-in-form')[0]! as HTMLDivElement).style.border = "";
                  }}
                  label="Terminologies"
                  placeholder="Choose your terminologies ..."
                  parameter="type=ontology"
                  //@ts-ignore
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
