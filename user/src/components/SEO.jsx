import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title, 
  description = "Hotel Ammulu's Kitchen serves traditional stone-ground batters, zero-prep ready-to-cook meal kits, and fresh authentic ready-to-eat South Indian vegetarian delicacies.", 
  keywords = "Ammulu's Kitchen, South Indian food, fresh idli batter, dosa batter, ready to cook, ready to eat, Mylapore catering", 
  image = "/src/assets/img/ammulus-kitchen-logo.jpg", 
  canonical = "http://localhost:5173",
  schemaType = null,
  schemaData = null,
  additionalSchema = null
}) => {
  const formattedTitle = title ? `${title} | Hotel Ammulu's Kitchen` : "Hotel Ammulu's Kitchen - Authentic South Indian Food & Batters";
  const finalImage = image.startsWith('http') ? image : `http://localhost:5173${image}`;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : canonical;

  // Generate Schema Object
  const schemas = [];

  // Base Organization Schema (Always injected for SEO authority)
  schemas.push({
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": "http://localhost:5173/#restaurant",
    "name": "Hotel Ammulu's Kitchen",
    "image": "http://localhost:5173/src/assets/img/ammulus-kitchen-logo.jpg",
    "url": "http://localhost:5173",
    "telephone": "+91 72009 42596",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "45, Temple Car Street",
      "addressLocality": "Mylapore",
      "addressRegion": "Chennai",
      "postalCode": "600004",
      "addressCountry": "IN"
    },
    "areaServed": [
      { "@type": "City", "name": "Hosur" },
      { "@type": "City", "name": "Bangalore" },
      { "@type": "City", "name": "Bengaluru" },
      { "@type": "Place", "name": "Electronic City" },
      { "@type": "Place", "name": "Attibele" }
    ],
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "06:00",
      "closes": "22:00"
    }
  });

  // Website Schema for Sitelinks Search Box
  schemas.push({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Hotel Ammulu's Kitchen",
    "url": "http://localhost:5173",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "http://localhost:5173/menu?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  });

  // Custom breadcrumb page path schema
  if (typeof window !== 'undefined') {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    if (pathSegments.length > 0) {
      const breadcrumbList = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "http://localhost:5173"
          }
        ]
      };
      let currentPath = "http://localhost:5173";
      pathSegments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        breadcrumbList.itemListElement.push({
          "@type": "ListItem",
          "position": index + 2,
          "name": segment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          "item": currentPath
        });
      });
      schemas.push(breadcrumbList);
    }
  }

  // Dynamic Product detail / category schema
  if (schemaType === 'Product' && schemaData) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Product",
      "name": schemaData.name,
      "description": schemaData.description || description,
      "image": schemaData.image ? (schemaData.image.startsWith('http') ? schemaData.image : `http://localhost:5173/${schemaData.image}`) : undefined,
      "offers": {
        "@type": "Offer",
        "url": currentUrl,
        "priceCurrency": "INR",
        "price": schemaData.price,
        "itemCondition": "https://schema.org/NewCondition",
        "availability": schemaData.in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
      }
    });
  }

  // Inject any explicitly passed extra schemas (like FAQPage)
  if (additionalSchema) {
    schemas.push(additionalSchema);
  }

  return (
    <Helmet>
      {/* 1. Title */}
      <title>{formattedTitle}</title>

      {/* 2. Standard Metadata */}
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow, max-image-preview:large" />

      {/* 3. Open Graph */}
      <meta property="og:title" content={formattedTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content="website" />

      {/* 4. Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={formattedTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={finalImage} />

      {/* 5. Canonical Link */}
      <link rel="canonical" href={currentUrl} />

      {/* 6. JSON-LD Structured Data Schema */}
      <script type="application/ld+json">
        {JSON.stringify(schemas)}
      </script>
    </Helmet>
  );
};

export default SEO;
