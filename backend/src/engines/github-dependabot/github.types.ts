export interface GitHubDependabotAlert {
  number: number;
  state: 'auto_dismissed' | 'dismissed' | 'fixed' | 'open';
  dependency: {
    package: {
      ecosystem: string;
      name: string;
    };
    manifest_path: string;
    scope: 'development' | 'runtime';
  };
  security_advisory: {
    ghsa_id: string;
    cve_id: string | null;
    summary: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    cvss: {
      score: number;
      vector_string: string;
    };
    references: { url: string }[];
  };
  security_vulnerability: {
    severity: 'critical' | 'high' | 'medium' | 'low';
    vulnerable_version_range: string;
    first_patched_version: {
      identifier: string;
    } | null;
    package: {
      ecosystem: string;
      name: string;
    };
  };
  url: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  dismissed_at: string | null;
  dismissed_reason: string | null;
  fixed_at: string | null;
  auto_dismissed_at: string | null;
}

export interface GitHubAlertListResponse {
  data: GitHubDependabotAlert[];
  hasNextPage: boolean;
}
