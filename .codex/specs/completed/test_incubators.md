Task:
Write tests for the incubators page.

Process:
- the incubators page data comes from a json file named `app/ui/incubators/projects.json` 
- on top of the page, there are must be three clickable items named:
    - In prepration
    - Running
    - Finished
- the status must contain the count. count of each project that has the status.
- the status must be clickable. Upon clicking it, the incubators cards must be filtered by the status.
- the clicked status must have a different color.
- There is always a card for requesting incubators in the cards section regardless of the filter. this card must be always visible.
- there are also three dropdowns for filtering the cards.
    - Status
    - Consortium
    - Cycle
- Selecting a dropdown must filter the cards. 
- The status click on the top of the page should refelect also in the status dropdown.
- Each card must contain:
    - A visible logo
    - title
    - Status: contains status tags
    - Duration
    - Description
- On the first card, there has to be a button named `Send us your request` that open the new incubator request form. On that form ther must be:
    - a button to go back to the incubators list
    - input for title
    - input for email
    - a text editor for the description
    - an upload button for the logo
    - a captcha
    - Submit button

- all incubators logo images must be accessible since they are remote.

Acceptance criteria:
- test must pass

