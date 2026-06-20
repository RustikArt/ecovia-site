const PRODUCT_FRAGMENT = `
  id
  title
  description
  descriptionHtml
  handle
  tags
  vendor
  productType
  priceRange {
    minVariantPrice { amount currencyCode }
    maxVariantPrice { amount currencyCode }
  }
  images(first: 8) {
    edges { node { url altText } }
  }
  variants(first: 50) {
    edges {
      node {
        id
        title
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
        availableForSale
        selectedOptions { name value }
        image { url altText }
      }
    }
  }
  options { name values }
`;

export const PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $query: String) {
    products(first: $first, query: $query, sortKey: BEST_SELLING) {
      edges {
        node {
          ${PRODUCT_FRAGMENT}
        }
      }
    }
  }
`;

export const COLLECTION_BY_HANDLE_QUERY = `
  query GetCollectionByHandle($handle: String!, $first: Int!) {
    collectionByHandle(handle: $handle) {
      title
      products(first: $first) {
        edges {
          node {
            ${PRODUCT_FRAGMENT}
          }
        }
      }
    }
  }
`;

export const COLLECTIONS_QUERY = `
  query GetCollections($first: Int!) {
    collections(first: $first, sortKey: TITLE) {
      edges {
        node {
          id
          title
          handle
          image { url altText }
        }
      }
    }
  }
`;

const METAFIELD_IDENTIFIERS = `[
  { namespace: "bundles", key: "discount_title_1" },
  { namespace: "bundles", key: "discount_value_1" },
  { namespace: "bundles", key: "discount_title_2" },
  { namespace: "bundles", key: "discount_value_2" },
  { namespace: "bundles", key: "discount_title_3" },
  { namespace: "bundles", key: "discount_value_3" },
  { namespace: "reviews",  key: "rating" },
  { namespace: "reviews",  key: "count" },
  { namespace: "reviews",  key: "list" }
]`;

export const PRODUCT_BY_HANDLE_QUERY = `
  query GetProduct($handle: String!) {
    product(handle: $handle) {
      ${PRODUCT_FRAGMENT}
      media(first: 12) {
        edges {
          node {
            id
            mediaContentType
            previewImage { url }
            ... on MediaImage { image { url altText } }
            ... on Video { sources { url mimeType format } }
          }
        }
      }
      metafields(identifiers: ${METAFIELD_IDENTIFIERS}) {
        namespace key type value
      }
    }
  }
`;

export const CART_QUERY = `
  query cart($id: ID!) {
    cart(id: $id) { id totalQuantity }
  }
`;

export const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } }
      }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_ADD_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } }
      }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_UPDATE_MUTATION = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { id }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_REMOVE_MUTATION = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { id }
      userErrors { field message }
    }
  }
`;
