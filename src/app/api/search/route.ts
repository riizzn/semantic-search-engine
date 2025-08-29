import { getPineconeClient } from "@/app/lib/pinecone";
import { InferenceClient } from "@huggingface/inference";

import { NextResponse } from "next/server";
export const POST = async (req: Request) => {
  try {
    const hf = new InferenceClient(process.env.HF_TOKEN);
    const { query } = await req.json();
    const response = await hf.featureExtraction({
      model: process.env.EMBEDDING_MODEL,
      inputs: query,
    });
    //convert response to a flat number array
    const normalizeEmbedding = (embedding: unknown): number[] => {
      if (typeof embedding === "number") {
        return [embedding];
      }
      if (Array.isArray(embedding)) {
        return embedding
          .flatMap((item) => (Array.isArray(item) ? item : [item]))
          .map(Number);
      }
      throw new Error("Invalid embedding format");
    };
    const embedding = normalizeEmbedding(response);
    const pc = getPineconeClient();
    const index = pc.index(process.env.PINECONE_INDEX!);
    const results = await index.query({
      vector: embedding,
      topK: 10,
      includeMetadata: true,
    });
    //Format results
    const products = results.matches.map((match) => ({
      ...match.metadata,
      colors:
        typeof match.metadata?.colors === "string"
          ? match.metadata.colors.split("|")
          : [],
      features:
        typeof match.metadata?.features === "string"
          ? match.metadata.features.split("|")
          : [],
    }));
    return NextResponse.json(products);
  } catch (error) {
    console.error("search error:", error);
    return NextResponse.json({
      error: "Internal server error",
      status: 500,
    });
  }
};
