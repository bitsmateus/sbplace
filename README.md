# SB Place — site + painel administrativo

Site institucional da SB Place (bicicletas, Tubarão/SC) com catálogo de
bicicletas e um painel `/admin` simples para a loja cadastrar bicicletas,
fotos, preços e status — sem precisar mexer em código.

Não tem carrinho de compras nem checkout: cada bicicleta tem um botão que
abre o WhatsApp com uma mensagem pronta, porque a venda é só local
(retirada/negociação em Tubarão e região, sem entrega).

## Stack

- **Next.js 16** (App Router, JavaScript)
- **Tailwind CSS 4** para o visual
- **better-sqlite3** — banco de dados local em arquivo, sem precisar de
  serviço externo
- Sessão de admin simples via cookie assinado (sem biblioteca de terceiros)
- Fotos enviadas ficam salvas em disco, num volume persistente

Tudo roda num único container Docker — fácil de hospedar no EasyPanel.

## Rodando localmente

```bash
npm install
cp .env.example .env   # edite a senha e os dados de contato
npm run dev
```

Acesse `http://localhost:3000` para o site e `http://localhost:3000/admin`
para o painel (login com a senha definida em `ADMIN_PASSWORD`).

## Variáveis de ambiente

Veja `.env.example`. As principais:

| Variável | Para que serve |
|---|---|
| `ADMIN_PASSWORD` | Senha de acesso ao `/admin` |
| `SESSION_SECRET` | Chave usada para assinar o cookie de login (gere com `openssl rand -base64 32`) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número de WhatsApp da loja (só dígitos, com DDI 55) |
| `NEXT_PUBLIC_INSTAGRAM` | @ do Instagram (sem o @) |
| `NEXT_PUBLIC_ADDRESS` | Endereço mostrado no rodapé/contato |
| `DATA_DIR` | Pasta onde ficam o banco (`sbplace.db`) e as fotos enviadas — em produção deve apontar para o volume persistente |

## Deploy no EasyPanel

1. **Suba este projeto para um repositório Git** (GitHub/GitLab) — o
   EasyPanel builda a partir de um repositório.
2. No EasyPanel, crie um novo serviço do tipo **App** (build via
   Dockerfile) apontando para esse repositório. Ele vai detectar o
   `Dockerfile` automaticamente.
3. Em **Environment**, cadastre as variáveis da tabela acima
   (principalmente `ADMIN_PASSWORD`, `SESSION_SECRET` e
   `NEXT_PUBLIC_WHATSAPP_NUMBER`). Gere uma `SESSION_SECRET` forte —
   não reaproveite o valor de exemplo.
4. Em **Volumes/Mounts**, monte um volume persistente em `/app/data`.
   É ali que ficam o banco de dados e as fotos das bicicletas — sem
   isso, tudo se perde a cada novo deploy.
5. Configure a porta do container como `3000`.
6. Aponte o domínio da loja pro serviço e ative HTTPS (o EasyPanel faz
   isso automaticamente com Let's Encrypt). **O login do admin depende de
   HTTPS** — o cookie de sessão só é enviado em conexão segura.
7. Depois do primeiro deploy, acesse `seudominio.com/admin`, faça login
   com a `ADMIN_PASSWORD` configurada e cadastre as primeiras
   bicicletas.

### Testando localmente com Docker

```bash
docker compose up --build
```

Acesse `http://localhost:3000`. O volume `sbplace_data` guarda o banco e
as fotos entre reinicializações.

## Como usar o painel (`/admin`)

- **Nova bicicleta**: nome, categoria, preço, descrição, status
  (Disponível / Reservada / Vendida) e fotos. A primeira foto da lista
  vira a capa no catálogo — dá pra reordenar com as setinhas.
- **Destaque**: marque a caixinha "Mostrar em destaque na home" pras
  bicicletas que devem aparecer na página inicial.
- **Editar/Excluir**: na lista de bicicletas, cada linha tem os links de
  ação. Excluir também apaga as fotos daquela bicicleta do servidor.
- **Marcar como vendida**: edite a bicicleta e mude o status — no site
  ela continua visível no catálogo, mas com o selo "Vendida" e sem botão
  de WhatsApp.

## Backup

Todo o conteúdo que a loja cadastra vive dentro de `DATA_DIR`
(`sbplace.db` + pasta `uploads/`). Faça backup periódico dessa pasta —
no EasyPanel, isso significa fazer backup do volume montado em
`/app/data`.

## Estrutura do projeto

```
app/                   páginas do site e do admin (App Router)
  admin/                painel administrativo (protegido por login)
  api/admin/             rotas de API usadas pelo painel
  bicicletas/[slug]/     página de detalhe de cada bicicleta
  catalogo/               catálogo com filtros
  uploads/[...path]/      serve as fotos salvas em DATA_DIR/uploads
components/             componentes de UI (site público + admin)
lib/                    banco de dados, autenticação, regras de negócio
Dockerfile              build de produção (multi-stage)
docker-compose.yml      pra rodar/testar localmente com Docker
```
