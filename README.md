# VGL Show de Bola

O **VGL Show de Bola** é uma loja virtual demonstrativa que reúne lanches e periféricos para jogos. O projeto permite explorar o catálogo, montar um carrinho, simular um pedido e acompanhar seu status. A interface é em português e foi desenvolvida como uma aplicação web de página única (SPA).

> **Importante:** este é um protótipo para demonstração e estudo. Não há backend próprio, autenticação segura nem processamento de pagamentos reais. Consulte [Limitações e segurança](#limitações-e-segurança) antes de usar ou publicar o projeto.

## Funcionalidades

- Página inicial com destaques em carrossel, categorias e produtos em evidência.
- Catálogo de lanches mantido no próprio projeto e busca por nome.
- Catálogo de periféricos carregado pela API pública DummyJSON e busca por nome.
- Carrinho com inclusão de produtos, ajuste de quantidade, remoção e cálculo do total.
- Checkout demonstrativo com dados de entrega, revisão do pedido e opções de Pix, cartão ou dinheiro na entrega.
- Histórico de pedidos com filtros por status e ações de cancelamento e atualização disponíveis conforme o perfil.
- Área administrativa para consultar e confirmar pagamentos Pix pendentes.
- Cadastro demonstrativo, login, navegação protegida e menu de perfil.
- Layout responsivo e recursos básicos de acessibilidade, como navegação por teclado, rótulos e mensagens de status.

## Tecnologias

- [React 18](https://react.dev/) e [React Router 6](https://reactrouter.com/)
- [Vite 5](https://vite.dev/) para desenvolvimento e build
- [Lucide React](https://lucide.dev/) para ícones
- [qrcode.react](https://www.npmjs.com/package/qrcode.react) para gerar o QR code demonstrativo do Pix
- [DummyJSON](https://dummyjson.com/) para consultar produtos da categoria `mobile-accessories` e simular operações de pedidos

## Requisitos

- Node.js e npm instalados. Recomenda-se uma versão LTS atual do Node.js.
- Acesso à internet para carregar os periféricos e realizar as operações simuladas pela DummyJSON.

## Como executar

No terminal, entre na pasta do projeto e instale as dependências:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Abra no navegador o endereço indicado pelo Vite — normalmente `http://localhost:5173`.

### Comandos disponíveis

```bash
npm run dev      # inicia o servidor local de desenvolvimento
npm run build    # gera a versão de produção na pasta dist/
npm run preview  # serve localmente o build de produção para conferência
```

O repositório não define atualmente comandos de teste ou lint.

## Acesso de demonstração

Na tela de login estão disponíveis estas contas:

| Perfil | Usuário | Senha |
| --- | --- | --- |
| Administrador | `admin` | `admin` |
| Usuário | `teste` | `teste` |

Também é possível criar uma conta pela opção **Cadastre-se**. Contas cadastradas recebem o perfil de usuário; não é possível criar um administrador pela interface.

## Páginas e rotas

| Rota | Descrição | Acesso |
| --- | --- | --- |
| `/login` | Entrar na demonstração | Público |
| `/cadastro` | Criar uma conta demonstrativa | Público |
| `/` | Página inicial e destaques | Autenticado |
| `/lanches` | Catálogo local de lanches | Autenticado |
| `/perifericos` | Catálogo obtido pela DummyJSON | Autenticado |
| `/carrinho` | Carrinho e fluxo demonstrativo de checkout | Autenticado |
| `/meus-pedidos` | Histórico e acompanhamento de pedidos | Autenticado |
| `/admin/pagamentos` | Confirmação de pagamentos Pix pendentes | Apenas administrador |

Ao acessar uma rota protegida sem estar autenticado, a aplicação direciona para o login. Após entrar, o usuário volta à rota que tentou abrir. Se uma conta comum tentar acessar a área administrativa, será redirecionada para o início.

## Dados e integrações

- Os lanches, descrições, preços e imagens do catálogo são definidos em `src/services/api.js`.
- Os periféricos são carregados do endpoint `https://dummyjson.com/products/category/mobile-accessories`. A URL base pode ser substituída pela variável `VITE_API_URL`; se ela não estiver definida, a aplicação usa `https://dummyjson.com`.
- Para configurar outra URL localmente, crie um arquivo `.env.local` na raiz do projeto com:

  ```dotenv
  VITE_API_URL=https://dummyjson.com
  ```

- Carrinho, pedidos e contas cadastradas ficam no `localStorage` do navegador. A sessão de login fica no `sessionStorage` e termina quando a sessão do navegador é encerrada ou quando o usuário sai.
- As operações de criação, atualização e exclusão enviadas à DummyJSON servem apenas para demonstrar chamadas HTTP. A API não funciona como banco de dados persistente para este projeto; o histórico da aplicação é mantido localmente no navegador.
- Como os dados são locais, eles não são compartilhados entre navegadores ou dispositivos. Limpar os dados do site no navegador remove as contas, o carrinho e os pedidos armazenados.

## Estrutura do projeto

```text
.
├── index.html                 # Documento HTML e ponto de entrada da aplicação
├── public/
│   └── images/                # Imagens e identidade visual servidas como arquivos estáticos
├── src/
│   ├── App.jsx                # Rotas, sessão e controle de acesso
│   ├── main.jsx               # Inicialização do React e do roteador
│   ├── components/            # Componentes compartilhados (menu, rodapé, cartões e carrossel)
│   ├── pages/                 # Páginas da loja, conta, carrinho e administração
│   ├── services/
│   │   └── api.js             # Catálogo local, integração DummyJSON e dados do navegador
│   └── styles/
│       └── global.css         # Estilos globais e responsivos
├── vite.config.js             # Configuração do Vite
└── package.json               # Dependências e scripts npm
```

## Build e publicação

Gere os arquivos estáticos com:

```bash
npm run build
```

O resultado é criado em `dist/`. Para conferir localmente:

```bash
npm run preview
```

O projeto inclui um `vercel.json` com rewrite para a SPA. Em outras plataformas, configure o host para encaminhar rotas desconhecidas para `index.html`, para que caminhos como `/lanches` funcionem ao serem acessados diretamente. A integração com a DummyJSON também exige conexão à internet no ambiente publicado.

## Limitações e segurança

- Login, cadastro e autorização existem somente no frontend; não protegem dados nem rotas contra manipulação pelo navegador.
- Senhas de contas cadastradas são guardadas sem criptografia no `localStorage`. Use apenas dados fictícios e não reutilize senhas pessoais.
- O usuário e a senha de administrador são fixos e públicos no código. A área administrativa não deve ser considerada protegida.
- Pix, cartão e dinheiro são fluxos demonstrativos: o QR code Pix não cobra, os dados de cartão não são processados e os status são simulados.
- Não informe dados pessoais ou financeiros reais. Um uso em produção requer backend, autenticação e autorização no servidor, armazenamento seguro, validação de pedidos e integração com um provedor de pagamento.
