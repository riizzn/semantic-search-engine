import { config } from "dotenv";
import path from "path";
import { getPineconeClient } from "../lib/pinecone";
import { InferenceClient } from "@huggingface/inference";
import products from "../data/products.json";
config({ path: path.resolve(__dirname, "../../../.env.local") });
const seedPinecone = async () => {
  try {
    const indexName = process.env.PINECONE_INDEX || "";
    const pc = getPineconeClient();
    const index = pc.index(indexName);
    const hf = new InferenceClient(process.env.HF_TOKEN);
    const batchSize = 10;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      //Generate embeddings
      const embeddings = await hf.featureExtraction({
        model: process.env.EMBEDDING_MODEL!,
        inputs: batch.map((p) => `${p.name} : ${p.description}`),
      });
      const upsertReq = batch.map((p, index) => ({
        id: p.id,
        values: Array.isArray(embeddings[index])
          ? (embeddings[index].flat(Infinity) as number[]) //array of numbers
          : [embeddings[index] as number], //single number
        metadata: {
          ...p,
          colors: p.colors.join("|"),
          features: p.features.join("|"),
        },
      }));
      await index.upsert(upsertReq);
      console.log(`Processed batch ${i / batchSize + 1}`);
    }
    console.log("succesfully seeded Pinecone index");
  } catch (error) {
    console.error(
      "Embedding generation failed or coudnot seed pinecone: ",
      error
    );
    process.exit(1);
  }
};

seedPinecone();
