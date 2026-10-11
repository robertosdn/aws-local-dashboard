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
  targetsLoaded?: boolean;
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

export type RuleState = 'ENABLED' | 'DISABLED';

export interface RuleTargetInput {
  id: string;
  arn: string;
  roleArn?: string;
  input?: string;
  inputPath?: string;
}

export interface RuleFormValues {
  name: string;
  description?: string;
  eventPattern: string;
  state: RuleState;
  targets: RuleTargetInput[];
}

export interface SaveRuleInput {
  eventBusName: string;
  originalName?: string;
  originalTargetIds?: string[];
  values: RuleFormValues;
}

export interface DeleteRuleInput {
  eventBusName: string;
  ruleName: string;
}

export interface SetRuleStateInput extends DeleteRuleInput {
  state: RuleState;
}

export interface SavedRule {
  name: string;
  arn?: string;
}

export type EventPatternSeverity = 'error' | 'warning';

export interface EventPatternIssue {
  path: string;
  message: string;
  severity: EventPatternSeverity;
}

export interface EventPatternValidationResult {
  valid: boolean;
  issues: EventPatternIssue[];
  parsed?: unknown;
  formatted?: string;
}
