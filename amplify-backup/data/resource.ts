import { a } from "@aws-amplify/backend";

Note: a
  .model({
    name: a.string(),
    description: a.string(),
    image: a.string(),
  })
  .authorization((allow) => [
    allow.publicApiKey()
  ])
