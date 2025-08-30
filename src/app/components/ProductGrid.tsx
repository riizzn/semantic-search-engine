"use client";
import React, { useEffect, useState } from "react";
import { Product } from "../types";
import { useSearchParams } from "next/navigation";
import ProductCard from "./ProductCard";

const ProductGrid = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  console.log("The search params here are:", searchParams.get("q"));
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const query = searchParams.get("q");
        const response = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query,
          }),
        });
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Failed to retrieve products", error);
      }finally{
        setLoading(false)
      }
    };
    fetchProducts();
  }, [searchParams]);
  if (loading) return <p className="text-center mt-5">loading...</p>
  if(!products.length) return <p className="text-gray-500 text-center mt-5">No products found, Try differnt search terms</p>

  return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {products.map((product)=>(
      <ProductCard key={product.id} product={product}/>
    ))}



  </div>;
};

export default ProductGrid;
