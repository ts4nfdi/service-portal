
# Rules and guidelines

before starting:
- Read `.codex/instructions.md`
- Do not read `.codex/specs/completed` 
- Do not read anything from `public/`. Completely ignore it.
- Ignore also these directories: `.next`, `node_modules`, `out`, `playwright-report`, `test-results`

Tasks workflow:
- Always look at the `.codex/specs/` unless you are instructed to do otherwise
- inside the `.codex/specs` directory, there are .md files. Each of them is a task.
- The task name has to be said in the prompt. If not, ask for it.
- Do not run multiple tasks at the same time.
- Each task has an accpentance criteria that has to be respected. 
- After finishing a spec, move the spec to `spec/completed` directory.

code structure:
- The components that holds app logic and rendering are in `app/`
- The UI resusable components are in `app/ui/`
- In `app/ui/` there are directories for each component.
- The `app/ui/commons` directory contains components that are used in multiple places.
- The `app/libs` directory contains the reusable code. These codes are not for UI components. Rather they are for the server components and server side logics.
- The `app/widgets` directory contains the reuasable widgets that are wrappers for `@ts4nfdi/terminology-service-suite` library widgets. 
- The `app/clientExports.tsx` file contains the client components exports.
- The `app/api` directory contains the the API calls to backend services.
- The `app/concepts` directory contains the application concepts. These are the schema that other components use. They are the middle layer betweeen the API calls and other components. We never expose API raw data to app components. The API calls must always return these concepts.
- 


Stack:
- Next.js
- Tailwind CSS
- Playwright for E2E testing










