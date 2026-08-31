# SAVE — Security Architecture & Data Governance Model

## 1. Overview & Trust Philosophy
**SAVE** is a European B2B Procurement Intelligence Platform designed to analyze sensitive corporate spend, invoices, and supplier contracts. Because commercial data represents confidential enterprise assets, security and strict tenant isolation are architectural invariants.

---

## 2. Multi-Tenant Organization Isolation & Row Level Security (RLS)
- **Zero Cross-Tenant Leakage**: Every business entity is partitioned into a dedicated `organizations` record.
- **PostgreSQL Row Level Security**: All database tables enforce strict RLS policies bound to the authenticated user's active organization membership (`organization_members`).
- **Role-Based Access Control (RBAC)**:
  - `owner`: Full administrative, billing, deletion, and member management authority.
  - `admin`: Operational management, document review, and cost reduction approvals.
  - `member`: Document upload, spend inspection, and reporting access.
  - `viewer`: Read-only access to spend analytics and contract renewal radar.
- **Tenant Context**: All server actions and API routes resolve `organization_id` strictly from authenticated session claims, never trusting user-provided URL or body tenant IDs.

---

## 3. Document Storage & Encryption
- **Private Object Storage**: Raw documents (PDF, PNG, JPG) are stored in private Supabase Storage buckets with restricted ACLs.
- **Signed URLs**: Documents are never publicly accessible. Pre-signed time-limited download URLs (TTL: 15 minutes) are generated dynamically only upon authenticated, authorized request.
- **Encryption at Rest & in Transit**:
  - Transport: TLS 1.3 enforced for all client-to-server and server-to-upstream communication.
  - Storage: AES-256 encryption at rest for object storage and database volumes.

---

## 4. AI Document Extraction Pipeline Security
- **Confidentiality**: Document extraction is processed strictly on isolated server-side workers.
- **Zero Client-Side Leakage**: Sensitive extraction metadata, raw supplier banking numbers, or OCR tokens are never emitted to client-side logs or browser debug traces.
- **Structured Validation with Zod**: Every LLM extraction payload is strictly validated against a typed Zod schema before database ingestion.
- **Human-in-the-Loop Validation**: Extractions with confidence below 85% are automatically flagged for manual customer review.
- **Provider Agnostic Isolation**: The LLM abstraction layer sanitizes documents before dispatch, utilizing enterprise zero-data-retention endpoints.

---

## 5. Audit Logging & Compliance
- **Immutable Audit Trail**: The `audit_events` table logs critical actions (document uploads, manual extraction overrides, contract deletions, optimization requests, membership updates) with actor ID, IP address, timestamp, and action parameters.
- **GDPR & European Compliance**: Full support for right-to-be-forgotten, corporate data export (JSON/CSV), and configurable document retention windows (e.g., 1, 3, 5, or 10 years).
- **Safe Supplier Anonymization**: When entering the optimization workflow, benchmark comparisons and supplier RFQs are strictly anonymized. Raw customer contracts are never disclosed to third-party suppliers without explicit customer authorization.

---

## 6. Secret Management & Server Boundaries
- API keys (Supabase Service Role, OpenAI/Gemini/Anthropic keys, Stripe secrets) are strictly confined to server-side environments and never exposed to the client bundle (`NEXT_PUBLIC_` is restricted strictly to non-sensitive public identifiers).

---

## 7. Security Incident Response
Security vulnerabilities or data privacy inquiries can be reported to `security@save-procure.eu`. Critical vulnerability reports undergo triage within 24 hours.
