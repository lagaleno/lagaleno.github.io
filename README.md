# lagaleno.github.io

Site pessoal de Larissa Galeno — HTML, CSS e JavaScript puro, sem build e sem banco de dados.

## Rodando localmente

Os dados são carregados via `fetch`, então as páginas precisam ser servidas por HTTP (abrir o `.html` direto no navegador não funciona):

```bash
python3 -m http.server 8000
```

Depois abra <http://localhost:8000>.

## Editando o conteúdo

Todo o conteúdo fica em `data/`:

| Arquivo | O que controla |
| --- | --- |
| `data/site.json` | Nome, apresentação (`bio`), foto (`photo`), links, contatos do cartão, créditos e textos de introdução das páginas |
| `data/publicacoes.json` | Lista de publicações (`publicacoes.html`) |
| `data/cursos.json` | Lista de cursos (`cursos.html`) e página de cada curso (`curso.html?id=<id>`) |
| `data/curriculo.json` | Currículo (`curriculo.html`): experiência, formação, prêmios, idiomas e o PDF de cada idioma. As publicações do currículo vêm de `publicacoes.json` |

### Português e inglês

Qualquer campo de texto pode ser **uma string simples** (mesmo texto nos dois idiomas) **ou um objeto com as duas versões**. Listas também:

```json
"title": { "pt": "Fundamentos de UI/UX", "en": "UI/UX Fundamentals" },
"keywords": { "pt": ["usabilidade", "IHC"], "en": ["usability", "HCI"] },
"venue": "Anais do Evento Exemplo"
```

Se faltar a versão de um idioma, o site usa a outra. Os textos fixos da interface (menu, botões, rótulos) ficam em `js/i18n.js`. O idioma é escolhido no botão PT/EN do menu, fica salvo no navegador e também pode ser forçado pela URL (`?lang=en`), útil para mandar o link em inglês. Tipos de publicação conhecidos (`article`, `chapter`, `conference`, `thesis`, `dissertation`) são traduzidos automaticamente.

- **Destaques da home:** itens com `"featured": true` aparecem primeiro no carrossel; o restante é completado pelos mais recentes (máx. 6).
- **Publicação:** `url` (página do artigo), `pdf` e `doi` são opcionais — botões só aparecem quando preenchidos. Link direto: `publicacoes.html#<id>`.
- **Curso:** `id` vira a URL da página (`curso.html?id=<id>`). Materiais aceitam `type`: `slides`, `pdf`, `video`, `code`, `folder` ou `link`. Material com `url` vazia aparece como "em breve".
- **PDF do currículo:** os botões "Ver PDF" e "Baixar PDF" usam os arquivos em `files` de `curriculo.json`. Depois de editar o currículo, regenere os PDFs (PT e EN) a partir da própria página, com o servidor local rodando: `./scripts/gerar-pdf-curriculo.sh`. Se preferir usar um PDF próprio, coloque-o em `assets/docs/` e aponte o caminho em `files`.
- **Publicando mudanças de CSS/JS:** o GitHub Pages deixa esses arquivos em cache por 10 minutos. Ao alterar qualquer `.css` ou `.js`, aumente o número em `?v=` nos arquivos `.html` (ex.: `?v=2` → `?v=3`) para que quem já visitou o site receba a versão nova. Mudanças só nos `.json` não precisam disso.
- **Foto:** coloque a imagem em `assets/img/` e aponte `photo` em `site.json` (ex.: `"assets/img/foto.jpg"`). Sem foto, aparece o logo.

## Estrutura

```
index.html · publicacoes.html · cursos.html · curso.html
css/style.css          tokens de cor, fonte e todos os componentes
js/core.js             header, footer, cartão de contato, ícones, carregamento dos JSON
js/<página>.js         renderização de cada página
assets/font/           Airbnb Cereal
assets/img/brand/      logo (3 variações) e logotipo do cartão
assets/img/pattern/    tile do pattern, usado como máscara CSS e recolorido com a paleta
```

Paleta: `#FFFFFF` `#B3AFA8` `#000000` `#9E3222` `#D4563D`. Identidade visual: @isabelacortese.
