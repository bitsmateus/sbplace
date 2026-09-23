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

**Lista de bicicletas** — abas *Todas / Novas / Seminovas* (com contagem), busca
por nome, filtros por status e tipo e ordenação. Em cada linha dá para trocar a
situação (Disponível, Reservada, Vendida, Oculta) e marcar o destaque (★) sem
abrir a bike, além de **Editar**, **Ver no site**, **Duplicar** e **Excluir**.

**Cadastrar / editar uma bike** — o formulário tem 5 seções:

1. **Tipo e situação** — *Nova* (venda e retirada só na loja, até 12x) ou
   *Seminova* (enviada para todo o Brasil, até 21x). Uma bike nova cadastrada
   começa como **Oculta**: só aparece no site quando você muda a situação.
2. **Informações** — nome, tipo (MTB, speed, e-bike…), resumo de uma linha e
   descrição. Marque *destaque* para ela aparecer primeiro.
3. **Preço e pagamento** — preço, preço à vista (opcional) e parcelamento
   **calculado automaticamente**; dá para ajustar o nº de parcelas e/ou o valor
   da parcela. Mostra ao vivo como fica no site.
4. **Fotos** — várias de uma vez (botão ou arrastando), arrastar para
   reordenar, *Definir capa* e remover. As fotos são otimizadas sozinhas (até
   20 MB cada; viram WebP de no máx. 2000 px). Fotos removidas são apagadas do
   servidor.
5. **Ficha técnica** — lista editável de itens (tamanho do quadro, grupo,
   suspensão, km rodados…), mostrada como tabela na página da bike.

À direita há a **pré-visualização do card** como aparece no site e um
*checklist* do que falta. A barra de baixo avisa de alterações não salvas.

**Página da bike** (`/bicicletas/nome-da-bike`) — galeria com ampliação em tela
cheia, preço, parcelamento, descrição, ficha técnica e bikes relacionadas. O
botão *Tenho interesse* abre o WhatsApp com a mensagem *"Olá! Vim pelo site da
SB Place e tenho interesse na bike (nome)"* + o link da página. Bikes
**Ocultas** dão 404 até no link direto; **Vendidas** continuam visíveis, sem o
botão de compra.

**Configurações** — sobre a loja, diferenciais, endereço, horários, razão
social e CNPJ (rodapé).

## Backup

Todo o conteúdo que a loja cadastra vive dentro de `DATA_DIR`:

- `sbplace.json` — bicicletas e configurações;
- `uploads/` — as fotos originais (já otimizadas no envio);
- `cache/` — versões redimensionadas das fotos, geradas sozinhas quando o site
  precisa. **Não precisa entrar no backup** (é recriada) e pode ser apagada.

No EasyPanel, faça backup do volume montado em `/app/data`.

## Desempenho

- As fotos das bikes são entregues em vários tamanhos (`/uploads/arquivo.webp?w=480`)
  e o navegador escolhe o certo para a tela; celulares baixam bem menos dados.
- Imagens abaixo da 1ª tela só carregam quando ficam perto de aparecer.
- O vídeo do bike fit só baixa depois do clique (tem uma capa própria).
- Imagens e vídeos fixos do site (`public/`) têm cache de 1 dia no navegador.
- Ao trocar uma imagem de `public/`, mantenha o formato WebP e o mesmo nome.

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
