# Redmine MCP Server

[![smithery badge](https://smithery.ai/badge/@yonaka15/mcp-server-redmine)](https://smithery.ai/server/@yonaka15/mcp-server-redmine)

A Model Context Protocol (MCP) server that provides seamless integration between LLMs and Redmine project management. This server exposes Redmine's REST API as MCP tools, enabling AI assistants to manage issues, projects, time tracking, and more.

<a href="https://glama.ai/mcp/servers/55eg9u36cg"><img width="380" height="200" src="https://glama.ai/mcp/servers/55eg9u36cg/badge" alt="Redmine Server MCP server" /></a>

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Available Tools](#available-tools)
- [Usage Examples](#usage-examples)
- [Development](#development)
- [Testing](#testing)
- [Permissions](#permissions)
- [License](#license)

## Features

This server provides comprehensive access to Redmine's REST API through the following resource categories:

| Category | Operations | Since |
|----------|------------|-------|
| Issues | List, Get, Create, Update, Delete, Watchers | 1.0 |
| Projects | List, Show, Create, Update, Archive, Delete | 1.0 |
| Users | List, Show, Create, Update, Delete | 1.1 |
| Time Entries | List, Show, Create, Update, Delete | 1.1 |
| Attachments | Upload, Download, Get, Update, Delete | 1.3 |
| Versions | List, Show, Create, Update, Delete | 1.3 |
| Issue Categories | List, Show, Create, Update, Delete | 1.3 |
| Issue Statuses | List | 1.3 |
| Trackers | List | 1.3 |
| Memberships | List, Show, Create, Update, Delete | 1.4 |
| Roles | List, Show | 1.4 |
| Enumerations | Priorities, Activities, Document Categories | 2.2 |

## Installation

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- Access to a Redmine server with REST API enabled

### Install from npm

```bash
npm install -g mcp-server-redmine
```

### Install from source

```bash
git clone https://github.com/yonaka15/mcp-server-redmine.git
cd mcp-server-redmine
npm install
npm run build
```

## Configuration

### Getting Your API Key

1. Log in to your Redmine instance
2. Go to **My Account** (top right menu)
3. Find **API access key** in the right sidebar
4. Click **Show** to reveal your API key (or **Reset** to generate a new one)

> **Note**: The REST API must be enabled by your Redmine administrator under **Administration > Settings > API**.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `REDMINE_HOST` | Yes | Your Redmine server URL (e.g., `https://redmine.example.com`) |
| `REDMINE_API_KEY` | Yes | Your personal API access key |

### Claude Desktop Configuration

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "redmine": {
      "command": "npx",
      "args": ["-y", "mcp-server-redmine"],
      "env": {
        "REDMINE_HOST": "https://your-redmine.example.com",
        "REDMINE_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### Local Development Configuration

```json
{
  "mcpServers": {
    "redmine": {
      "command": "node",
      "args": ["/path/to/mcp-server-redmine/dist/index.js"],
      "env": {
        "REDMINE_HOST": "https://your-redmine.example.com",
        "REDMINE_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Available Tools

### Issue Management

| Tool | Description |
|------|-------------|
| `list_issues` | Search and filter issues with pagination |
| `get_issue` | Get detailed issue information |
| `create_issue` | Create a new issue |
| `update_issue` | Update an existing issue |
| `delete_issue` | Permanently delete an issue |
| `add_issue_watcher` | Add a user as issue watcher |
| `remove_issue_watcher` | Remove a user from watchers |

### Project Management

| Tool | Description |
|------|-------------|
| `list_projects` | List all accessible projects |
| `show_project` | Get project details with trackers, categories |
| `create_project` | Create a new project |
| `update_project` | Update project settings |
| `archive_project` | Archive a project (read-only) |
| `unarchive_project` | Restore an archived project |
| `delete_project` | Permanently delete a project |
| `list_project_statuses` | Get allowed statuses for project/tracker |

### Time Tracking

| Tool | Description |
|------|-------------|
| `list_time_entries` | Search time entries with filters |
| `show_time_entry` | Get time entry details |
| `create_time_entry_for_project` | Log time against a project |
| `create_time_entry_for_issue` | Log time against an issue |
| `update_time_entry` | Update a time entry |
| `delete_time_entry` | Delete a time entry |

### User Management (Admin Required)

| Tool | Description |
|------|-------------|
| `list_users` | List all users |
| `show_user` | Get user details |
| `create_user` | Create a new user account |
| `update_user` | Update user information |
| `delete_user` | Delete a user account |

### Attachments

| Tool | Description |
|------|-------------|
| `upload_file` | Upload file from base64 content |
| `upload_file_from_path` | Upload file from local filesystem |
| `upload_file_from_clipboard` | Upload image from clipboard (Windows) |
| `get_attachment` | Get attachment metadata |
| `download_attachment` | Download attachment content |
| `update_attachment` | Update attachment filename/description |
| `delete_attachment` | Delete an attachment |

### Versions (Milestones)

| Tool | Description |
|------|-------------|
| `list_versions` | List project versions |
| `show_version` | Get version details |
| `create_version` | Create a new version |
| `update_version` | Update version settings |
| `delete_version` | Delete a version |

### Project Memberships

| Tool | Description |
|------|-------------|
| `list_memberships` | List project members |
| `show_membership` | Get membership details |
| `create_membership` | Add user/group to project |
| `update_membership` | Change member roles |
| `delete_membership` | Remove member from project |

### Issue Categories

| Tool | Description |
|------|-------------|
| `list_issue_categories` | List project categories |
| `show_issue_category` | Get category details |
| `create_issue_category` | Create a new category |
| `update_issue_category` | Update category settings |
| `delete_issue_category` | Delete a category |

### Reference Data

| Tool | Description |
|------|-------------|
| `list_issue_statuses` | Get all issue statuses |
| `list_trackers` | Get all trackers |
| `list_issue_priorities` | Get priority levels |
| `list_time_entry_activities` | Get activity types |
| `list_document_categories` | Get document categories |
| `list_roles` | Get all roles |
| `show_role` | Get role permissions |

## Usage Examples

### Issue Operations

#### List Issues with Filters

```
List all open issues assigned to me in project "webapp"
```

The LLM will call:
```json
{
  "tool": "list_issues",
  "arguments": {
    "project_id": "webapp",
    "status_id": "open",
    "assigned_to_id": "me",
    "limit": 25
  }
}
```

#### Filter by Date Range

```
Show issues created in the last week
```

```json
{
  "tool": "list_issues",
  "arguments": {
    "created_on": ">=2024-01-20",
    "sort": "created_on:desc",
    "limit": 50
  }
}
```

#### Get Issue with Full Details

```
Get issue #1234 with all comments and attachments
```

```json
{
  "tool": "get_issue",
  "arguments": {
    "id": 1234,
    "include": "journals,attachments,watchers,relations"
  }
}
```

#### Create a New Issue

```
Create a bug report in project ID 5 for the login page
```

```json
{
  "tool": "create_issue",
  "arguments": {
    "project_id": 5,
    "tracker_id": 1,
    "subject": "Login page returns 500 error",
    "description": "When submitting the login form with valid credentials, the server returns a 500 Internal Server Error.\n\n**Steps to reproduce:**\n1. Go to /login\n2. Enter valid username and password\n3. Click Submit\n\n**Expected:** Redirect to dashboard\n**Actual:** 500 error page",
    "priority_id": 2,
    "assigned_to_id": 10
  }
}
```

#### Update Issue Status

```
Close issue #1234 with a comment
```

```json
{
  "tool": "update_issue",
  "arguments": {
    "id": 1234,
    "status_id": 5,
    "notes": "Fixed in commit abc123. Deployed to production."
  }
}
```

#### Add Watcher to Issue

```
Add user ID 15 as a watcher to issue #1234
```

```json
{
  "tool": "add_issue_watcher",
  "arguments": {
    "issue_id": 1234,
    "user_id": 15
  }
}
```

### Project Operations

#### List All Projects

```
Show me all active projects
```

```json
{
  "tool": "list_projects",
  "arguments": {
    "status": "1",
    "include": "trackers,issue_categories"
  }
}
```

#### Create a New Project

```
Create a new project called "Mobile App" under parent project ID 1
```

```json
{
  "tool": "create_project",
  "arguments": {
    "name": "Mobile App",
    "identifier": "mobile-app",
    "description": "Mobile application development project",
    "parent_id": 1,
    "is_public": false,
    "enabled_module_names": ["issue_tracking", "time_tracking", "wiki", "repository"],
    "tracker_ids": [1, 2, 3]
  }
}
```

#### Archive a Project

```
Archive the old-website project
```

```json
{
  "tool": "archive_project",
  "arguments": {
    "id": "old-website"
  }
}
```

### Time Tracking

#### Log Time on Issue

```
Log 2.5 hours on issue #1234 for development work
```

```json
{
  "tool": "create_time_entry_for_issue",
  "arguments": {
    "issue_id": 1234,
    "hours": 2.5,
    "activity_id": 9,
    "comments": "Implemented user authentication feature"
  }
}
```

#### Log Time on Project

```
Log 1 hour on project "webapp" for a meeting
```

```json
{
  "tool": "create_time_entry_for_project",
  "arguments": {
    "project_id": "webapp",
    "hours": 1,
    "activity_id": 10,
    "comments": "Sprint planning meeting",
    "spent_on": "2024-01-25"
  }
}
```

#### List Time Entries for Date Range

```
Show my time entries for this week
```

```json
{
  "tool": "list_time_entries",
  "arguments": {
    "user_id": "me",
    "from": "2024-01-22",
    "to": "2024-01-26",
    "limit": 100
  }
}
```

### Attachment Operations

#### Upload File from Path

```
Upload the screenshot from my desktop
```

```json
{
  "tool": "upload_file_from_path",
  "arguments": {
    "file_path": "C:\\Users\\john\\Desktop\\screenshot.png"
  }
}
```

Response:
```json
{
  "token": "7167.ed1ccdb093229ca1bd0b043618d88743",
  "filename": "screenshot.png"
}
```

#### Create Issue with Attachment

```
Create a bug with the uploaded screenshot
```

```json
{
  "tool": "create_issue",
  "arguments": {
    "project_id": 5,
    "subject": "UI alignment issue on dashboard",
    "description": "The chart is not aligned properly on the dashboard.",
    "uploads": [
      {
        "token": "7167.ed1ccdb093229ca1bd0b043618d88743",
        "filename": "screenshot.png",
        "content_type": "image/png"
      }
    ]
  }
}
```

#### Upload from Clipboard (Windows)

```
Upload the image I just copied to clipboard
```

```json
{
  "tool": "upload_file_from_clipboard",
  "arguments": {
    "filename": "error-screenshot.png"
  }
}
```

#### Download and View Attachment

```
Show me attachment #456
```

```json
{
  "tool": "download_attachment",
  "arguments": {
    "id": 456
  }
}
```

> **Note**: Images are returned in a format viewable by Claude. Excel files are parsed and returned as JSON.

### Version Management

#### Create a New Version

```
Create version 2.0.0 for project webapp with due date next month
```

```json
{
  "tool": "create_version",
  "arguments": {
    "project_id": "webapp",
    "name": "2.0.0",
    "description": "Major release with new features",
    "status": "open",
    "due_date": "2024-02-28",
    "sharing": "none"
  }
}
```

#### Close a Version

```
Mark version 1.5.0 as closed
```

```json
{
  "tool": "update_version",
  "arguments": {
    "id": 15,
    "status": "closed"
  }
}
```

### Membership Management

#### Add User to Project

```
Add user ID 20 to project webapp with Developer and Reporter roles
```

```json
{
  "tool": "create_membership",
  "arguments": {
    "project_id": "webapp",
    "user_id": 20,
    "role_ids": [4, 5]
  }
}
```

#### Update Member Roles

```
Change user's role to Manager only
```

```json
{
  "tool": "update_membership",
  "arguments": {
    "id": 123,
    "role_ids": [3]
  }
}
```

### Working with Custom Fields

#### Create Issue with Custom Fields

```
Create an issue with custom field "Customer" set to "Acme Corp"
```

```json
{
  "tool": "create_issue",
  "arguments": {
    "project_id": 5,
    "subject": "Feature request from customer",
    "custom_fields": [
      {
        "id": 1,
        "value": "Acme Corp"
      },
      {
        "id": 2,
        "value": "high"
      }
    ]
  }
}
```

#### Filter Issues by Custom Field

```
List issues where custom field 3 equals "urgent"
```

```json
{
  "tool": "list_issues",
  "arguments": {
    "cf_3": "urgent",
    "limit": 25
  }
}
```

### Getting Reference Data

#### Get All Statuses

```
What issue statuses are available?
```

```json
{
  "tool": "list_issue_statuses",
  "arguments": {}
}
```

#### Get Priority Levels

```
Show me the priority levels
```

```json
{
  "tool": "list_issue_priorities",
  "arguments": {}
}
```

#### Get Allowed Statuses for Tracker

```
What statuses can be used for bugs in project 5?
```

```json
{
  "tool": "list_project_statuses",
  "arguments": {
    "project_id": 5,
    "tracker_id": 1
  }
}
```

## Development

### Project Structure

```
.
├── src/
│   ├── index.ts              # Entry point
│   ├── tools/                # MCP tool definitions
│   │   ├── issues.ts
│   │   ├── projects.ts
│   │   ├── attachments.ts
│   │   └── ...
│   ├── handlers/             # Tool implementation logic
│   │   ├── index.ts
│   │   ├── issues.ts
│   │   └── ...
│   ├── formatters/           # Response formatters
│   │   ├── issues.ts
│   │   └── ...
│   └── lib/
│       ├── client/           # Redmine API client
│       ├── types/            # TypeScript types & Zod schemas
│       └── config.ts         # Configuration
├── docs/
│   └── adr/                  # Architecture Decision Records
├── package.json
└── tsconfig.json
```

### Build Commands

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Development mode with watch
npm run dev

# Start production server
npm start

# Run linting
npm run lint
```

### Adding a New Tool

1. **Define the tool** in `src/tools/<resource>.ts`:
```typescript
export const MY_NEW_TOOL: Tool = {
  name: "my_new_tool",
  description: "Description of what the tool does",
  inputSchema: {
    type: "object",
    properties: {
      param1: { type: "string", description: "Parameter description" }
    },
    required: ["param1"]
  }
};
```

2. **Export from** `src/tools/index.ts`:
```typescript
export { MY_NEW_TOOL } from "./my_resource.js";
```

3. **Implement handler** in `src/handlers/<resource>.ts`:
```typescript
export function createMyResourceHandlers(context: HandlerContext) {
  return {
    my_new_tool: async (args: unknown) => {
      // Implementation
    }
  };
}
```

4. **Register handler** in `src/handlers/index.ts`

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/lib/__tests__/client/issues/get.test.ts

# Run tests matching pattern
npm test -- --testPathPattern="issues"
```

> **Note**: For data safety, only GET operations are included in automated tests.

### MCP Inspector Testing

The MCP Inspector provides a GUI and CLI for testing the server.

#### GUI Mode

```bash
# Build the project
npm run build

# Set execute permission (Unix/macOS)
chmod +x dist/index.js

# Launch inspector
npx @modelcontextprotocol/inspector dist/index.js
```

#### CLI Mode

```bash
# Set environment variables
export REDMINE_API_KEY=your-api-key
export REDMINE_HOST=https://your-redmine.example.com

# List available tools
npx @modelcontextprotocol/inspector --cli \
  -e REDMINE_API_KEY=$REDMINE_API_KEY \
  -e REDMINE_HOST=$REDMINE_HOST \
  node dist/index.js \
  --method tools/list

# Call a specific tool
npx @modelcontextprotocol/inspector --cli \
  -e REDMINE_API_KEY=$REDMINE_API_KEY \
  -e REDMINE_HOST=$REDMINE_HOST \
  node dist/index.js \
  --method tools/call \
  --tool-name list_issues \
  --tool-arg limit=5 \
  --tool-arg status_id=open
```

### Verifying Connection

```bash
# Test API connectivity
curl -H "X-Redmine-API-Key: $REDMINE_API_KEY" \
     "$REDMINE_HOST/projects.json"
```

## Permissions

### Admin-Only Operations

The following operations require Redmine administrator privileges:

| Tool | Requirement |
|------|-------------|
| `list_users` | Admin |
| `create_user` | Admin |
| `update_user` | Admin |
| `delete_user` | Admin |

### Project Permissions

Most operations respect Redmine's permission system:
- Users can only see projects they have access to
- Issue operations require appropriate project roles
- Time entry operations may require specific permissions

For detailed permission information, see the [Redmine API Documentation](https://www.redmine.org/projects/redmine/wiki/Rest_api).

## Troubleshooting

### Common Issues

**Connection Refused**
- Verify Redmine server is running
- Check `REDMINE_HOST` URL is correct
- Ensure REST API is enabled in Redmine settings

**401 Unauthorized**
- Verify `REDMINE_API_KEY` is correct
- Check API key hasn't expired or been revoked

**403 Forbidden**
- User lacks required permissions
- Some operations require admin privileges

**404 Not Found**
- Resource ID doesn't exist
- Project identifier is incorrect

### Debug Mode

Set environment variable for verbose logging:
```bash
export DEBUG=mcp:*
```

## License

MIT

## Related Projects

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Redmine](https://www.redmine.org/)
- [Redmine REST API Documentation](https://www.redmine.org/projects/redmine/wiki/Rest_api)
