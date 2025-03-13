import { type ClientSchema, a, defineData } from "@aws-amplify/backend"
import { review } from "../functions/review/resource"

const schema = a.schema({
  review: a
  .query()
  .arguments({
    email: a.string(),
    pdf: a.string(),
  })
  .returns(a.string())
  .handler(a.handler.function(review))
  .authorization(allow => [allow.authenticated()]),
})

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
})