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
  type?: string,
  name?: string,
  url?: string,
  searchUrl?: string,
  artefactsUrl?: string,
}

export type DatabaseJson = {
  [key: string]: {
    type: string,
    name: string,
    url: string,
    description: string,
    contactUrl: string,
    title: string,
    logo: string,
    logo_background_color: string,
    homepage: string,
    logoW?: number,
    logoH?: number
  }
}

export type ZenodoPublication = {
  doi?: string,
  doi_url?: string,
  title?: string,
  metadata?: {
    resource_type: {
      title: string
    }
  },
  created?: string
}
