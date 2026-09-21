'use client'

import { Loading, MultiSelectDropdown, TextArea, TextInput, ToggleButton } from "@/app/ui/commons/snippets";
import { collectionUiMessages } from "@/app/ui/collection/messages";
import TerminologyTable from "@/app/ui/collection/terminologyTable";
import TerminologyMultiSelect from "@/app/ui/collection/terminologyMultiSelect";
import { PortalOntologyOption } from "@/app/concepts";

type Messages = typeof collectionUiMessages[keyof typeof collectionUiMessages];

type TerminologySelectionFieldProps = {
  messages: Messages;
  options: PortalOntologyOption[];
  selected: PortalOntologyOption[];
  loaded: boolean;
  failed: boolean;
  table?: boolean;
  onRetry: () => void;
  onChange: (options: PortalOntologyOption[]) => void;
}

export function TerminologySelectionField({
  messages,
  options,
  selected,
  loaded,
  failed,
  table = false,
  onRetry,
  onChange,
}: TerminologySelectionFieldProps) {
  return (
    <div className="form-input-group">
      <p className="mb-4 text-gray-700 dark:text-gray-200">{messages.terminologySelectionHelp}</p>
      {!loaded && !failed && <Loading />}
      {failed &&
        <div className="text-center" role="alert">
          <p className="text-red-700 dark:text-red-400">{messages.terminologyLoadError}</p>
          <button type="button" className="btn !p-1 !text-sm" onClick={onRetry}>{messages.retry}</button>
        </div>
      }
      {loaded && table &&
        <TerminologyTable
          editMode
          options={options}
          selected={selected}
          searchPlaceholder={messages.terminologySearchPlaceholder}
          selectAllLabel={messages.selectAllTerminologies}
          terminologyIdLabel={messages.terminologyId}
          providerLabel={messages.provider}
          descriptionLabel={messages.description}
          selectedCountLabel={messages.selectedTerminologyCount}
          previousPageLabel={messages.previousPage}
          nextPageLabel={messages.nextPage}
          pageLabel={messages.pageOf}
          noResults={messages.noTerminologiesFound}
          providerDescriptions={messages.providerDescriptions}
          providerFilterLabel={messages.providerFilter}
          allProvidersLabel={messages.allProviders}
          additionalProvidersLabel={messages.additionalProviders}
          clearProvidersLabel={messages.clearProviders}
          onChange={onChange}
        />
      }
      {loaded && !table &&
        <TerminologyMultiSelect
          label={messages.terminologies}
          options={options}
          selected={selected}
          providerDescriptions={messages.providerDescriptions}
          searchPlaceholder={messages.terminologySearchPlaceholder}
          providerFilterLabel={messages.providerFilter}
          allProvidersLabel={messages.allProviders}
          additionalProvidersLabel={messages.additionalProviders}
          clearProvidersLabel={messages.clearProviders}
          noResults={messages.noTerminologiesFound}
          limitedResults={messages.limitedTerminologyResults}
          removeLabel={messages.removeTerminology}
          onChange={onChange}
        />
      }
    </div>
  );
}

type CollectionDetailsFieldsProps = {
  messages: Messages;
  title: string;
  description: string;
  onTitleChange?: (title: string) => void;
  onDescriptionChange?: (description: string) => void;
}

export function CollectionDetailsFields({
  messages,
  title,
  description,
  onTitleChange,
  onDescriptionChange,
}: CollectionDetailsFieldsProps) {
  return (
    <>
      <div className="form-input-group">
        <TextInput
          id="collection-title"
          name="collection-title"
          type="text"
          labelText={messages.title}
          placeHolder={messages.titlePlaceholder}
          required
          defaultValue={title}
          onChange={onTitleChange ? (event) => onTitleChange(event.target.value) : undefined}
        />
      </div>
      <div className="form-input-group">
        <TextArea
          id="description"
          required
          name="collection-desc"
          placeholder={messages.descriptionPlaceholder}
          labelText={messages.description}
          rows={10}
          defaultValue={description}
          onChange={onDescriptionChange ? (event) => {
            event.target.setCustomValidity("");
            onDescriptionChange(event.target.value);
          } : undefined}
        />
      </div>
    </>
  );
}

type CollectionVisibilityFieldProps = {
  messages: Messages;
  isPublic: boolean;
  onChange: (isPublic: boolean) => void;
}

export function CollectionVisibilityField({ messages, isPublic, onChange }: CollectionVisibilityFieldProps) {
  return (
    <div className="form-input-group">
      <div className="flex items-center gap-3">
        <span className={`text-sm capitalize ${isPublic ? "text-gray-500 dark:text-gray-400" : "font-semibold text-ts4nfdi-brand-color dark:text-white"}`}>
          {messages.private}
        </span>
        <ToggleButton
          id="visibility"
          label={messages.public}
          checked={isPublic}
          onChange={(event) => onChange(event.target.checked)}
          brandColor
          labelClassName={isPublic
            ? "!font-semibold !text-ts4nfdi-brand-color dark:!text-white"
            : "!font-normal !text-gray-500 dark:!text-gray-400"}
        />
      </div>
    </div>
  );
}

type CollaboratorFieldProps = {
  messages: Messages;
  users: string[];
  selected: string[];
  onChange: (users: string[]) => void;
}

export function CollaboratorField({ messages, users, selected, onChange }: CollaboratorFieldProps) {
  return (
    <div className="form-input-group">
      <label htmlFor="collection-collaborators" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
        {messages.collaboratorsFull}
      </label>
      <MultiSelectDropdown
        id="collection-collaborators"
        placeholder={messages.usersPlaceholder}
        options={users}
        selectedValues={selected}
        onSelect={onChange}
        onRemove={onChange}
      />
    </div>
  );
}
