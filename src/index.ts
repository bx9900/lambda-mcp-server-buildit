import { z } from "zod";
import { LambdaClient, 
  CreateFunctionCommand, 
  UpdateFunctionConfigurationCommand,
  UpdateFunctionCodeCommand,
  DeleteFunctionCommand,
  GetFunctionConfigurationCommand,
  ListFunctionsCommand,
  InvokeCommand
} from "@aws-sdk/client-lambda";
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Initialize MCP server
const server = new McpServer({
  name: "LambdaDeployer",
  version: "1.0.0"
});

// Initialize AWS Lambda client
const lambdaClient = new LambdaClient({
  region: process.env.AWS_REGION || "us-east-1"
});

// Define schemas
const DeploymentConfigSchema = z.object({
  functionName: z.string(),
  runtime: z.enum(["nodejs18.x", "nodejs16.x", "python3.9", "python3.8"]),
  handler: z.string(),
  memorySize: z.number().optional(),
  timeout: z.number().optional(),
  environment: z.record(z.string()).optional(),
  roleArn: z.string()
});

// Register deploy tool
server.tool(
  "deploy",
  {
    config: DeploymentConfigSchema,
    code: z.string() // Base64 encoded zip file
  },
  async (args) => {
    try {
      const command = new CreateFunctionCommand({
        FunctionName: args.config.functionName,
        Runtime: args.config.runtime,
        Handler: args.config.handler,
        Code: {
          ZipFile: Buffer.from(args.code, "base64")
        },
        Role: args.config.roleArn,
        MemorySize: args.config.memorySize,
        Timeout: args.config.timeout,
        Environment: args.config.environment ? { Variables: args.config.environment } : undefined
      });

      const result = await lambdaClient.send(command);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            functionArn: result.FunctionArn,
            functionName: result.FunctionName,
            runtime: result.Runtime,
            handler: result.Handler,
            state: result.State,
            lastModified: result.LastModified,
            version: result.Version
          })
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error deploying function: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        isError: true
      };
    }
  }
);

// Register updateConfig tool
server.tool(
  "updateConfig",
  {
    functionName: z.string(),
    config: DeploymentConfigSchema.partial()
  },
  async (args) => {
    try {
      const command = new UpdateFunctionConfigurationCommand({
        FunctionName: args.functionName,
        Runtime: args.config.runtime,
        Handler: args.config.handler,
        MemorySize: args.config.memorySize,
        Timeout: args.config.timeout,
        Environment: args.config.environment ? { Variables: args.config.environment } : undefined
      });

      const result = await lambdaClient.send(command);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            functionArn: result.FunctionArn,
            functionName: result.FunctionName,
            runtime: result.Runtime,
            handler: result.Handler,
            state: result.State,
            lastModified: result.LastModified,
            version: result.Version
          })
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error updating configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        isError: true
      };
    }
  }
);

// Register updateCode tool
server.tool(
  "updateCode",
  {
    functionName: z.string(),
    code: z.string() // Base64 encoded zip file
  },
  async (args) => {
    try {
      const command = new UpdateFunctionCodeCommand({
        FunctionName: args.functionName,
        ZipFile: Buffer.from(args.code, "base64")
      });

      const result = await lambdaClient.send(command);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            functionArn: result.FunctionArn,
            functionName: result.FunctionName,
            runtime: result.Runtime,
            handler: result.Handler,
            state: result.State,
            lastModified: result.LastModified,
            version: result.Version
          })
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error updating code: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        isError: true
      };
    }
  }
);

// Register deleteFunction tool
server.tool(
  "deleteFunction",
  {
    functionName: z.string()
  },
  async (args) => {
    try {
      const command = new DeleteFunctionCommand({
        FunctionName: args.functionName
      });

      await lambdaClient.send(command);
      return {
        content: [{
          type: "text",
          text: `Function ${args.functionName} deleted successfully`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error deleting function: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        isError: true
      };
    }
  }
);

// Register getConfig tool
server.tool(
  "getConfig",
  {
    functionName: z.string()
  },
  async (args) => {
    try {
      const command = new GetFunctionConfigurationCommand({
        FunctionName: args.functionName
      });

      const result = await lambdaClient.send(command);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            functionName: result.FunctionName,
            runtime: result.Runtime,
            handler: result.Handler,
            memorySize: result.MemorySize,
            timeout: result.Timeout,
            environment: result.Environment?.Variables,
            roleArn: result.Role
          })
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error getting configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        isError: true
      };
    }
  }
);

// Register listFunctions tool
server.tool(
  "listFunctions",
  {},
  async () => {
    try {
      const command = new ListFunctionsCommand({});
      const result = await lambdaClient.send(command);

      return {
        content: [{
          type: "text",
          text: JSON.stringify(result.Functions)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error listing functions: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        isError: true
      };
    }
  }
);

// Register invoke tool
server.tool(
  "invoke",
  {
    functionName: z.string(),
    payload: z.any()
  },
  async (args) => {
    try {
      const command = new InvokeCommand({
        FunctionName: args.functionName,
        Payload: Buffer.from(JSON.stringify(args.payload))
      });

      const result = await lambdaClient.send(command);
      return {
        content: [{
          type: "text",
          text: Buffer.from(result.Payload!).toString()
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error invoking function: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        isError: true
      };
    }
  }
);

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Lambda MCP Server running on stdio");
