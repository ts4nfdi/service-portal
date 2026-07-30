
'use client'

import { CheckBox, TextInput, MultiSelectDropdown } from "@/app/ui/commons/snippets";
import AutoCompleteTSS from "@/app/ui/widgets/autocomplete";
import { LeftArrowIcon } from "@/app/ui/commons/icons";
import { useEffect, useState } from "react";
import { AutoCompleteSelectedTermType } from "@/app/ui/widgets/types";
import { createCollection } from "@/app/api/actions/collections";
import { Loading, TextArea } from "@/app/ui/commons/snippets";
import { ToggleButton } from "@/app/ui/commons/snippets";
import { getAllProviders, getSourcesListOfTerminologies } from "@/app/api/actions/providers";
import { PortalCollection, PortalTerminology, PortalProvider, PortalSourcesJsonData } from "@/app/concepts";
import { useSession } from "next-auth/react";
import LoginFormWrapper from "@/app/user/login/page";
import { getUserList } from "@/app/api/actions/users";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/app/i18n";
import { collectionUiMessages } from "@/app/ui/collection/messages";
import { localizePath } from "@/app/libs/localePath";


export default function NewCollection() {
  const locale = useLocale();
  const t = collectionUiMessages[locale];

  const session = useSession();

  const searchParams = useSearchParams();

  const [selectedTermonologies, setSelectedTerminologies] = useState<AutoCompleteSelectedTermType[]>([]);
  const [formIsSubmitted, setFormIsSubmited] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [sources, setSources] = useState<PortalProvider[]>([]);
  const [preselectedTerminologies, setPreselectedTerminologies] = useState<{
    "label": string,
    "iri": string,
    source: string
  }[]>([]);
  const [autocompleteIsLoaded, setAutocompleteIsLoaded] = useState<boolean>(true);
  const [users, setUsers] = useState<string[]>([]);
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>([]);


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
      pCollection.collaborators = selectedCollaborators.map((username: string) => {
        return { username: username, role: "ADMIN" };
      });
      pCollection.isPublic = visBox.checked;
      pCollection.terminologies = selectedTermonologies.map((terminology: AutoCompleteSelectedTermType) => {
        let t = new PortalTerminology();
        t.label = terminology.label ?? "";
        t.uri = terminology.iri ?? "";
        t.source = terminology.source ?? "";
        t.type = "DATABASE";
        return t;
      });

      setFormIsSubmited(true);
      setLoading(true);

      let res = await createCollection(pCollection.toJson());
      if (searchParams.get('from') === "my-collections") {
        window.location.href = localizePath(`/collection/myCollections?created=${res.status}`, locale);
      } else {
        window.location.href = localizePath(`/collection/?created=${res.status}`, locale);
      }

    } catch {
      return;
    }
  }

  function loadTerminologies(e: React.ChangeEvent<HTMLInputElement>) {
    let source = e.target.id;
    setAutocompleteIsLoaded(false)
    if (e.target.checked) {
      getSourcesListOfTerminologies(source).then((terminologies) => {
        let preselected = [];
        for (let terminology of terminologies) {
          preselected.push({ label: terminology.label, iri: terminology.iri, source: source });
        }
        if (preselectedTerminologies) {
          setPreselectedTerminologies([...preselectedTerminologies, ...preselected]);
        } else {
          setPreselectedTerminologies(preselected);
        }
      })
    } else {
      let preselected = preselectedTerminologies?.filter((item) => item.source != source);
      setPreselectedTerminologies(preselected);
    }
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
    setAutocompleteIsLoaded(true)
  }, [preselectedTerminologies]);

  useEffect(() => {
    getAllProviders().then((sources: PortalSourcesJsonData[]) => {
      let providers = [];
      for (let source of sources) {
        providers.push(PortalProvider.toObject(source));
      }
      setSources(providers);
    });
    getUserList().then((resp) => {
      if (!resp.status) {
        return;
      }
      let users = resp.content.map((user: { username: string }) => user.username);
      setUsers(users);

    });
  }, []);

  if (!session?.data?.user.token && session.status !== "loading") {
    return <><LoginFormWrapper /></>;
  } else if (session.status === "loading") {
    return <div className="md:col-span-2"><Loading /></div>;
  }

  return (
    <div className="">
      {searchParams.get('from') === "my-collections"
        ? <a className="btn" href={localizePath("/collection/myCollections/", locale)} key={"back-btn"}><LeftArrowIcon />{t.myCollectionList}</a>
        : <a className="btn" href={localizePath("/collection/", locale)} key={"back-btn"}><LeftArrowIcon />{t.collectionsList}</a>
      }
      <p className="header-2" key={"heading"}>{t.defineNew}</p>
      {loading && <Loading />}
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
              required
            />
          </div>
          <div className="form-input-group">
            <p className="" key={"title"}>{t.importHelp}</p>
            <ul
              className="flex md:flex-row flex-col flex-wrap  items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              {sources.map((db: PortalProvider) => {
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
            {autocompleteIsLoaded &&
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
            <button type="submit" className="btn">{t.create}</button>
          </div>
        </form>
      }
    </div>
  );
}
