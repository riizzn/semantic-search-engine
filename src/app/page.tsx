import { Suspense } from "react";
import SearchFilter from "./components/SearchFilter";
import ProductGrid from "./components/ProductGrid";

export default function Home() {
  return (
    <div className="mx-auto container px-4 py-8">
      <h1 className="text-4xl text-center font-semibold tracking-tight mb-5">
        Search Products
      </h1>
      <SearchFilter />
      <Suspense fallback={<div>Loading...</div>}>
      <div className="mt-10"> <ProductGrid /></div>
       
      </Suspense>
    </div>
  );
}
