import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import SearchAnalyzer from "./pages/SearchAnalyzer";
import ShoppingAnalyzer from "./pages/ShoppingAnalyzer";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search-analyzer" element={<SearchAnalyzer />} />
            <Route path="/shopping-analyzer" element={<ShoppingAnalyzer />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
