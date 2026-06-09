import React, { useEffect } from 'react';

const SEO = ({ 
  title, 
  description = "Hotel Ammulu's Kitchen serves traditional stone-ground batters, zero-prep ready-to-cook meal kits, and fresh authentic ready-to-eat South Indian vegetarian delicacies.", 
  keywords = "Ammulu's Kitchen, South Indian food, fresh idli batter, dosa batter, ready to cook, ready to eat, Mylapore catering", 
  image = "/src/assets/img/ammulus-kitchen-logo.jpg", 
  canonical = "http://localhost:5173",
  schemaType = null,
  schemaData = null
}) => {
  useEffect(() => {
    // 1. Title
    const formattedTitle = title ? `${title} | Hotel Ammulu's Kitchen` : "Hotel Ammulu's Kitchen - Authentic South Indian Food & Batters";
    document.title = formattedTitle;

    // Helper function to create or update meta tags
    const updateMetaTag = (attributeName, attributeValue, contentValue) => {
      let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', contentValue);
    };

    // 2. Standard Metadata
    updateMetaTag('name', 'description', description);
    updateMetaTag('name', 'keywords', keywords);

    // 3. Open Graph
    updateMetaTag('property', 'og:title', formattedTitle);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:image', image.startsWith('http') ? image : `http://localhost:5173${image}`);
    updateMetaTag('property', 'og:url', window.location.href);
    updateMetaTag('property', 'og:type', 'website');

    // 4. Twitter Cards
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', formattedTitle);
    updateMetaTag('name', 'twitter:description', description);
    updateMetaTag('name', 'twitter:image', image.startsWith('http') ? image : `http://localhost:5173${image}`);

    // 5. Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', window.location.href);

    // 6. JSON-LD Structured Data Schema
    let schemaScript = document.getElementById('jsonld-schema');
    if (schemaScript) {
      schemaScript.remove();
    }

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
      "telephone": "+91 98765 43210",
      "priceRange": "$$",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "45, Temple Car Street",
        "addressLocality": "Mylapore",
        "addressRegion": "Chennai",
        "postalCode": "600004",
        "addressCountry": "IN"
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "06:00",
        "closes": "22:00"
      }
    });

    // Custom breadcrumb page path schema
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
          "url": window.location.href,
          "priceCurrency": "INR",
          "price": schemaData.price,
          "itemCondition": "https://schema.org/NewCondition",
          "availability": schemaData.in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
        }
      });
    }

    // Inject Script into DOM
    schemaScript = document.createElement('script');
    schemaScript.id = 'jsonld-schema';
    schemaScript.type = 'application/ld+json';
    schemaScript.innerHTML = JSON.stringify(schemas);
    document.head.appendChild(schemaScript);

    return () => {
      // Clean up dynamic script on unmount
      const script = document.getElementById('jsonld-schema');
      if (script) script.remove();
    };
  }, [title, description, keywords, image, canonical, schemaType, schemaData]);

  return null; // Side-effect component, renders nothing in viewport
};

export default SEO;
