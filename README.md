# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Online payments (Genie Business)

Customers pay for an approved prescription order from **My orders**. The
browser never sees the Genie key: `api/payments/*` are Vercel server functions
that create the Genie hosted checkout and confirm every result with Genie
before the database marks an order paid.

Set these in Vercel > Project > Settings > Environment Variables, then redeploy:

| Name | Value |
| --- | --- |
| `GENIE_API_KEY` | Genie dashboard > your app > **API Key (secret)** |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase > Project Settings > API > `service_role` key |
| `SITE_URL` | `https://pham-mart.vercel.app` (must match the Genie app domain) |
| `GENIE_API_BASE_URL` | optional, only for Genie's sandbox |

`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are already set for the site.
Never put the secret keys in the code or in a `VITE_` variable.
