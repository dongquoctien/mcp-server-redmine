# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
npm install          # Install dependencies
npm run build        # Build TypeScript to dist/
npm run dev          # Run in development mode (with watch)
npm start            # Start production server
npm test             # Run tests
npm run lint         # Run linting
```

### Running a Single Test

```bash
# Run tests matching a pattern
npm test -- --testPathPattern="issues/get"

# Run a specific test file
npm test -- src/lib/__tests__/client/issues/get.test.ts
```

### Inspector Testing

```bash
# Build and test with MCP Inspector
npm run build
npx @modelcontextprotocol/inspector dist/index.js
```

## Environment Variables

Required environment variables for development and testing:
- `REDMINE_API_KEY`: API key from Redmine user settings
- `REDMINE_HOST`: Redmine server URL (e.g., `https://redmine.example.com`)

## Architecture Overview

This is an MCP (Model Context Protocol) server that integrates with Redmine's REST API. The server exposes Redmine functionality as MCP tools that can be called by LLMs.

### Core Flow

1. **Entry Point** (`src/index.ts`): Bootstraps the server via `runServer()`
2. **Server Setup** (`src/handlers/index.ts`): Creates the MCP server, registers all tools via dynamic discovery from `tools/index.ts`, and routes tool execution to resource-specific handlers
3. **Tool Execution**: Incoming tool calls are matched against a handler map built from all `create*Handlers()` functions

### Module Structure

**Tools** (`src/tools/`): Define MCP tool schemas with names, descriptions, and input validation. Each file exports `*_TOOL` constants (e.g., `ISSUE_LIST_TOOL`, `PROJECT_CREATE_TOOL`). Tools are automatically discovered from `tools/index.ts` exports.

**Handlers** (`src/handlers/`): Implement tool logic. Each resource has a `create*Handlers()` function that returns an object mapping tool names to handler functions. Handlers receive a `HandlerContext` with the Redmine client, config, and logger.

**Client** (`src/lib/client/`): Wraps Redmine REST API calls. `BaseClient` provides `performRequest()` for HTTP operations and `encodeQueryParams()` for query string building. Resource-specific clients extend `BaseClient`.

**Types** (`src/lib/types/`): TypeScript types and Zod schemas for each resource domain. Each domain has:
- `types.ts`: TypeScript interfaces
- `schema.ts`: Zod validation schemas
- `index.ts`: Re-exports

**Formatters** (`src/formatters/`): Convert Redmine API responses to human-readable text for MCP tool responses.

**Config** (`src/lib/config.ts`): Loads and validates environment variables using Zod.

### Adding a New Tool

1. Add tool definition in `src/tools/<resource>.ts` (export `*_TOOL` constant)
2. Add export in `src/tools/index.ts`
3. Implement handler in `src/handlers/<resource>.ts` (create `create*Handlers()` function)
4. Register handler in `src/handlers/index.ts` (import, create, and spread into `handlers` object)
5. If new resource: create client in `src/lib/client/`, types in `src/lib/types/`, formatter in `src/formatters/`

### Testing

Tests use Jest with ESM support and mock `fetch` calls. Test files are in `__tests__/` directories adjacent to the code they test.

- Test helpers are in `src/lib/__tests__/helpers/` (fixtures, mocks, setup)
- Use `mockResponse()` and `mockErrorResponse()` from helpers for fetch mocking
- Test pattern: Arrange (setup mocks) → Act (call method) → Assert (verify calls and results)
