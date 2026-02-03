export interface AzureSecurityAlert {
  id: string;
  name: string;
  type: string;
  properties: {
    alertDisplayName: string;
    description: string;
    severity: 'High' | 'Medium' | 'Low' | 'Informational';
    status: 'Active' | 'Resolved' | 'Dismissed' | 'InProgress';
    startTimeUtc: string;
    endTimeUtc?: string;
    timeGeneratedUtc: string;
    processingEndTimeUtc?: string;
    compromisedEntity: string;
    remediationSteps: string[];
    alertType: string;
    productName: string;
    resourceIdentifiers: {
      type: string;
      azureResourceId?: string;
    }[];
    extendedProperties?: Record<string, string>;
  };
}

export interface AzureAlertListResponse {
  value: AzureSecurityAlert[];
  nextLink?: string;
}

export interface AzureTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}
