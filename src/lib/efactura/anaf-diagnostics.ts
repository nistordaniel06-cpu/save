export interface AnafDiagnosticItem {
  key: string;
  name: string;
  category: 'credentials' | 'oauth' | 'certificate' | 'endpoints';
  status: 'configured' | 'missing' | 'pending';
  description: string;
  recommendation?: string;
}

export interface AnafDiagnosticsReport {
  overallStatus: 'ready' | 'needs_configuration' | 'incomplete';
  configuredCount: number;
  totalChecks: number;
  items: AnafDiagnosticItem[];
  checkedAt: string;
}

export function runAnafDiagnostics(): AnafDiagnosticsReport {
  const hasAppRegistration = Boolean(process.env.ANAF_APP_ID || process.env.ANAF_CLIENT_ID);
  const hasClientId = Boolean(process.env.ANAF_CLIENT_ID && process.env.ANAF_CLIENT_ID !== 'DEMO_CLIENT_ID');
  const hasClientSecret = Boolean(process.env.ANAF_CLIENT_SECRET);
  const hasRedirectUri = Boolean(process.env.ANAF_REDIRECT_URI);
  const hasCertificateConfig = Boolean(process.env.ANAF_CERT_SUBJECT || process.env.ANAF_TOKEN);

  const items: AnafDiagnosticItem[] = [
    {
      key: 'app_registration',
      name: 'ANAF Developer App Registration',
      category: 'credentials',
      status: hasAppRegistration ? 'configured' : 'missing',
      description: 'Aplicație înregistrată în portalul ANAF pentru acces e-Factura B2B.',
      recommendation: hasAppRegistration ? undefined : 'Înregistrează aplicația în portalul ANAF Developer (anaf.ro).',
    },
    {
      key: 'client_id',
      name: 'OAuth Client ID',
      category: 'credentials',
      status: hasClientId ? 'configured' : 'missing',
      description: 'Cheia publică de identificare a aplicației în fluxul OAuth2.',
      recommendation: hasClientId ? undefined : 'Setează variabila de mediu ANAF_CLIENT_ID pe server.',
    },
    {
      key: 'client_secret',
      name: 'OAuth Client Secret',
      category: 'credentials',
      status: hasClientSecret ? 'configured' : 'missing',
      description: 'Secretul securizat de autentificare server-to-server ANAF.',
      recommendation: hasClientSecret ? undefined : 'Setează variabila de mediu securizată ANAF_CLIENT_SECRET.',
    },
    {
      key: 'redirect_uri',
      name: 'Redirect URI Înregistrat',
      category: 'oauth',
      status: hasRedirectUri ? 'configured' : 'missing',
      description: 'URL-ul de callback HTTPS autorizat în contul ANAF.',
      recommendation: hasRedirectUri ? undefined : 'Configurează ANAF_REDIRECT_URI (ex: https://save.ro/api/efactura/callback).',
    },
    {
      key: 'digital_cert',
      name: 'Certificat Digital Calificat (SPV)',
      category: 'certificate',
      status: hasCertificateConfig ? 'configured' : 'missing',
      description: 'Semnătură digitală calificată pe token fizic/cloud autorizată în SPV.',
      recommendation: hasCertificateConfig ? undefined : 'Asociază certificatul digital calificat al companiei cu contul SPV.',
    },
    {
      key: 'lista_mesaje',
      name: 'Serviciu Web: Lista Mesaje Facturi',
      category: 'endpoints',
      status: hasClientId ? 'configured' : 'pending',
      description: 'Endpoint REST ANAF: /api/PlatitorTvaRest / /v1/mesaje.',
    },
    {
      key: 'descarcare_xml',
      name: 'Serviciu Web: Descărcare UBL XML',
      category: 'endpoints',
      status: hasClientId ? 'configured' : 'pending',
      description: 'Endpoint REST ANAF: /v1/descarcare.',
    },
  ];

  const configuredCount = items.filter((i) => i.status === 'configured').length;
  const overallStatus = configuredCount === items.length ? 'ready' : configuredCount > 0 ? 'incomplete' : 'needs_configuration';

  return {
    overallStatus,
    configuredCount,
    totalChecks: items.length,
    items,
    checkedAt: new Date().toISOString(),
  };
}
