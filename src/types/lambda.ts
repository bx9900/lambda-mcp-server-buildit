export type LambdaRuntime = 
  | 'nodejs18.x'
  | 'nodejs16.x'
  | 'python3.9'
  | 'python3.8'
  | 'java11'
  | 'dotnet6'
  | 'go1.x'
  | 'ruby2.7';

export type LambdaArchitecture = 'x86_64' | 'arm64';

export interface LambdaEnvironment {
  [key: string]: string;
}

export interface LambdaVpcConfig {
  subnetIds: string[];
  securityGroupIds: string[];
}

export interface LambdaDeploymentConfig {
  functionName: string;
  runtime: LambdaRuntime;
  handler: string;
  architecture: LambdaArchitecture;
  memorySize?: number;
  timeout?: number;
  environment?: LambdaEnvironment;
  vpcConfig?: LambdaVpcConfig;
  roleArn: string;
  tags?: Record<string, string>;
}

export interface LambdaDeploymentResult {
  functionArn: string;
  functionName: string;
  runtime: LambdaRuntime;
  handler: string;
  state: 'Active' | 'Pending' | 'Failed';
  lastModified: string;
  version: string;
} 