import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsStorage = await AsyncStorage.getItem('@GoMarket:products');
      if (productsStorage) {
        const parsedProducts = JSON.parse(productsStorage);
        setProducts([...parsedProducts]);
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function saveProducts(): Promise<void> {
      await AsyncStorage.setItem(
        '@GoMarket:products',
        JSON.stringify(products),
      );
    }
    saveProducts();
  }, [products]);

  const addToCart = useCallback(
    async product => {
      const productsCopy = [...products];
      const productExists = productsCopy.find((obj, index) => {
        if (obj.id === product.id) {
          productsCopy[index].quantity += 1;
          return true;
        }
        return false;
      });

      if (!productExists) {
        const newProduct = { ...product, quantity: 1 };
        setProducts([...products, newProduct]);
      } else {
        setProducts([...productsCopy]);
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productsCopy = [...products];
      productsCopy.find((obj, index) => {
        if (obj.id === id) {
          productsCopy[index].quantity += 1;
          return true;
        }
        return false;
      });

      setProducts([...productsCopy]);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productsCopy = [...products];
      productsCopy.find((obj, index) => {
        if (obj.id === id) {
          if (obj.quantity > 1) {
            productsCopy[index].quantity -= 1;
          } else {
            productsCopy.splice(index, 1);
          }
          return true;
        }
        return false;
      });

      setProducts([...productsCopy]);
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
