FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

#RUN --mount=type=secret,id=npm_token \
#  echo "//npm.pkg.github.com/:_authToken='$(cat /run/secrets/npm_token)'" > "/app/.npmrc" &&\
#  echo "@ts4nfdi:registry=https://npm.pkg.github.com" >> "/app/.npmrc"

RUN npm install --force

COPY . .

ENV NEXT_PUBLIC_AUTOCOMPLETE_DOCUMENTATION_URL=https://terminology.services.base4nfdi.de/tss/comp/latest/
ENV NEXT_PUBLIC_API_GATEWAY_ENDPOINT=https://terminology.services.base4nfdi.de/api-gateway
ENV NEXT_PUBLIC_API_GATEWAY_DEFAULT_PARAMETERS="ontology=mesh,efo&type=class&collection=nfdi4health&fieldList=description,label,iri,ontology_name,type,short_form"
ENV NEXT_PUBLIC_CAPTCHA_SITE_KEY=FCMNGJO6FSOIB5ER
ENV NEXT_PUBLIC_MATOMO_TRACKER_URL="https://piwik.cebitec.uni-bielefeld.de/matomo.php?"
ENV NEXT_PUBLIC_MATOMO_TRACKER_ID=36
ENV NEXT_IAM_REDIRECT_URL="https://terminology.services.base4nfdi.de/"


RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app ./

RUN npm install --production --force

EXPOSE 3000

CMD ["npm", "start"]
