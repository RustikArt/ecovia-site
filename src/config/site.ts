/**
 * Configuration centrale du site Ecovia.
 * Modifie ici tout ce qui est éditable côté contenu (logo, slogan, email,
 * mentions légales, FAQ, etc.) — aucun autre fichier n'a besoin d'être touché.
 */

export const siteConfig = {
  brand: {
    name: "Ecovia",
    tagline: "Plantes artificielles premium pour intérieurs sans entretien.",
    description:
      "Plantes artificielles haut de gamme pensées pour décorer votre intérieur immédiatement, sans entretien.",
    heroBadge: "Décoration premium, zéro entretien",
    heroSubtitle:
      "Créez un intérieur végétal et sophistiqué avec des plantes artificielles réalistes, livrées prêtes à poser.",
    // Ajoute ici le chemin vers ton logo (ex: "/images/logo.svg")
    logoSrc: new URL("../assets/ChatGPT_Image_21_juin_2026__11_30_32-removebg-preview.png", import.meta.url).href,
    logoAlt: "Ecovia — Plantes artificielles premium",
    // Couleurs principales de la marque
    primaryColor: "#3d6b4f",   // vert forêt
    accentColor: "#a8c5a0",    // vert sauge doux
    backgroundColor: "#f9f6f1", // blanc cassé naturel
  },
  featuredCollectionHandle: "coup-de-coeur",

  contact: {
    email: "ecovia-off@proton.me",
    hours: "Lun – Dim, 9h – 18h",
    address: "France",
    // Temps de réponse indicatif affiché sur la page contact
    responseTime: "Nous répondons généralement sous 24h ouvrées.",
    // Sujet par défaut du formulaire de contact
    defaultSubject: "Demande d'aide",
  },

  shipping: {
    bannerText: "Livraison offerte pour n'importe quel achat !",
    freeShippingThreshold: 0,
    carrier: "Colissimo",
    estimatedDelay: "2 à 4 jours ouvrés",
    preparationDelay: "48h ouvrées",
    zones: ["France métropolitaine"],
    packagingNote:
      "Chaque plante est emballée à la main dans des matériaux recyclés, sans plastique.",
    trackingNote:
      "Un numéro de suivi vous est envoyé par email dès l'expédition.",
  },

  social: {
    instagram: "",   // ex: "https://instagram.com/ecovia.plantes"
    tiktok: "",      // ex: "https://tiktok.com/@ecovia.plantes"
    pinterest: "",   // ex: "https://pinterest.fr/ecoviaplantes"
  },

  seo: {
    defaultTitle: "Ecovia — Plantes d'intérieur éco-responsables",
    defaultDescription:
      "Découvrez notre sélection de plantes d'intérieur livrées en France par transport éco-responsable. Livraison 100% offerte, sans minimum d'achat.",
    defaultKeywords: [
      "plantes artificielles premium",
      "plantes déco intérieur",
      "plantes sans entretien",
      "plantes artificielles France",
      "boutique plantes en ligne",
      "décoration végétale",
    ],
    ogImage: "/images/og-cover.jpg",
    locale: "fr_FR",
    siteUrl: "https://ecovia.fr", // à adapter selon ton domaine réel
  },

  footer: {
    copyright: "Ecovia — Tous droits réservés",
    tagline: "Fabriquées avec soin, livrées avec respect.",
    links: [
      { label: "CGV", href: "/cgv" },
      { label: "Confidentialité", href: "/confidentialite" },
      { label: "Mentions légales", href: "/mentions-legales" },
      { label: "Livraison", href: "/politique-livraison" },
      { label: "Retours", href: "/politique-retour" },
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/faq" },
    ],
  },

  faq: [
    {
      q: "Les plantes sont-elles réalistes ?",
      a: "Oui. Nos plantes artificielles premium sont conçues pour offrir un rendu ultra réaliste, aussi bien en texture qu'en coloris.",
    },
    {
      q: "Quel est le délai de livraison ?",
      a: "En France métropolitaine, nos plantes sont livrées sous 2 à 4 jours ouvrés avec suivi colis.",
    },
    {
      q: "Comment suivre ma commande ?",
      a: "Vous recevez un email avec un numéro de suivi dès l'expédition. Suivez votre colis à tout moment depuis votre espace client.",
    },
    {
      q: "Puis-je retourner un produit ?",
      a: "Oui, vous disposez de 14 jours pour signaler un retour ou un échange si le produit ne correspond pas à vos attentes.",
    },
    {
      q: "Les plantes nécessitent-elles un entretien ?",
      a: "Non. Nos plantes artificielles sont prêtes à poser et ne demandent ni arrosage, ni taille, ni entretien régulier.",
    },
  ],

  legal: {
    companyName: "Ecovia",
    // Informations légales de l'entreprise (à compléter selon ton statut)
    legalForm: "Auto-entrepreneur / SASU", // à adapter
    siret: "",        // ex: "123 456 789 00012"
    tva: "",          // ex: "FR12345678901" (si applicable)
    rcs: "",          // ex: "RCS Paris B 123 456 789" (si applicable)
    responsable: "",  // Nom du responsable de publication
    host: {
      name: "Shopify Inc.",
      address: "151 O'Connor Street, Ground floor, Ottawa, Ontario, K2P 2L8, Canada",
    },
    cgv: {
      intro:
        "Les présentes conditions régissent les ventes effectuées sur la boutique Ecovia. Toute commande implique l'acceptation de ces conditions.",
      prix:
        "Les prix sont indiqués en euros TTC. La livraison est offerte en France métropolitaine, sans minimum d'achat.",
      paiement:
        "Le paiement est sécurisé via Shopify Checkout. Nous ne stockons aucune donnée de carte bancaire.",
      livraison:
        "Ecovia expédie les commandes sous 48h ouvrées. La livraison est effectuée en 2 à 4 jours ouvrés en France métropolitaine.",
      retours:
        "Vous pouvez exercer votre droit de rétractation dans les 14 jours après réception. Contactez notre service client pour organiser le retour.",
      droitApplicable:
        "Le droit français s'applique à toutes les ventes conclues sur ce site. Tout litige relève des tribunaux compétents français.",
    },
    confidentialite: [
      "Nous collectons uniquement les données nécessaires au traitement des commandes : nom, email, adresse et téléphone (optionnel).",
      "Les données de paiement sont traitées par Shopify et ne sont pas stockées sur ce site.",
      "Vous pouvez exercer vos droits d'accès, de rectification, de portabilité et de suppression de vos données à tout moment.",
      "Nous utilisons des cookies techniques pour le fonctionnement du site. Les cookies publicitaires ne sont déposés qu'avec votre accord.",
      "Vos données sont conservées selon les exigences légales et sécurisées conformément au RGPD.",
    ],
    livraison: {
      intro:
        "Livraison offerte en France métropolitaine en 2 à 4 jours ouvrés depuis la confirmation de commande.",
      preparation:
        "Votre commande est préparée sous 48h ouvrées. Chaque produit est emballé avec soin dans des matériaux recyclés.",
      suivi: "Vous recevez un email de confirmation contenant un numéro de suivi dès l'expédition.",
      retard:
        "En cas de retard exceptionnel (météo, grève, etc.), nous vous informons rapidement par email.",
    },
    retours: {
      garantie:
        "Nos produits bénéficient d'une garantie 14 jours. Si un article est endommagé ou insatisfaisant, nous procédons à un échange ou un remboursement.",
      retractation:
        "Vous disposez d'un droit de rétractation de 14 jours à compter de la réception de vos articles.",
      procedure:
        "Pour un retour, contactez-nous à ecovia-off@proton.me avec votre numéro de commande et une photo du produit.",
      remboursement:
        "Le remboursement est effectué sous 5 à 10 jours ouvrés sur le moyen de paiement utilisé lors de la commande.",
    },
    mentionsLegales: {
      editeur: "Ecovia",
      directeurPublication: "Non communiqué",
      hebergeur: "Shopify Inc., 151 O'Connor Street, Ottawa, Ontario, Canada",
      contact: "ecovia-off@proton.me",
      societaire: "Ecovia — Auto-entrepreneur / SASU",
      siret: "À renseigner selon votre statut",
      tva: "À renseigner si applicable",
    },
  },
} as const;

export type SiteConfig = typeof siteConfig;
