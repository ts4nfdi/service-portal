'use client'

import { ModalButtonProps, ModalProps } from "./types";
import { useLocale } from "@/app/i18n";
import { commonMessages } from "./messages";

export function ModalButton(props: ModalButtonProps) {
  return (
    <button
      onClick={() => {
        let modal = (document.getElementById(props.targetModalId)! as HTMLDivElement);
        modal.classList.remove("hidden");
        document.body.style.overflow = 'hidden';
        (modal.previousSibling as HTMLDivElement).classList.remove("hidden");

      }}
      className={"btn text-end !me-0 " + (props.classNames ?? "")}
      type="button"
      data-modal-target={props.targetModalId}
      data-modal-toggle={props.targetModalId}
    >
      {props.label}
    </button>
  );
}



export function Modal(props: ModalProps) {
  const t = commonMessages[useLocale()];

  function closeModal() {
    let modal = (document.getElementById(props.id)! as HTMLDivElement);
    modal.classList.add("hidden");
    document.body.style.overflow = '';
    (modal.previousSibling as HTMLDivElement).classList.add("hidden");
  }


  return (
    <>
      <div className="modal-bg hidden" key={"modal-bg"}></div>
      <div id={props.id} tabIndex={-1} aria-hidden="true" data-modal-backdrop="static" className="hidden overflow-y-auto overflow-x-hidden fixed inset-0 flex z-50 justify-center items-center" key={"modal"}>
        <div className={"relative p-4 w-full  max-h-full " + (!props.imageExpandModal ? "max-w-2xl" : "")}>
          <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200" key={"modal-header"}>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{props.title}</h3>
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                data-modal-hide={props.id}
                onClick={closeModal}
              >
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                </svg>
                <span className="sr-only">{t.closeModal}</span>
              </button>
            </div>
            <div className="p-4 md:p-5 space-y-4" key={"modal-body"}>
              {props.content}
            </div>
            <div className="grid grid-cols-2 items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600" key={"modal-footer"}>
              {props.actionBtn &&
                <div>
                  <button className="btn" onClick={() => {
                    if (props.actionBtnCallback) {
                      props.actionBtnCallback();
                    }
                    closeModal();
                  }}>
                    {props.actionBtnLabel}
                  </button>
                </div>
              }
              {props.withCloseBtn &&
                <div><button className="btn !bg-gray-300 !text-black float-end" onClick={closeModal}>{t.close}</button></div>
              }
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
