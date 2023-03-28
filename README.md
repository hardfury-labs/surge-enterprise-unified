# Surge Balancer

Unified profile management for **Surge** or **Surge Enterprise**, for those with **multiple upstream subscription sources** or **multiple user**. By Surge user, for Surge user.

Many thanks to the [surgio project](https://github.com/surgioproject/surgio)!

## Deploy your own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/vercel/next.js/tree/canary/examples/with-chakra-ui&project-name=with-chakra-ui&repository-name=with-chakra-ui)

## Data storage comparison

| Source | Writable |
| ------ | -------- |
| env    | NO       |
| redis  | YES      |

## Configuration

All fields are expected to be stored and read as strings, and then serialised (JSON.parse) if need.

Due to [technical issues](https://github.com/luin/ioredis/issues/769#issuecomment-1480869051) and page responsiveness, the `SB_PASSWORD` can only be set in `env` currently.

| Key                           | Description                                                     | Location    | Schema                                           | Default |
| ----------------------------- | --------------------------------------------------------------- | ----------- | ------------------------------------------------ | ------- |
| SB_PASSWORD                   | Password to access the management portal                        | env         | string                                           | `pass`  |
| SB_DATASTORAGE                | Data storage source, which can be `env` or redis connection uri | env         | string                                           | `env`   |
| SB_USERS                      | Users with access to Surge profile link                         | env / redis | [User](src/interfaces/configuration.ts#L3)[]     | []      |
| SB_PROVIDERS                  | Upstream subscription sources for proxy servers                 | env / redis | [Provider](src/interfaces/configuration.ts#L9)[] | []      |
| SB_TEMPLATE                   | Template for Surge profile                                      | env / redis | string                                           | ''      |
| SB_SURGE_ENTERPRISE_API_TOKEN | Surge Enterprise API token                                      | env / redis | string                                           | null    |

## Roadmaps

- [ ] Support Cloudflare KV as data storage
- [ ] Support Serverless PostgreSQL [neon?](https://neon.tech) as data storage

## References

- https://transform.tools/typescript-to-zod
