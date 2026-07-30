'use client'

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserCollectionList, updateCollection } from "@/app/api/actions/collections";
import { ActionResponse } from "@/app/api/actions/types";
import { LeftArrowIcon } from "@/app/ui/commons/icons";
import { Loading, TextArea, TextInput, ToggleButton, MultiSelectDropdown, CheckBox } from "@/app/ui/commons/snippets";
import { AutoCompleteSelectedTermType } from "@/app/ui/widgets/types";
import AutoCompleteTSS from "@/app/ui/widgets/autocomplete";
import { PortalCollection, PortalTerminology, PortalProvider, PortalSourcesJsonData } from "@/app/concepts";
import { getUserList } from "@/app/api/actions/users";
import { getSourcesListOfTerminologies, getAllProviders } from "@/app/api/actions/providers";
import { useLocale } from "@/app/i18n";
import { collectionUiMessages } from "@/app/ui/collection/messages";
import { localizePath } from "@/app/libs/localePath";



export default function CollectionEdit() {
  const locale = useLocale();
  const t = collectionUiMessages[locale];
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [collection, setCollection] = useState<PortalCollection>(new PortalCollection());
  const [formIsSubmitted, setFormIsSubmited] = useState<boolean>(false);
  const [selectedTermonologies, setSelectedTerminologies] = useState<AutoCompleteSelectedTermType[]>([]);
  const [preselectedTerminologies, setPreselectedTerminologies] = useState<{ "label": string, "iri": string, source: string }[]>();
  const [users, setUsers] = useState<string[]>([]);
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>([]);
  const [autocompleteIsLoaded, setAutocompleteIsLoaded] = useState<boolean>(true);
  const [dbs, setDbs] = useState<PortalProvider[]>([]);

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
      window.location.href = localizePath(`/collection/myCollections?edited=${res.status}`, locale);

    } catch {
      return;
    }
  }

  function loadTerminologies(e: React.ChangeEvent<HTMLInputElement>) {
    let db = e.target.id;
    setAutocompleteIsLoaded(false);
    if (e.target.checked) {
      getSourcesListOfTerminologies(db).then((terminologies) => {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function onSelect(selectedList: string[], _selectedItem: string) {
    setSelectedCollaborators(selectedList);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function onRemove(selectedList: string[], _removedItem: string) {
    setSelectedCollaborators(selectedList);
  }

  useEffect(() => {
    getAllProviders().then((dbs: PortalSourcesJsonData[]) => {
      let providers = [];
      for (let db of dbs) {
        providers.push(PortalProvider.toObject(db));
      }
      setDbs(providers);
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
          <a className="btn" href={localizePath("/collection/myCollections/", locale)} key={"back-btn"}><LeftArrowIcon />{t.collectionList}</a>
          <p className="header-2" key={"heading"}>{t.edit}{collection.label}</p>
          {!formIsSubmitted &&
            <form
              key={"collection-form"}
              className="mt-10"
              onSubmit={submit}
              onKeyDown={(e: React.KeyboardEvent<HTMLFormElement>) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                }
              }}
            >
              <div className="form-input-group">
                <ToggleButton id={"visibility"} label={t.public} />
              </div>
              <div className="form-input-group">
                <TextInput
                  id="collection-title"
                  name="collection-title"
                  type="text"
                  labelText={t.title}
                  placeHolder={t.titlePlaceholder}
                  key={"collection-title"}
                  defaultValue={collection.label}
                  required
                />
              </div>
              <div className="form-input-group">
                <p className="" key={"title"}>{t.importHelp}</p>
                <ul
                  className="flex md:flex-row flex-col flex-wrap  items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  {dbs.map((db: PortalProvider) => {
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
                    label={t.terminologies}
                    placeholder={t.terminologyPlaceholder}
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
                  placeholder={t.descriptionPlaceholder}
                  labelText={t.description}
                  rows={10}
                  defaultValue={collection.description}
                />
              </div>
              <div className="form-input-group" key={"collaborators-list"}>
                <label htmlFor="collection-collaborators" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  {t.collaboratorsFull}
                </label>
                <MultiSelectDropdown
                  id="collection-collaborators"
                  placeholder={t.usersPlaceholder}
                  options={users}
                  selectedValues={selectedCollaborators}
                  onSelect={onSelect}
                  onRemove={onRemove}
                />
              </div>
              <div className="text-end" key={"submit-btn"}>
                <button type="submit" className="btn">{t.save}</button>
              </div>
            </form>
          }
        </div>
      }
    </>
  );
}
