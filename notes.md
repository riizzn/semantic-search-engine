
# Semantic Search Setup for E-commerce with Pinecone

## Overview
This guide details the process of setting up a semantic search system for an e-commerce platform using Pinecone for vector storage and retrieval. It covers data preparation, embedding generation, Pinecone index management, and API setup for search functionality.

---

## Step 1: Data Preparation and Embedding Generation

1. **Collect/Create Product Data**  
   Gather product details including titles, descriptions, prices, categories, and brands. This data will be used to generate vector embeddings for semantic search.

2. **Choose a Pre-trained Model**  
   Select a pre-trained model like `sentence-transformers/all-MiniLM-L6-v2` from Hugging Face to convert product text into vector embeddings.

3. **Generate Embeddings**  
   Convert product text into numerical vectors using the chosen model. Combine fields like name and description for better context.  
   **Example Input Format**:  
   ```javascript
   const batch = [
     { name: "Nike Air Zoom", description: "Lightweight running shoes" },
     { name: "Adidas Ultraboost", description: "Soft cushioned running shoes" }
   ];
   ```
   **Transformation**: Use `batch.map((p) => ${p.name}: ${p.description})` to create strings like:  
   ```javascript
   [
     "Nike Air Zoom: Lightweight running shoes",
     "Adidas Ultraboost: Soft cushioned running shoes"
   ]
   ```

4. **Store Embeddings in Pinecone**  
   Save the generated vectors along with product metadata (e.g., title, price, category) in a Pinecone index for efficient retrieval.

---

## Step 2: Understanding Pinecone Indexes

### What is a Pinecone Index?
An index in Pinecone is a specialized database designed to store and query vector embeddings efficiently. It acts as a "smart organization system" for fast similarity searches.  
- **Structure**:  
  ```plaintext
  Vector ID | Embedding (e.g., 384 numbers) | Metadata
  ----------|-----------------------------|--------------------------------
  prod_1    | [0.1, 0.8, 0.3, 0.7, ...]  | {title: "iPhone 14", price: 999}
  prod_2    | [0.9, 0.2, 0.6, 0.1, ...]  | {title: "Nike Shoes", price: 120}
  prod_3    | [0.4, 0.5, 0.2, 0.8, ...]  | {title: "Coffee Mug", price: 15}
  ```
- **Purpose**:  
  - Stores numerical vectors (embeddings) and associated metadata.  
  - Enables fast similarity searches based on vector proximity (not alphabetical order).  
  - Used to insert product embeddings and query them for search results.

### How It Works
1. **Insert Vectors**: Add product embeddings to the index with unique IDs and metadata.  
2. **Query Vectors**: Convert a user’s search query into an embedding and query the index to find the closest matching vectors (similar products).  
3. **Retrieve Results**: Pinecone returns the IDs and metadata of the most similar products based on vector similarity.

---

## Step 3: Setting Up Environment for Node.js Scripts

### Loading Environment Variables
For standalone Node.js scripts (e.g., `seed-pinecone.tsx`), environment variables like `PINECONE_API_KEY` must be explicitly loaded since Next.js does not handle this automatically.

**Code Example**:
```javascript
import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(__dirname, "../../../.env.local") });
```

**Why It’s Necessary**:
- Next.js auto-loads `.env.local` for API routes and components, but standalone scripts do not.  
- The `config` function specifies the exact path to `.env.local` (e.g., three directories up from the script).  
- Without this, variables like `PINECONE_API_KEY` would be undefined, causing the Pinecone client to fail.

**When to Use**:
- ✅ Required for custom Node.js scripts (e.g., `seed.js`, `setup-index.js`).  
- ❌ Not needed in Next.js API routes or components.

### Running the Script
To execute the seeding script:
```bash
cd src/app/scripts
npx tsx seed-pinecone.tsx
```

---

## Step 4: API Setup for Semantic Search

### Search Endpoint
Create an API route to handle search queries.  
- **Path**: `src/app/api/search/route.ts`  
- **Method**: POST (to receive the query string in the request body)  
- **Role**:  
  - Accept a user’s search query.  
  - Generate an embedding for the query.  
  - Query the Pinecone index for similar products.  
  - Return results as JSON.

### API Flow
1. **Parse Request**: Extract the search query from the request body (e.g., `{ query: "lightweight running shoes under $100" }`).  
2. **Generate Embedding**: Use the same Hugging Face model to convert the query into a vector.  
3. **Query Pinecone**: Send the query vector to Pinecone’s `query()` method to retrieve the top matching product IDs and metadata.  
4. **Format Response**:  
   - Extract relevant metadata (e.g., product name, description, price).  
   - Include similarity scores.  
   - Return the results as JSON.

**Example Response**:
```json
[
  { id: "prod_1", title: "Nike Air Zoom", price: 120, score: 0.95 },
  { id: "prod_2", title: "Adidas Ultraboost", price: 150, score: 0.90 }
]
```

### Client-Side Integration
- **Frontend**: Send a POST request from the Next.js frontend to `/api/search` with the user’s query.  
- **Display**: Render the returned product results as a ranked list.

---

## Step 5: Handling Embeddings

### Normalizing Embedding Formats
Pinecone expects embeddings as a flat array of numbers (e.g., `[0.1, 0.2, 0.3, 0.4]`). However, embeddings may come in various formats:  
- **Flat Array**: `[0.1, 0.2, 0.3, 0.4]`  
- **Nested Arrays**: `[[0.1, 0.2], [0.3, 0.4]]`  
- **Mixed**: `[0.1, [0.2, 0.3], 0.4]`

**Normalization Process**:
1. **Check if Input is an Array**:
   ```javascript
   if (Array.isArray(embedding)) {
     // Proceed with normalization
   }
   ```
2. **Flatten the Array**:
   Use `flatMap` to handle nested arrays:
   ```javascript
   .flatMap((item) => (Array.isArray(item) ? item : [item]))
   ```
   - If the item is an array, keep it as is.  
   - If the item is a single value, wrap it in an array.  
   **Example**:
   ```javascript
   // Input: [0.1, [0.2, 0.3], 0.4]
   // Output: [0.1, 0.2, 0.3, 0.4]
   ```
3. **Convert to Numbers**:
   Ensure all values are numbers, not strings:
   ```javascript
   .map(Number)
   ```

### Pinecone Vector Format
Pinecone expects vectors in the following format:
```javascript
{
  id: string, // Must be a string (e.g., product SKU, UUID)
  values: number[], // Flat array of numbers
  metadata?: Record<string, any> // Optional metadata (e.g., { title: "iPhone 14", price: 999 })
}
```
**Why IDs Must Be Strings**:
- Pinecone uses strings for IDs to support various formats (e.g., UUIDs, SKUs).  
- Even numeric IDs must be converted to strings.

---

## Step 6: Error Handling

### In API Routes
- **Use**: `throw error` or `NextResponse.json({ error: "message" }, { status: 500 })`  
- **Why**:  
  - `throw error` stops execution and lets Next.js handle the error gracefully.  
  - `NextResponse.json` sends a proper JSON response to the client.  
- **Avoid**: `process.exit()` in API routes, as it would terminate the entire server.

### In One-Off Scripts
- **Use**: `process.exit(1)` for errors, `process.exit(0)` for success.  
- **Why**: Stops the script immediately if seeding or setup fails, which is desirable for one-time tasks.

**Rule of Thumb**:
- **Scripts**: Use `process.exit(1)` for failures.  
- **API/Server Code**: Use `throw` or return JSON errors.

---

## Step 7: High-Level Workflow

1. **Frontend (Next.js)**:  
   - User enters a query (e.g., “lightweight running shoes under $100”).  
   - Send a POST request to `/api/search` with the query.

2. **API (Backend)**:  
   - Parse the query from the request body.  
   - Generate an embedding using the Hugging Face model.  
   - Query Pinecone for the top N similar vectors.  
   - Fetch full product metadata using returned IDs.  
   - Return results as JSON.

3. **Frontend (Display)**:  
   - Receive and display the ranked list of products as semantic search results.

---

## Key Notes
- **Pinecone Host URL**: The address of your Pinecone index in the cloud, required for upserts and queries.  
- **Hugging Face Input**: Ensure text inputs are formatted as `${name}: ${description}` for consistency with the model.  
- **Error Handling**: Always return a response in API routes, even on failure, to avoid leaving the client hanging.
```

