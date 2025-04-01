## Routes

### GET /history

Fetches the wallet history based on the provided query parameters.

#### Query Parameters

- `trackedCA` (string): The tracked contract address.
- `chainId` (string): The blockchain ID.

#### Response

- **200 OK**: Returns the formatted wallet history as JSON.
- **404 Not Found**: If an error occurs during processing.

#### Example Request

```
GET /history?trackedCA=0x1234567890abcdef&chainId=1
```

#### Example Response

```json
[
  {
    "transactionId": "0xabc123",
    "timestamp": "2023-01-01T00:00:00Z",
    "amount": "100",
    "type": "deposit"
  }
]
```

---

### GET /tracked-wallets

Fetches the list of tracked wallets for a user.

#### Query Parameters

- `userCA` (string): The user's contract address.

#### Response

- **200 OK**: Returns a list of tracked wallets as JSON.
- **Error**: Returns the error object if an issue occurs.

#### Example Request

```

GET /tracked-wallets?userCA=0x1234567890abcdef

```

#### Example Response

```json
[
  {
    "tag": "Personal Wallet",
    "walletCA": "0xabcdef1234567890",
    "chainId": "1",
    "highlight": true,
    "lastTimestamp": "2023-01-01T00:00:00Z",
    "id": "wallet123"
  }
]
```

---

### POST /tracked-wallets

Adds a new wallet to the tracked wallets list.

#### Request Body

- `currentAccount` (string): The user's contract address.
- `address` (string): The wallet contract address to track.
- `tag` (string): A tag for the wallet.
- `chainId` (string): The blockchain ID.
- `highlight` (boolean): Whether to highlight the wallet.

#### Response

- **200 OK**: Returns the added wallet as JSON.
- **404 Not Found**: If an error occurs during processing.

#### Example Request

```json
POST /tracked-wallets
{
  "currentAccount": "0x1234567890abcdef",
  "address": "0xabcdef1234567890",
  "tag": "Personal Wallet",
  "chainId": "1",
  "highlight": true
}
```

#### Example Response

```json
{
  "tag": "Personal Wallet",
  "walletCA": "0xabcdef1234567890",
  "chainId": "1",
  "highlight": true,
  "lastTimestamp": "2023-01-01T00:00:00Z",
  "id": "wallet123"
}
```

---

### DELETE /tracked-wallets

Deletes a wallet from the tracked wallets list.

#### Query Parameters

- `userCA` (string): The user's contract address.
- `id` (string): The ID of the wallet to delete.

#### Response

- **200 OK**: If the wallet is successfully deleted.
- **404 Not Found**: If an error occurs during processing.

#### Example Request

```
DELETE /tracked-wallets?userCA=0x1234567890abcdef&id=wallet123
```

#### Example Response

```
Status: 200 OK
```

---

### GET /send-sepolia-eth

Programmatically sends Sepolia ETH between developer wallets.

#### Request Body

- No specific body parameters are required.

#### Response

- **200 OK**: Returns the transaction details as JSON.
- **Error**: Logs the error and returns an appropriate error response.

#### Example Request

```
GET /test
```

#### Example Response

```json
{
  "hash": "0xabc123...",
  "to": "0xabcdef1234567890",
  "from": "0x1234567890abcdef",
  "value": "1000000000000000",
  "gasLimit": "21000",
  "gasPrice": "10000000000",
  "nonce": 1,
  "chainId": 11155111
}
```
