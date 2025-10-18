export const generateBlobSasUrl = async (
  connectionString: string,
  containerName: string,
  blobName: string,
  expiryMinutes: number = 10,
): Promise<string> => {
  const signedPermissions = "cw";
  const signedStart =
    new Date(new Date().getTime() - 5 * 60 * 1000).toISOString().slice(0, -5) +
    "Z";
  const signedExpiry =
    new Date(new Date().getTime() + expiryMinutes * 60 * 1000)
      .toISOString()
      .slice(0, -5) + "Z";
  const accountName = connectionString.match(/AccountName=([^;]+)/)?.[1] || "";
  const accountKey = connectionString.match(/AccountKey=([^;]+)/)?.[1] || "";
  const signedResource = "b";
  const signedVersion = "2021-06-08";

  const stringToSign = [
    signedPermissions,
    signedStart,
    signedExpiry,
    `/blob/${accountName}/${containerName}/${blobName}`,
    "",
    "",
    "https",
    signedVersion,
    signedResource,
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ].join("\n");

  const key = Uint8Array.from(atob(accountKey), (c) => c.charCodeAt(0));
  const encoder = new TextEncoder();
  const data = encoder.encode(stringToSign);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, data);
  const signatureBase64 = btoa(
    String.fromCharCode(...new Uint8Array(signature)),
  );

  const sasToken = new URLSearchParams({
    sp: signedPermissions,
    st: signedStart,
    se: signedExpiry,
    sv: signedVersion,
    sr: signedResource,
    spr: "https",
    sig: signatureBase64,
  }).toString();

  return `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;
};

/*

## SAS URL Generation (`generateBlobSasUrl`)

### **Start and Expiry Dates**

```typescript
const signedStart = new Date(new Date().getTime() - 5 * 60 * 1000)
  .toISOString()
  .slice(0, -5) + "Z";
```
- `new Date().getTime()` - Current time in milliseconds
- `- 5 * 60 * 1000` - Subtract 5 minutes (5 min × 60 sec × 1000 ms)
- `.toISOString()` - Converts to: `2025-10-18T15:30:45.123Z`
- `.slice(0, -5)` - Removes `.123Z`: `2025-10-18T15:30:45`
- `+ "Z"` - Re-adds Z: `2025-10-18T15:30:45Z`

**Why subtract 5 minutes?** Clock skew protection. If the client's clock is slightly behind the server, the SAS token will still be valid.

```typescript
const signedExpiry = new Date(new Date().getTime() + expiryMinutes * 60 * 1000)
  .toISOString()
  .slice(0, -5) + "Z";
```
- Adds `expiryMinutes` (default 10) to current time
- Same formatting as start date
- This creates a 15-minute window (5 min before now → 10 min after now)

---

## String to Sign Construction

This is the **critical part** that Azure uses to verify the request:

```typescript
const stringToSign = [
  signedPermissions,    // "cw" = create + write
  signedStart,          // "2025-10-18T15:25:45Z"
  signedExpiry,         // "2025-10-18T15:35:45Z"
  `/blob/${accountName}/${containerName}/${blobName}`, // Canonical resource
  "",                   // signedIdentifier (optional policy)
  "",                   // signedIP (restrict by IP)
  "https",              // signedProtocol (only HTTPS)
  signedVersion,        // "2021-06-08" (API version)
  signedResource,       // "b" = blob (not container "c")
  "",                   // signedSnapshotTime
  "",                   // signedEncryptionScope
  "",                   // rscc (response cache-control)
  "",                   // rscd (response content-disposition)
  "",                   // rsce (response content-encoding)
  "",                   // rscl (response content-language)
  "",                   // rsct (response content-type)
].join("\n");
```

Each field must be in **exact order** per Azure's specification. Empty fields are required as placeholders.

---

## Signature Creation

```typescript
const key = Uint8Array.from(atob(accountKey), (c) => c.charCodeAt(0));
```
- `atob(accountKey)` - Decodes base64 account key
- Converts to `Uint8Array` for crypto operations

```typescript
const cryptoKey = await crypto.subtle.importKey(
  "raw",
  key,
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["sign"]
);
```
- Imports the key for HMAC-SHA256 signing
- `false` = key cannot be exported
- `["sign"]` = key can only sign data

```typescript
const signature = await crypto.subtle.sign("HMAC", cryptoKey, data);
const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
```
- Signs the `stringToSign` with HMAC-SHA256
- Converts binary signature to base64

---

## SAS Token Assembly

```typescript
const sasToken = new URLSearchParams({
  sp: signedPermissions,   // Permissions
  st: signedStart,         // Start time
  se: signedExpiry,        // Expiry time
  sv: signedVersion,       // API version
  sr: signedResource,      // Resource type
  spr: "https",            // Protocol (THIS WAS MISSING!)
  sig: signatureBase64,    // Signature
}).toString();
```

The `spr` parameter tells Azure to **only accept HTTPS requests**. Without it, Azure couldn't match the signature.

---

## Final URL Structure

```
https://metaops.blob.core.windows.net/quill-stream/38360dcc-579e-40ba-91aa-ecf4ccf98220/video.mp4?sp=cw&st=2025-10-18T15:25:45Z&se=2025-10-18T15:35:45Z&sv=2021-06-08&sr=b&spr=https&sig=abc123...
```

The client uses this URL with:
- **Method:** PUT
- **Header:** `x-ms-blob-type: BlockBlob`
- **Body:** The video file binary data

*/
