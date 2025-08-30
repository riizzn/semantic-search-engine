export type Product ={
     id: string;            // unique product ID
  name: string;          // product name
  description: string;   // product description
  price: number;         // product price
  category: string;      // product category
  brand: string;         // product brand
  rating: number;        // product rating (e.g. 4.5)
  inStock: boolean;      // availability status
  image: string;         // product image URL
  colors: string[];      // available colors
  features: string[];    // key features


}