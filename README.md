# Lambda MCP Server

A Model Context Protocol server for deploying and managing AWS Lambda functions.

## Features

- Deploy Lambda functions through MCP interface
- List existing Lambda functions
- Guided deployment prompts
- Type-safe configuration validation
- AWS Lambda integration

## Prerequisites

- Node.js (v16 or higher)
- AWS Account with appropriate permissions
- AWS CLI configured with credentials

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the root directory:

```
AWS_REGION=us-east-1
```

## Usage

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

## MCP Tools

### Deploy Lambda Function

```typescript
// Example deployment configuration
const config = {
  functionName: "my-function",
  runtime: "nodejs18.x",
  handler: "index.handler",
  memorySize: 128,
  timeout: 30,
  roleArn: "arn:aws:iam::123456789012:role/lambda-role",
  environment: {
    NODE_ENV: "production"
  }
};

// Base64 encoded zip file containing the function code
const code = "base64-encoded-zip-file";

// Deploy using the MCP tool
const result = await client.callTool("deploy", { config, code });
```

### List Functions

```typescript
// List all Lambda functions
const result = await client.callTool("listFunctions", {});
```

### Guided Deployment

```typescript
// Start a guided deployment process
const prompt = await client.getPrompt("guidedDeploy", {
  functionName: "my-function",
  runtime: "nodejs18.x"
});
```

## Protocol Interface

The server implements the following MCP tools:

- `deploy`: Deploy a new Lambda function
- `listFunctions`: List all Lambda functions
- `guidedDeploy`: Interactive deployment guidance

## Security Considerations

- Always use HTTPS in production
- Implement proper authentication and authorization
- Rotate AWS credentials regularly
- Use environment variables for sensitive information
- Implement proper error handling and logging

## License

MIT 