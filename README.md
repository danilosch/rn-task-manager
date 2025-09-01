# Task Manager App

## Descrição

Este é um aplicativo de gerenciamento de tarefas desenvolvido com **React Native** e **TypeScript**, utilizando **Zustand** para gerenciamento de estado e persistência offline. O app permite criar, editar, deletar e filtrar tarefas, além de suportar sincronização de operações pendentes quando o dispositivo volta a ficar online.

### Arquitetura

* **Front-end:** React Native + TypeScript
* **State Management:** Zustand com persistência via AsyncStorage
* **Sincronização Offline:** Fila de operações pendentes (add, update, delete) sincronizadas automaticamente ao voltar online
* **Backend/API:** Mock API (MockAPI.io) via Axios
* **Rotas:** React Navigation (Stack Navigator)
* **Validação de formulários:** React Hook Form + Zod

## Funcionalidades

* Listagem de tarefas com paginação infinita
* Filtros por status (pendente, concluída) e responsável
* Adição, edição e deleção de tarefas
* Alternância rápida do status da tarefa
* Persistência offline e sincronização automática

## Instalação

1. Clone o repositório:

```bash
git clone git@github.com:danilosch/rn-task-manager.git
cd rn-task-manager
```

2. Instale as dependências:

```bash
yarn install
# ou
npm install
```

3. Configure a URL da API (mockAPI) no .env.local:

```bash
cp .env.example .env.local
```

4. Inicie o projeto Expo:

```bash
npx expo start
```

## Estrutura de Pastas

```
/src
  /components  # Componentes React reutilizáveis
  /screens     # Telas do aplicativo
  /store       # Zustand store
  /services    # Configuração do Axios e APIs
  /types       # Tipagens TypeScript
  /navigation  # Configuração do React Navigation
```

## Uso

* **Task List:** Lista tarefas com filtros e paginação.
* **Task Form:** Tela para criar ou editar tarefas.
* **Filtros:** Modal para filtrar tarefas por status e usuário.

## Observações

* O app utiliza **MockAPI.io** para simular backend.
* Offline: alterações feitas enquanto offline são armazenadas localmente e sincronizadas automaticamente quando o dispositivo volta online.

## Tecnologias Utilizadas

* React Native
* TypeScript
* Zustand + persist
* Axios
* React Hook Form + Zod
* React Navigation
* AsyncStorage
* NetInfo
