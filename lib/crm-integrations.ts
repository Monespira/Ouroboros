export const integrationKinds = ["Email marketing", "WhatsApp Business", "ERP REST", "Suporte"] as const;
export type IntegrationKind = (typeof integrationKinds)[number];

export interface CrmIntegrationAdapter {
  kind: IntegrationKind;
  validate(config: { baseUrl: string; webhookUrl: string; credentialRef: string }): { valid: boolean; issues: string[] };
}

class GenericRestAdapter implements CrmIntegrationAdapter {
  constructor(readonly kind: IntegrationKind) {}
  validate(config: { baseUrl: string; webhookUrl: string; credentialRef: string }) {
    const issues: string[] = [];
    if (!isHttpUrl(config.baseUrl)) issues.push("URL base inválida");
    if (config.webhookUrl && !isHttpUrl(config.webhookUrl)) issues.push("Webhook inválido");
    if (!/^[A-Z][A-Z0-9_]+$/.test(config.credentialRef)) issues.push("Use o nome de uma variável de ambiente para a credencial");
    return { valid: issues.length === 0, issues };
  }
}

export function integrationAdapter(kind: IntegrationKind): CrmIntegrationAdapter { return new GenericRestAdapter(kind); }
function isHttpUrl(value: string) { try { const url = new URL(value); return url.protocol === "https:" || url.protocol === "http:"; } catch { return false; } }
