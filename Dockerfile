FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN --mount=type=secret,id=npm_token \ 
  echo "//npm.pkg.github.com/:_authToken='$(cat /run/secrets/npm_token)'" > "/app/.npmrc" &&\
  echo "@ts4nfdi:registry=https://npm.pkg.github.com" >> "/app/.npmrc"

RUN npm install --force

COPY . .

ENV NEXT_PUBLIC_AUTOCOMPLETE_DOCUMENTATION_URL=https://ts4nfdi.github.io/terminology-service-suite/comp/latest/?path=/docs/react_search-autocompletewidget--docs
ENV NEXT_PUBLIC_API_GATEWAY_ENDPOINT=https://ts4nfdi-api-gateway.prod.km.k8s.zbmed.de/api-gateway/
ENV NEXT_PUBLIC_API_GATEWAY_DEFAULT_PARAMETERS="ontology=mesh,efo&type=class&collection=nfdi4health&fieldList=description,label,iri,ontology_name,type,short_form"
ENV NEXT_PUBLIC_CAPTCHA_SITE_KEY=FCMNGJO6FSOIB5ER
# ENV SMTP_HOST_NAME=134.95.56.25
# ENV SMTP_PORT=443
# ENV CONTACT_RECV_EMAIL=pooya.oladazimi@gmail.com
# ENV SERVICE_EMAIL=ts4nfdi-portal@zbmed.de
# ENV NEXTAUTH_URL=http://ts4nfdi-service-portal.qa.km.k8s.zbmed.de/ 

RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app ./

RUN npm install --production --force

EXPOSE 3000

CMD ["npm", "start"]
