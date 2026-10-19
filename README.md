# Calculadora de Lanches

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Quality Gate](https://img.shields.io/badge/quality-passing-green)](tests/)

Aplicação web para cálculo automático de intervalos de refeição (lanche da manhã e tarde) a partir de registros de ponto eletrônicos. Processa arquivos `.prn`, `.txt`, `.csv` ou `.xlsx` exportados por sistemas de ponto e gera relatórios detalhados por funcionário.

**Acesso:** https://calculadora-de-lanches.dougllassillva.com.br

## Funcionalidades

- **Processamento multi-formato**: importa arquivos `.prn`, `.txt`, `.csv` e `.xlsx`
- **Cálculo automático**: identifica batidas de entrada/saída e calcula duração dos intervalos
- **Detecção de excesso**: destaca em vermelho lanches com mais de 15 minutos
- **Filtro inteligente**: exibe apenas funcionários com intervalos acima do limite
- **Exportação CSV**: gera planilha com resultados para análise externa
- **Interface responsiva**: funciona em desktop, tablet e mobile

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| **Frontend** | HTML5, CSS3, JavaScript ES6+ |
| **Bibliotecas** | SheetJS (xlsx), Font Awesome |
| **Qualidade** | ESLint, Prettier, Ruff |
| **Testes** | pytest |
| **Runtime** | Navegador moderno (Chrome, Firefox, Edge) — sem backend necessário |

## Como Usar

### Instalação

Nenhuma instalação necessária. Abra o arquivo `index.html` diretamente no navegador:

```bash
# Windows (PowerShell)
Start-Process index.html

# Linux/macOS
open index.html        # macOS
xdg-open index.html    # Linux
```

### Uso da Calculadora

1. **Carregar arquivo**: clique em "Escolher Arquivo" e selecione um arquivo `.prn`, `.txt`, `.csv` ou `.xlsx`
2. **Calcular**: clique em "Calcular Lanches"
3. **Analisar resultados**: visualize os tempos por funcionário na tabela
4. **Filtrar excessos**: use "Filtrar acima de 15min" para ver apenas intervalos longos
5. **Exportar**: clique em "Exportar para CSV" para baixar os resultados

### Formato Esperado do Arquivo

O sistema espera arquivos de ponto com colunas contendo:
- **Coluna A (0)**: Data
- **Coluna G (6)**: PIS do funcionário
- **Coluna D (3)**: Nome do funcionário
- **Demais colunas**: Horários de batida (H1–H8)

Arquivos com registros de "Folga", "Feriado", "Falta" ou "Justificado" são automaticamente excluídos.

## Scripts Disponíveis

```bash
# Qualidade de código
ruff check .         # Linter Python
ruff format .        # Formatação Python
pytest               # Testes unitários (26/26)
```

## Deploy

### Produção (VPS Docker — atual)

Container `calculadora-lanches`: nginx 1.27-alpine servindo os arquivos estáticos, publicado apenas em `127.0.0.1:8302`. Nginx host faz proxy de `calculadora-de-lanches.dougllassillva.com.br` com Let's Encrypt e Cloudflare proxied.

```bash
cd /root/dodo/aplicacoes/calculadoraLanches
git pull
docker compose up -d --build
```

### Legado (Netlify)

O deploy original em `calculadora-de-lanches.netlify.app` servia os mesmos arquivos estáticos. Está em descontinuação.

## Estrutura de Arquivos

```
calculadora-de-lanches/
├── index.html              # Página principal
├── styles.css              # Estilos CSS3
├── script.js               # Lógica JavaScript da calculadora
├── favicon.ico             # Ícone do site
├── README.md               # Este arquivo
├── LICENSE                 # Licença MIT
├── requirements.txt        # Dependências Python (qualidade/testes)
├── Dockerfile              # Imagem nginx com os arquivos estáticos
├── docker-compose.yml      # Orquestração do container
├── nginx-spa.conf          # Fallback SPA no nginx do container
├── .eslintrc.json          # Configuração ESLint
├── .prettierrc             # Configuração Prettier
├── .ruff.toml              # Configuração Ruff (Python)
├── .githooks/              # Hooks do Git (validados por tests/)
├── tests/                  # Suíte de testes automatizados
└── docs/                   # Documentação técnica
```

## Qualidade e Boas Práticas

Este projeto segue padrões rigorosos de desenvolvimento:

- **Linting**: ESLint para JavaScript, Ruff para Python
- **Formatação**: Prettier para código frontend
- **Testes**: pytest para lógica Python com cobertura mínima definida
- **Hooks Git**: validações automáticas pré-commit via `.githooks/`
- **Conventional Commits**: mensagens de commit padronizadas

## Contribuição

1. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
2. Adicione testes para novas funcionalidades
3. Commit seguindo Conventional Commits (`git commit -m 'feat: adiciona filtro por data'`)
4. Push e abra um Pull Request

## Autor

**Douglas Silva**
- [LinkedIn](https://www.linkedin.com/in/dougllassillva27/)

## Licença

Distribuído sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.
