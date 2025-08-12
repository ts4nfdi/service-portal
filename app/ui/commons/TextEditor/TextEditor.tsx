'use client'


import dynamic from 'next/dynamic';
import {EditorProps} from 'react-draft-wysiwyg';

const Editor = dynamic<EditorProps>(() =>
        import("react-draft-wysiwyg").then((mod) => mod.Editor)
    , {ssr: false}) as React.ComponentType<EditorProps>;


import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import {convertToRaw, EditorState, convertFromRaw, ContentState} from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import DOMPurify from 'dompurify';
import {TextEditorProps} from '../types';
import {useState, useEffect} from 'react';
import './style.css';


const TextEditor = (props: TextEditorProps) => {

    const [editorState, setEditorState] = useState<EditorState>(EditorState.createEmpty());

    function onModalClick() {
        setTimeout(() => {
            /*  Auto focus on the insert link part when link option is open in toolbar.
                Time out is needed since it takes abit to load the link view after clicking.
            */
            let linkTarget = document.getElementById('linkTarget');
            if (linkTarget) {
                linkTarget.focus();
            }
        }, 200);
    }


    function onTextEditorChange(newState: EditorState) {
        (document.getElementsByClassName('rdw-editor-wrapper')[0] as HTMLElement).style.borderColor = '';
        let hiddenInput = document.getElementById('hidden-input')! as HTMLInputElement;
        hiddenInput.value = createHtmlFromEditorState(newState);
        setEditorState(newState);
    }


    useEffect(() => {
        const loadHtmlToState = async () => {
            const {default: htmlToDraft} = await import("html-to-draftjs");
            if (props.content) {
                const blocksFromHTML = htmlToDraft(props.content ?? "");
                const contentState = ContentState.createFromBlockArray(
                    blocksFromHTML.contentBlocks,
                    blocksFromHTML.entityMap
                );
                let hiddenInput = document.getElementById('hidden-input')! as HTMLInputElement;
                hiddenInput.value = props.content;
                setEditorState(EditorState.createWithContent(contentState));
            }
        }
        loadHtmlToState();
    }, [props.content]);


    return (
        <>
            <label htmlFor={""}
                   className={"block " + (props.required ? "required-label" : "")}>{props.labelText}</label>
            <div onClick={onModalClick}>
                <Editor
                    editorState={editorState}
                    onEditorStateChange={onTextEditorChange}
                    wrapperClassName={props.wrapperClassName ?? "" + " text-editor-wrapper"}
                    editorClassName={props.editorClassName ?? "" + " text-editor"}
                    placeholder={props.placeholder}
                    toolbar={{
                        options: ['inline', 'blockType', 'fontSize', 'list', 'textAlign', 'colorPicker', 'link'],
                        inline: {
                            options: ['bold', 'italic', 'underline', 'strikethrough'],
                        },
                        blockType: {
                            inDropdown: true,
                            options: props.textSizeOptions,
                        },
                        list: {
                            inDropdown: true,
                            options: ['unordered', 'ordered'],
                        },
                    }}
                />
                <input type="hidden" name={props.name} id="hidden-input"/>
            </div>
        </>
    );
}


export function highlightEditorIsEmpty() {
    (document.getElementsByClassName('rdw-editor-wrapper')[0] as HTMLElement).style.borderColor = '#445669';
}


export function isTextEditorEmpty() {
    let hiddenValue = (document.getElementById("hidden-input")! as HTMLInputElement).value;
    return (!hiddenValue || hiddenValue.trim() === "<p></p>")
}


export function getTextEditorContent(editorState: EditorState) {
    let content = editorState.getCurrentContent();
    return JSON.stringify(convertToRaw(content));
}

export function createHtmlFromEditorState(editorState: EditorState) {
    try {
        let noteContent = convertToRaw(editorState.getCurrentContent());
        let htmlContent = draftToHtml(noteContent);
        return DOMPurify.sanitize(htmlContent, {USE_PROFILES: {html: true}});
    } catch {
        return "";
    }
}


export function createTextEditorStateFromJson(jsonInput: any) {
    try {
        return EditorState.createWithContent(convertFromRaw(JSON.parse(jsonInput)));
    } catch {
        let empty = createTextEditorEmptyText();
        return empty;
    }
}


export function createHtmlFromEditorJson(jsonInput: any) {
    try {
        let editorState = EditorState.createWithContent(convertFromRaw(JSON.parse(jsonInput)));
        let noteContent = convertToRaw(editorState.getCurrentContent());
        let htmlContent = draftToHtml(noteContent);
        return DOMPurify.sanitize(htmlContent, {USE_PROFILES: {html: true}});
    } catch {
        return "";
    }
}


export function createTextEditorEmptyText() {
    return EditorState.createWithContent(ContentState.createFromText(''));
}


export default TextEditor;
