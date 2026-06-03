import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Plus, Star,
  BookOpen, Search, Feather
} from 'lucide-react';
import apiClient from '../../services/api';
import { useCart } from '../../context/CartContext';
import DishDetailsModal from './DishDetailsModal';
import logoImg from '../../assets/img/logo.png';
import './Menu.css';

/* ── Constants ── */
const ITEMS_PER_PAGE = 9;

const CATEGORY_ORDER = [
  'breakfast', 'lunch', 'dinner',
  'ready to eat', 'ready to cook',
  'batter products', 'snacks', 'beverages'
];

const resolveImg = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const clean = path.replace(/^\/?(api\/)?assets\//, '');
  return `http://localhost:5000/assets/${clean}`;
};

const TODAY = new Date().toLocaleDateString('en-IN', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
});

/* ══════════════════════════════════════════════════════════ */

const Menu = () => {
  const { addToCart } = useCart();



  /* Book data */
  const [loading,      setLoading]      = useState(true);
  const [allProducts,  setAllProducts]  = useState([]);
  const [grouped,      setGrouped]      = useState({});
  const [catKeys,      setCatKeys]      = useState([]);
  const [turnedCount,  setTurnedCount]  = useState(0);
  const [selectedDish, setSelectedDish] = useState(null);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [searchResults,setSearchResults]= useState(null);

  /* Fetch */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/products/', { params: { limit: 200 } });
        const data = res.data || [];
        setAllProducts(data);
        const g = {};
        data.forEach(p => {
          const key = (p.category || 'specials')
            .toLowerCase().replace(/_/g,' ').replace(/-/g,' ').trim();
          if (!g[key]) g[key] = [];
          g[key].push(p);
        });
        setGrouped(g);
        const keys = [
          ...CATEGORY_ORDER.filter(k => g[k]),
          ...Object.keys(g).filter(k => !CATEGORY_ORDER.includes(k)),
        ];
        setCatKeys(keys);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);



  /* Search */
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) { setSearchResults(null); return; }
    const hits = allProducts.filter(p =>
      p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
    );
    setSearchResults(hits);
  }, [searchQuery, allProducts]);

  /* Build pages: one page = ITEMS_PER_PAGE items */
  const pages = useMemo(() => {
    const list = [];
    catKeys.forEach(key => {
      const items = grouped[key] || [];
      for (let i = 0; i < items.length; i += ITEMS_PER_PAGE) {
        list.push({
          catKey: key,
          items: items.slice(i, i + ITEMS_PER_PAGE),
          pageNum: list.length + 1,
        });
      }
    });
    return list;
  }, [catKeys, grouped]);

  const totalPages  = pages.length;
  // Calculate max possible turns based on pairs of pages
  const maxTurnedCount = Math.max(0, Math.floor((totalPages - 1) / 2));
  const numLeaves   = Math.max(0, Math.ceil((totalPages - 1) / 2));
  
  const canNext     = turnedCount < maxTurnedCount;
  const canPrev     = turnedCount > 0;
  
  // For the active bookmark tracking
  const leftPageIndex = turnedCount * 2;
  const rightPageIndex = turnedCount * 2 + 1;
  const currentPage = pages[leftPageIndex] ?? pages[rightPageIndex] ?? null;

  const goNext   = () => { if (canNext) setTurnedCount(c => c + 1); };
  const goPrev   = () => { if (canPrev) setTurnedCount(c => c - 1); };
  const jumpToCat = (key) => {
    const idx = pages.findIndex(p => p.catKey === key);
    if (idx !== -1) setTurnedCount(Math.floor(idx / 2));
  };

  /* z-index stacking */
  const getZ = (i) => {
    if (i === turnedCount) return 1000;
    if (i < turnedCount)   return i + 1;
    return 500 + (numLeaves - i);
  };

  /* ─── Render a single item row ─── */
  const renderItem = (item) => (
    <div key={item.id} className="menu-item-row" onClick={() => setSelectedDish(item)}>
      <div
        className={`diet-dot ${item.diet_type?.toLowerCase() === 'non-veg' ? 'nonveg' : 'veg'}`}
        title={item.diet_type}
      />
      {item.image && (
        <div className="menu-item-img-wrapper">
          <img src={resolveImg(item.image)} alt={item.name} className="menu-item-img" loading="lazy" />
        </div>
      )}
      <div className="menu-item-details-flex">
        <div className="menu-item-header">
          <h4 className="menu-item-name">{item.name}</h4>
          <div className="menu-item-dots" />
          <span className="menu-item-price">₹{item.price}</span>
        </div>
        <p className="menu-item-desc">
          {item.description || 'Authentic home-style recipe, prepared fresh daily.'}
        </p>
      </div>
      <button
        className="add-btn-elegant"
        disabled={item.in_stock === false}
        onClick={e => { e.stopPropagation(); addToCart(item); }}
        title={item.in_stock === false ? 'Sold Out' : 'Add to Order'}
      >
        <Plus size={13} />
      </button>
    </div>
  );

  /* ─── Render one page of items ─── */
  const renderPage = (pageData, isRightSide = false) => {
    /* Search mode */
    if (searchResults !== null) {
      if (!isRightSide) return <div className="page-right" />; // Hide on left side so it doesn't duplicate
      return (
        <div className="page-right">
          <div className="right-cat-header">
            <h2 className="right-cat-title" style={{ fontSize: '1.2rem' }}>Search Results</h2>
            <div className="right-ornament">
              <div className="right-ornament-line" />
              <span className="right-ornament-star">✦</span>
              <div className="right-ornament-line" />
            </div>
          </div>
          <div className="search-results-label">
            {searchResults.length} dish{searchResults.length !== 1 ? 'es' : ''} found
            for &ldquo;{searchQuery}&rdquo;
          </div>
          <div className="menu-items-list" style={{ overflowY: 'auto' }}>
            {searchResults.length === 0
              ? <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-light)', fontStyle: 'italic' }}>No dishes found.</div>
              : searchResults.map(renderItem)
            }
          </div>
        </div>
      );
    }

    /* Empty / end of menu */
    if (!pageData) {
      return (
        <div className="page-right" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>✦</div>
            <p style={{ fontFamily: "'Playfair Display',serif", letterSpacing: 4, color: 'var(--ink-light)', fontSize: '1rem' }}>
              Amma's Kitchen
            </p>
            <div style={{ width: 60, height: 1, background: 'var(--gold)', margin: '12px auto' }} />
            <p style={{ fontSize: '0.72rem', letterSpacing: 3, color: 'var(--ink-light)', textTransform: 'uppercase' }}>
              Est. with Love
            </p>
          </div>
        </div>
      );
    }

    /* Normal page with items */
    return (
      <div className="page-right">
        <div className="right-cat-header">
          <h2 className="right-cat-title">{pageData.catKey.toUpperCase()}</h2>
          <div className="right-ornament">
            <div className="right-ornament-line" />
            <span className="right-ornament-star">✦</span>
            <div className="right-ornament-line" />
          </div>
        </div>
        <div className="menu-items-list">
          {pageData.items.map(renderItem)}
        </div>
        <div className="page-filler">
          <div className="filler-ornament">✦</div>
          <span className="filler-text">Prepared fresh with Amma's love</span>
          <div className="filler-ornament">✦</div>
        </div>
        <div className="page-number">─── {pageData.pageNum} / {totalPages} ───</div>
      </div>
    );
  };

  /* ════════════════════════════════════════════
     COVER PAGE
     ════════════════════════════════════════════ */


  /* ════════════════════════════════════════════
     BOOK VIEW
     ════════════════════════════════════════════ */
  return (
    <motion.div
      className="menu-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Controls */}
      <div className="book-controls">
        <button className="book-btn" onClick={goPrev} disabled={!canPrev || loading}>
          <ChevronLeft size={16} /> Prev
        </button>
        <span className="book-title-top">
          <BookOpen size={16} /> Amma's Kitchen
        </span>
        <div className="book-search-wrap">
          <Search size={13} className="book-search-icon" />
          <input
            className="book-search"
            placeholder="Search dishes…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="book-btn" onClick={goNext} disabled={!canNext || loading}>
          Next <ChevronRight size={16} />
        </button>
      </div>

      {/* Book stage */}
      {loading ? (
        <div className="menu-loading">
          <div className="menu-loading-title">Opening Menu…</div>
          <div className="menu-loading-sub">Preparing your dining experience</div>
          <div className="menu-loading-dots">
            <div className="menu-loading-dot" />
            <div className="menu-loading-dot" />
            <div className="menu-loading-dot" />
          </div>
        </div>
      ) : (
        <div className="book-stage" style={{ perspective: '2400px', perspectiveOrigin: '50% 50%' }}>

          {/* Static background: both halves same ivory */}
          <div className="book-inner">
            {/* Inner Left: Page 0 */}
            <div className="book-bg-half left">
              {renderPage(pages[0], false)}
            </div>
            {/* Inner Right: Empty (shown when all leaves turned) */}
            <div className="book-bg-half right">
              {renderPage(null, true)}
            </div>
          </div>

          {/* Spine */}
          <div className="book-spine" />

          {/* Category bookmarks */}
          <div className="category-bookmark-rail">
            {catKeys.map(key => (
              <button
                key={key}
                className={`category-bookmark ${currentPage?.catKey === key ? 'bk-active' : ''}`}
                onClick={() => { setSearchQuery(''); jumpToCat(key); }}
                title={key.toUpperCase()}
              >
                {key.slice(0, 8).toUpperCase()}
              </button>
            ))}
          </div>

          {/* Leaves — each leaf front = right page (current), back = left page of next spread */}
          {Array.from({ length: numLeaves }).map((_, i) => {
            const isTurned = i < turnedCount;
            const frontPage = pages[i * 2 + 1];
            const backPage = pages[i * 2 + 2];

            return (
              <motion.div
                key={i}
                className="book-leaf"
                initial={false}
                animate={{ rotateY: isTurned ? -180 : 0 }}
                transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1] }}
                style={{ zIndex: getZ(i) }}
              >
                {/* FRONT — right side when unturned */}
                <div className="leaf-face leaf-front">
                  {renderPage(frontPage, true)}
                </div>
                {/* BACK — left side when turned */}
                <div className="leaf-face leaf-back">
                  {renderPage(backPage, false)}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <DishDetailsModal
        dish={selectedDish}
        onClose={() => setSelectedDish(null)}
        resolveImagePath={resolveImg}
      />
    </motion.div>
  );
};

export default Menu;
