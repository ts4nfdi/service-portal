export type ActionResponse = {
  status: boolean,
  content: any
}

export type ContactForm = {
  title: string,
  content: string,
  email: string,
  captcha: string
}

export type NewIncubatorForm = {
  title: string,
  description: string,
  email: string,
  logo?: File,
  captcha: string
}

export type Collection = {
  id?: string,
  description?: string,
  label?: string,
  terminologies?: Terminology[],
  collaborators?: { username: string, role: string }[],
  isPublic?: boolean,
}

export type Terminology = {
  label?: string,
  source?: string,
  type?: string,
  uri?: string,
}

export type Database = {
  type: string,
  name: string,
  url: string,
  searchUrl: string,
  artefactsUrl: string,
}
