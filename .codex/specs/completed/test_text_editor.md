Task:
Write tests for the text editor component.

Process:
- There is a text editor component that is used to edit text in "app/ui/commons/TextEditor".
- Tests:
    - The actios on the bar must be visible and clickable.
    - actions must reflect the change in the text editor content:
        - bold
        - italic
        - underline
        - strikethrough
        - font class (dropdown)
        - font size (dropdown)
        - list (dropdown)
        - indents
        - color picker
        - link insertion
    - loading a styled text in the editor must be rendered correctly with styles. For example, the text must be bold, italic, underlined, etc if the loaded text has the same styles.
    - editor should be protected against XSS attacks means rendering the text as a safe html and not executing any scripts.


Acceptance criteria:
- test must pass
