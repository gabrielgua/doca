# Doca

Envios FBA de várias empresas num lugar só: marcas, produtos, caixas, etiquetas e DANFE de cada
envio, com acesso por empresa para admin, gerentes e clientes.

## Rodar localmente

```sh
pnpm install
cp web/.env.example web/.env.local   # preencha a URL e a chave publishable do Supabase
pnpm dev
```

O app abre em http://localhost:5173.

Stack: Vue 3, TypeScript, Vite, Tailwind CSS v4, Pinia, Vue Router, Hugeicons e Supabase.
As regras de código e a estrutura estão no [CLAUDE.md](CLAUDE.md).
