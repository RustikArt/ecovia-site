/**
 * Configuration centrale du site Ecovia.
 * Modifie ici tout ce qui est éditable côté contenu (logo, slogan, email,
 * mentions légales, FAQ, etc.) — aucun autre fichier n'a besoin d'être touché.
 */

export const siteConfig = {
  brand: {
    name: "ecovia",
    tagline: "Un peu de vert, beaucoup de calme.",
    description:
      "Des plantes d'intérieur sélectionnées avec soin, livrées par un commerce éco-responsable.",
    heroBadge: "Plantes vivantes, sélection française",
    heroSubtitle:
      "Des plantes d'intérieur choisies pour leur résilience. Livrées chez vous par transport éco-responsable.",
    // Ajoute ici le chemin vers ton logo (ex: "/images/logo.svg")
    logoSrc: "/images/logo.svg",
    logoAlt: "Ecovia — Plantes d'intérieur éco-responsables",
    // Couleurs principales de la marque
    primaryColor: "#3d6b4f",   // vert forêt
    accentColor: "#a8c5a0",    // vert sauge doux
    backgroundColor: "#f9f6f1", // blanc cassé naturel
  },

  contact: {
    email: "ecovia-off@proton.me",
    hours: "Lun – Dim, 9h – 18h",
    address: "France",
    // Temps de réponse indicatif affiché sur la page contact
    responseTime: "Nous répondons généralement sous 24h.",
    // Sujet par défaut du formulaire de contact
    defaultSubject: "Question sur ma commande",
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
      "plantes d'intérieur",
      "plantes éco-responsables",
      "livraison plantes France",
      "boutique plantes en ligne",
      "plantes vertes",
    ],
    ogImage: "/images/og-cover.jpg",
    locale: "fr_FR",
    siteUrl: "https://ecovia.fr", // à adapter selon ton domaine réel
  },

  footer: {
    copyright: "Ecovia — Tous droits réservés",
    tagline: "Fait avec soin, livré avec respect.",
    links: [
      { label: "CGV", href: "/cgv" },
      { label: "Confidentialité", href: "/confidentialite" },
      { label: "Livraison", href: "/politique-livraison" },
      { label: "Retours", href: "/politique-retour" },
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/faq" },
    ],
  },

  faq: [
    {
      q: "Comment sont expédiées les plantes ?",
      a: "Dans des conditions éco-responsables et contribuant à un arrangement éco du transport en masse.",
    },
    {
      q: "Quels sont les délais de livraison ?",
      a: "2 à 4 jours ouvrés en France métropolitaine.",
    },
    {
      q: "La livraison est-elle vraiment offerte ?",
      a: "Oui, la livraison est 100% offerte sur l'intégralité de nos commandes, sans minimum d'achat.",
    },
    {
      q: "Et si ma plante arrive abîmée ?",
      a: "Garantie 14 jours : contactez-nous avec une photo, nous remplaçons ou remboursons.",
    },
    {
      q: "Livrez-vous en dehors de la France métropolitaine ?",
      a: "Pour le moment, nous livrons uniquement en France métropolitaine. Restez connectés pour les évolutions à venir !",
    },
    {
      q: "Comment entretenir ma plante à la réception ?",
      a: "Un guide d'entretien est glissé dans chaque colis. Vous pouvez aussi nous contacter si vous avez des questions spécifiques.",
    },
    {
      q: "Puis-je modifier ou annuler ma commande ?",
      a: "Contactez-nous rapidement à ecovia-off@proton.me. Tant que la commande n'est pas expédiée, nous ferons notre possible pour l'ajuster.",
    },
    {
      q: "Vos plantes sont-elles garanties ?",
      a: "Oui, toutes nos plantes sont garanties vivantes pendant 14 jours après réception.",
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
        "Les présentes conditions régissent les ventes effectuées sur la boutique Ecovia. Toute commande passée implique l'acceptation pleine et entière de ces conditions.",
      prix:
        "Les prix sont indiqués en euros toutes taxes comprises. La livraison est 100% offerte, sans minimum d'achat.",
      paiement:
        "Le paiement est sécurisé via Shopify Checkout (CB, Apple Pay, Google Pay, Shop Pay).",
      proprieteIntellectuelle:
        "L'ensemble des contenus présents sur ce site (textes, images, logo) sont la propriété exclusive d'Ecovia et ne peuvent être reproduits sans autorisation.",
      juridiction:
        "En cas de litige, les tribunaux français sont seuls compétents. Le droit applicable est le droit français.",
    },
    confidentialite: [
      "Nous collectons uniquement les données nécessaires au traitement de vos commandes : email, nom, adresse de livraison, téléphone (optionnel). Ces données sont stockées de façon sécurisée et ne sont jamais revendues.",
      "Le paiement est traité par Shopify ; nous n'avons pas accès à vos données bancaires.",
      "Vous pouvez à tout moment demander l'accès, la rectification ou la suppression de vos données via la page contact.",
      "Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de portabilité et d'effacement de vos données personnelles.",
      "Des cookies techniques sont utilisés pour le bon fonctionnement du site. Aucun cookie publicitaire tiers n'est déposé sans votre consentement.",
    ],
    livraison: {
      intro:
        "Livraison 100% offerte en France métropolitaine via Colissimo, en 2 à 4 jours ouvrés, sans minimum d'achat.",
      preparation:
        "Vos commandes sont préparées sous 48h ouvrées. Chaque plante est emballée à la main dans des matériaux recyclés sans plastique.",
      suivi: "Vous recevez par email un numéro de suivi dès l'expédition.",
      retard:
        "En cas de retard exceptionnel (météo, grève, etc.), nous vous en informons par email dans les meilleurs délais.",
    },
    retours: {
      garantie:
        "Toutes nos plantes sont garanties vivantes 14 jours. En cas de problème, contactez-nous avec une photo pour un remplacement ou un remboursement.",
      retractation:
        "Conformément au Code de la consommation, vous disposez de 14 jours pour exercer votre droit de rétractation sur les pots et accessoires non périssables.",
      procedure:
        "Pour initier un retour, contactez-nous à ecovia-off@proton.me avec votre numéro de commande et une description du problème.",
      remboursement:
        "Les remboursements sont effectués sous 5 à 10 jours ouvrés sur le moyen de paiement utilisé lors de la commande.",
    },
    mentionsLegales: {
      editeur: "Ecovia",
      directeurPublication: "", // à compléter
      hebergeur: "Shopify Inc., 151 O'Connor Street, Ottawa, Ontario, Canada",
      contact: "ecovia-off@proton.me",
    },
  },
} as const;

export type SiteConfig = typeof siteConfig;
