Task:
write test for the collection list page.

Mock data:
- For this test you need create a mock data for list of collections. Do not call api for this. 
- There must be 6 collections in the list.

Process:
- There is a list of collections. it has to be accessible by clicking the "Collections" tab on the site main navbar.
- On the page:
    - there should be explanation box containing "What is a Terminology Collection?"
    - inside the explanation box, there must also:
        - a button to download collections as json. must be functional.
        - a button to create a new collection. must be visible only if the user is logged in.
        - a link to API endpoint with a copy to clipboard function.
    - next to the explanation box, there must be a image with title " Figure of a Terminology Collection". image must be loaded.
    - there must be a search input to filter the list based on keyword.
    - there must a functional pagination component. for 6 collections, there must be 2 pages. 
        - the filter by keyword should change the page count on the pagination component.
    - Each collection card must contain:
        - a title. must be clickable. points the user to the collection page.
        - uuid: with copy to clipboard function.
        - PermaLink: with copy to clipboard function.
        - Created by that shows the user name.
        - description
        - list of terminologies as tags.
        - a downloa icon to download the collection as json.

Acceptance criteria:
- test must pass

