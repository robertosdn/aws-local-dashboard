export const DEFAULT_EVENT_BUS_NAME = 'default';

export interface EventBusSummary {
  name: string;
  arn: string;
  description?: string;
  policy?: string;
  createdAt?: Date;
}

export interface RuleTarget {
  id: string;
  arn: string;
  roleArn?: string;
  input?: string;
  inputPath?: string;
}

export interface EventBridgeRule {
  name: string;
  arn: string;
  eventBusName: string;
  state: 'ENABLED' | 'DISABLED';
  description?: string;
  eventPattern?: string;
  roleArn?: string;
  managedBy?: string;
  targets: RuleTarget[];
}

export interface EventBusDetail extends EventBusSummary {
  rules: EventBridgeRule[];
  rulesNextToken?: string;
}

export interface EventBusPage {
  eventBuses: EventBusSummary[];
  nextToken?: string;
}

export interface RulePage {
  rules: EventBridgeRule[];
  nextToken?: string;
}

export interface DeleteEventBusInput {
  name: string;
}
