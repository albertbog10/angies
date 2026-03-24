import { useEffect, useState } from "react";
import {
  businessPhotos,
  customCakePhotos,
  empanadaPhotos,
  savoryFoodPhotos,
} from "./galleryData";

const homeNavLinks = [
  { href: "#custom-cakes", label: "Custom Cakes" },
  { href: "#menu", label: "Menu" },
  { href: "#visit", label: "Visit" },
];

const orderNavLinks = [
  { href: "/#custom-cakes", label: "Cake Gallery" },
  { href: "/#visit", label: "Visit" },
  { href: "tel:+17325159515", label: "Call" },
];

const mapsHref =
  "https://www.google.com/maps/search/?api=1&query=275+Amboy+Ave,+Metuchen,+NJ+08840";
const phoneHref = "tel:+17325159515";
const homeHref = "/";
const cakeOrderHref = "/cake-order.html";
const googleReviewsHref =
  "https://www.google.com/search?sca_esv=6b7c40959298e02e&sxsrf=ANbL-n7MV0LRnYsbknyQyqMlUsF1LJ7PEw:1774329520383&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOR-vsUvH74q32ic0Qke-UwUVTlsfc5hlMFaap8qiNGNvDS_X3MGZ6JNZ01VlZDm9TXzfnwUM1Ym_a_xO0xyU7xYxhcU_GWmSqDd4s2e60Q0ndBviRQ%3D%3D&q=Angie%27s+Cafe+and+Bakery+Reviews&sa=X&ved=2ahUKEwihoJvG5LeTAxWOEVkFHW0rCAUQ0bkNegQILBAF&biw=916&bih=686&dpr=2";
const heroPhoto = businessPhotos[0];
const empanadaPhoto = empanadaPhotos[0];
const customOrderCakePhoto = "/images/food/cake1.png";
const customOrderCupcakePhoto = "/images/food/cupcake1.png";
const checkoutReceiptStorageKey = "angies_last_checkout_order";

const businessHours = [
  ["Tuesday", "Closed"],
  ["Wednesday", "11 AM - 7 PM"],
  ["Thursday", "11 AM - 7 PM"],
  ["Friday", "11 AM - 7 PM"],
  ["Saturday", "11 AM - 7 PM"],
  ["Sunday", "9 AM - 3 PM"],
  ["Monday", "11 AM - 7 PM"],
];

const highlightCards = [
  {
    kicker: "Celebrations",
    title: "Custom cake orders",
    description:
      "Birthday, baby shower, and themed cakes get a dedicated spotlight right on the homepage.",
    actionLabel: "Order custom cake",
    actionHref: cakeOrderHref,
  },
];

const reviewHighlights = [
  {
    title: "Cake, juices, and empanadas",
    text:
      "Great Dominican Bakery. We went to order a cake (Which was great, by the way) and had to order dominican rice, beans and pernil, plus some empanadas. Great juices, I ordered a morir soñando that tasted like heaven. Ambience is so romantic, great for dates.",
  },
  {
    title: "Iced cappuccinos and cute decor",
    text:
      "She makes the best iced cappuccinos 10/10 and consistent Everytime. The decor inside is so cute as well! I have to visit Everytime I'm in the area ❤️❤️❤️",
  },
  {
    title: "Tres leches and hot ginger tea",
    text:
      "Love the Tres Leches Postre, please try her customized Hot Ginger Tea with fruits inside. Also, the chicken sandwich is delicious 😋😋",
  },
];

const drinkMenus = [
  {
    title: "Hot coffee",
    items: [
      ["Cafe con leche", "S $2.49 / M $2.99 / L $3.49"],
      ["Black coffee", "S $1.99 / M $2.49 / L $2.99"],
      ["Latte", "$5.49"],
      ["Cappuccino", "$5.49"],
      ["Pink cappuccino", "$5.99"],
      ["Espresso", "$2.99"],
      ["Coquito latte", "$5.49"],
    ],
  },
  {
    title: "Iced coffee",
    accent: true,
    items: [
      ["Regular", "$4.99"],
      ["Black", "$4.49"],
      ["Caramel", "$6.99"],
      ["Vanilla", "$6.99"],
      ["Macchiato", "$6.99"],
      ["Pink", "$6.99"],
      ["Coquito", "$6.99"],
    ],
  },
  {
    title: "Tea, chocolate, and juices",
    items: [
      ["Tea flavors", "$3.50 each"],
      ["Ginger, peach, lemon honey", "Fresh brewed"],
      ["Blueberry, chamomile honey", "Fruit and floral"],
      ["Passion fruit", "Bright and tangy"],
      ["Hot chocolate", "S $2.49 / M $2.99 / L $3.49"],
      ["Natural fruit juices", "Up to 2 flavors $7.75"],
      ["Add-ons", "Extra flavor $1.00 / Milk $1.00"],
    ],
  },
];

const empanadas = [
  { name: "Beef", price: "$3.99" },
  { name: "Chicken", price: "$3.99" },
  { name: "Pork", price: "$3.99" },
  { name: "Cheese", price: "$3.99" },
  { name: "Salami", price: "$3.99" },
  { name: "Spinach", price: "$3.99" },
  { name: "Broccoli", price: "$3.99" },
  { name: "Ham & cheese", price: "$3.99" },
  { name: "Pizza", price: "$3.99" },
  { name: "Shrimp", price: "$4.99" },
];

const kitchenMenus = [
  {
    title: "Entrees",
    items: [
      ["Beef stew", "$14.49"],
      ["Chicken stew", "$13.75"],
      ["Fried tilapia", "$14.75"],
      ["Roast pork", "$13.75"],
      ["Pork chops", "$14.99"],
      ["Pork chunks", "$15.75"],
      ["Chicken chunks", "$15.75"],
      ["Rotisserie chicken", "$13.25"],
    ],
  },
  {
    title: "Dominican classics",
    accent: true,
    items: [
      ["Mangu with choice of 3", "$18.99"],
      ["Mofongo with pork chunks", "$18.99"],
      ["Mofongo with chicken chunks", "$18.75"],
      ["Mofongo with shrimp", "$19.99"],
      ["Shrimp scampi", "$15.99"],
      ["Whole fried fish", "$18.99"],
      ["Grilled chicken plate", "$14.99"],
      ["Mixed rice with shrimp", "$16.99"],
    ],
  },
  {
    title: "Sandwiches, wraps, and sides",
    items: [
      ["Cuban sandwich", "$14.75"],
      ["Wraps", "From $12.49"],
      ["Kids meals with fries", "$9.75"],
      ["Rice", "$5.99"],
      ["Beans", "$5.99"],
      ["French fries", "$4.75"],
      ["Tostones", "$4.75"],
      ["Maduros", "$4.99"],
    ],
  },
];

const pastryMenus = [
  {
    title: "Dessert classics",
    items: [
      ["Tres leches", "$7.50"],
      ["Dominican cake", "$6.49"],
      ["Flan", "$6.99"],
      ["Flancocho", "$7.49"],
      ["Tiramisu glass", "$6.49"],
      ["Mango mousse", "$6.99"],
    ],
  },
  {
    title: "Cake slices and puddings",
    accent: true,
    items: [
      ["Carrot cake", "$6.99"],
      ["Chocolate fudge cake", "$6.99"],
      ["Red velvet", "$6.99"],
      ["Bread pudding", "$6.99"],
      ["Rice pudding", "$5.99"],
      ["Corn pudding", "$5.99"],
    ],
  },
  {
    title: "Cupcakes and sweets",
    items: [
      ["French macarons", "$2.50"],
      ["Cake pops", "$3.25"],
      ["Mini cupcakes", "$1.50"],
      ["Cupcakes", "$3.50"],
    ],
    noteLabel: "Cupcake flavors:",
    note:
      "Dulce de leche, guava, strawberry, pineapple, Nutella, peanut butter, chocolate, and vanilla.",
  },
];

const cakeEventOptions = [
  { value: "birthday", label: "Birthday" },
  { value: "baby-shower", label: "Baby shower" },
  { value: "graduation", label: "Graduation" },
  { value: "wedding-shower", label: "Wedding or shower" },
  { value: "other", label: "Other celebration" },
];

const cakeSizeOptions = [
  { value: "1-inch-test", label: '1" (test)', price: 0.1, serves: "Test checkout size" },
  { value: "6-inch", label: '6"', price: 65, serves: "Serves 8-12" },
  { value: "8-inch", label: '8"', price: 75, serves: "Serves 12-18" },
  { value: "10-inch", label: '10"', price: 85, serves: "Serves 20-28" },
];

const cakeFlavorOptions = [
  { value: "yellow", label: "Yellow" },
  { value: "chocolate", label: "Chocolate" },
  { value: "marble", label: "Marble" },
  { value: "red-velvet", label: "Red velvet" },
  { value: "dominican-cake", label: "Dominican cake" },
  { value: "tres-leches", label: "Tres leches" },
];

const cakeFillingOptions = [
  { value: "none", label: "No filling" },
  { value: "dulce-de-leche", label: "Dulce de leche" },
  { value: "guava", label: "Guava" },
  { value: "pineapple", label: "Pineapple" },
  { value: "strawberry", label: "Strawberry" },
  { value: "nutella", label: "Nutella" },
];

const cakeFrostingOptions = [
  { value: "meringue", label: "Meringue frosting" },
  { value: "whipped-icing", label: "Whipped icing frosting" },
];

const cakeColorOptions = [
  { value: "white", label: "White" },
  { value: "pink", label: "Pink" },
  { value: "yellow", label: "Yellow" },
  { value: "gold", label: "Gold" },
  { value: "green", label: "Green" },
  { value: "blue", label: "Blue" },
];

const defaultCakeOrder = {
  eventType: "birthday",
  cakeSize: "8-inch",
  flavor: "yellow",
  filling: "dulce-de-leche",
  extraFilling: "none",
  frosting: "meringue",
  outsideColor: "white",
  pickupDate: "",
  pickupTime: "",
  inscription: "",
  customerName: "",
  phone: "",
  email: "",
  notes: "",
};

const cupcakeFlavorOptions = [
  { value: "yellow", label: "Yellow" },
  { value: "chocolate", label: "Chocolate" },
  { value: "marble", label: "Marble" },
  { value: "red-velvet", label: "Red velvet" },
  { value: "dominican-cake", label: "Dominican cake" },
  { value: "tres-leches", label: "Tres leches" },
];

const defaultCupcakeOrder = {
  quantity: "12",
  flavor: "yellow",
  filling: "none",
  outsideColor: "white",
  pickupDate: "",
  pickupTime: "",
  customerName: "",
  phone: "",
  email: "",
  notes: "",
};

const getLocalDateInputValue = (date = new Date(), offsetDays = 0) => {
  const localDate = new Date(date);
  localDate.setDate(localDate.getDate() + offsetDays);
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
  return localDate.toISOString().slice(0, 10);
};

const findOption = (options, value) =>
  options.find((option) => option.value === value) ?? options[0];

const getCakeTotal = (order) => {
  const size = findOption(cakeSizeOptions, order.cakeSize);
  const extraFillingCharge = order.extraFilling && order.extraFilling !== "none" ? 10 : 0;

  return {
    basePrice: size.price,
    extraFillingCharge,
    total: size.price + extraFillingCharge,
  };
};

const getCupcakeTotal = (order) => {
  const quantity = Math.max(1, Number(order.quantity) || 0);
  const basePricePerCupcake = 3.5;
  const fillingPricePerCupcake = order.filling && order.filling !== "none" ? 0.5 : 0;

  return {
    quantity,
    basePricePerCupcake,
    fillingPricePerCupcake,
    baseTotal: quantity * basePricePerCupcake,
    fillingTotal: quantity * fillingPricePerCupcake,
    total: quantity * (basePricePerCupcake + fillingPricePerCupcake),
  };
};

const formatPickupTime = (value) => {
  if (!value) {
    return "Choose a time";
  }

  const [hoursText = "0", minutesText = "00"] = value.split(":");
  const hours = Number(hoursText);
  const minutes = minutesText.padStart(2, "0");
  const suffix = hours >= 12 ? "PM" : "AM";
  const normalizedHours = hours % 12 || 12;
  return `${normalizedHours}:${minutes} ${suffix}`;
};

const isCakeOrderPath = (pathname = "") =>
  pathname === "/cake-order" || pathname.endsWith("/cake-order.html");

const isCakeOrderReadyForPayment = (order) =>
  Boolean(
    order.pickupDate &&
      order.pickupTime &&
      order.customerName.trim() &&
      order.phone.trim() &&
      order.email.trim(),
  );

const isCupcakeOrderReadyForPayment = (order) =>
  Boolean(
    (Number(order.quantity) || 0) > 0 &&
      order.pickupDate &&
      order.pickupTime &&
      order.customerName.trim() &&
      order.phone.trim() &&
      order.email.trim(),
  );

const buildCakePaymentPayload = (order) => ({
  orderType: "cake",
  order,
});

const buildCupcakePaymentPayload = (order) => ({
  orderType: "cupcake",
  order,
});

const requestCheckoutLink = async (payload) => {
  const response = await fetch("/api/create-square-payment-link", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const rawBody = await response.text();
  let data = {};
  try {
    data = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    data = {};
  }

  if (!response.ok || !data.checkoutUrl) {
    throw new Error(
      data.error ||
        rawBody ||
        "Unable to start Square checkout right now.",
    );
  }

  return data.checkoutUrl;
};

const saveCheckoutReceipt = (payload) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const snapshot = {
      orderType: payload.orderType,
      order: payload.order,
      submittedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(checkoutReceiptStorageKey, JSON.stringify(snapshot));
  } catch {
    // Ignore storage failures and continue checkout.
  }
};

const readCheckoutReceipt = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(checkoutReceiptStorageKey);
    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue);
    const orderType = parsedValue?.orderType;
    const order = parsedValue?.order;
    if (!order || (orderType !== "cake" && orderType !== "cupcake")) {
      return null;
    }

    return {
      orderType,
      order,
      submittedAt: parsedValue?.submittedAt || "",
    };
  } catch {
    return null;
  }
};

const formatSubmittedAt = (submittedAt) => {
  if (!submittedAt) {
    return "Just now";
  }

  const date = new Date(submittedAt);
  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const buildCakeReceiptRows = (order, submittedAt) => {
  const size = findOption(cakeSizeOptions, order.cakeSize);
  const flavor = findOption(cakeFlavorOptions, order.flavor);
  const filling = findOption(cakeFillingOptions, order.filling);
  const extraFilling = findOption(cakeFillingOptions, order.extraFilling);
  const frosting = findOption(cakeFrostingOptions, order.frosting);
  const outsideColor = findOption(cakeColorOptions, order.outsideColor);
  const pricing = getCakeTotal(order);

  return [
    ["Order type", "Custom cake"],
    ["Submitted", formatSubmittedAt(submittedAt)],
    ["Name", order.customerName || "Not provided"],
    ["Phone", order.phone || "Not provided"],
    ["Email", order.email || "Not provided"],
    ["Pickup date", order.pickupDate || "Not selected"],
    ["Pickup time", formatPickupTime(order.pickupTime)],
    ["Cake size", size.label],
    ["Flavor", flavor.label],
    ["Included filling", filling.label],
    [
      "Extra filling",
      extraFilling.value === "none" ? "No extra filling" : `${extraFilling.label} (+$10)`,
    ],
    ["Frosting", frosting.label],
    ["Outside color", outsideColor.label],
    ["Cake message", order.inscription || "No message"],
    ["Estimated paid total", `$${pricing.total.toFixed(2)}`],
  ];
};

const buildCupcakeReceiptRows = (order, submittedAt) => {
  const flavor = findOption(cupcakeFlavorOptions, order.flavor);
  const filling = findOption(cakeFillingOptions, order.filling);
  const outsideColor = findOption(cakeColorOptions, order.outsideColor);
  const pricing = getCupcakeTotal(order);

  return [
    ["Order type", "Custom cupcakes"],
    ["Submitted", formatSubmittedAt(submittedAt)],
    ["Name", order.customerName || "Not provided"],
    ["Phone", order.phone || "Not provided"],
    ["Email", order.email || "Not provided"],
    ["Pickup date", order.pickupDate || "Not selected"],
    ["Pickup time", formatPickupTime(order.pickupTime)],
    ["Quantity", String(pricing.quantity)],
    ["Flavor", flavor.label],
    [
      "Filling",
      filling.value === "none" ? "No filling" : `${filling.label} (+$0.50 each)`,
    ],
    ["Cupcake color", outsideColor.label],
    ["Estimated paid total", `$${pricing.total.toFixed(2)}`],
  ];
};

function App() {
  const isCakeOrderPage =
    typeof window !== "undefined" && isCakeOrderPath(window.location.pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const nextScrollY = window.scrollY;
      const isScrollingDown = nextScrollY > lastScrollY;

      setHeaderHidden(isScrollingDown && nextScrollY > 90);

      if (isScrollingDown && menuOpen) {
        setMenuOpen(false);
      }

      lastScrollY = nextScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [menuOpen]);

  useEffect(() => {
    document.title = isCakeOrderPage
      ? "Custom Orders | Angie's Cafe & Bakery"
      : "Angie's Cafe & Bakery | Metuchen, NJ";
  }, [isCakeOrderPage]);

  const activeNavLinks = isCakeOrderPage ? orderNavLinks : homeNavLinks;

  return (
    <>
      <SiteHeader
        headerHidden={headerHidden}
        menuOpen={menuOpen}
        navLinks={activeNavLinks}
        closeMenu={closeMenu}
        toggleMenu={() => setMenuOpen((open) => !open)}
      />
      {isCakeOrderPage ? <CakeOrderPage /> : <HomePage />}
      <SiteFooter />
    </>
  );
}

function SiteHeader({ headerHidden, menuOpen, navLinks, closeMenu, toggleMenu }) {
  return (
    <header
      className={`site-header${menuOpen ? " menu-open" : ""}${headerHidden ? " header-hidden" : ""}`}
    >
      <a
        className="brand"
        href={homeHref}
        onClick={closeMenu}
        aria-label="Angie's Cafe and Bakery home"
      >
        <img className="brand-logo" src="/images/brand/angies-logo.svg" alt="" />
      </a>

      <button
        className="nav-toggle"
        type="button"
        aria-expanded={menuOpen}
        aria-controls="site-nav"
        aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        onClick={toggleMenu}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav className="site-nav" id="site-nav">
        {navLinks.map((link) => (
          <a key={link.href} href={link.href} onClick={closeMenu}>
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

function HomePage() {
  return (
    <main id="top">
      <section className="section-shell front-hero section-space">
        <div className="hero-stage">
          <figure className="hero-photo-card hero-photo-card-hero">
            <img loading="lazy" src={heroPhoto.src} alt={heroPhoto.alt} />
            <figcaption className="hero-overlay">
              <p className="eyebrow">Angie's Cafe & Bakery</p>
              <h1>Custom cakes, coffee, empanadas, and Dominican comfort food in Metuchen.</h1>
              <p className="hero-text">
                Visit Angie's on Amboy Avenue for breakfast, lunch, bakery
                favorites, and custom cakes.
              </p>
            </figcaption>
          </figure>

          <div className="hero-actions">
            <a
              className="hero-button hero-button-primary"
              href={mapsHref}
              target="_blank"
              rel="noreferrer"
            >
              Visit Us
            </a>
            <a className="hero-button hero-button-secondary" href={phoneHref}>
              Contact Us
            </a>
          </div>
        </div>
      </section>

      <section className="section-shell section-space highlight-section" aria-label="Business highlights">
        <div className="highlight-strip">
          {highlightCards.map((card) => (
            <article className="highlight-card" key={card.title}>
              <p className="eyebrow">{card.kicker}</p>
              <h3>{card.title}</h3>
              {card.detail ? <p className="highlight-card-detail">{card.detail}</p> : null}
              <p>{card.description}</p>
              {card.actionLabel ? (
                <a className="highlight-card-action" href={card.actionHref}>
                  {card.actionLabel}
                </a>
              ) : null}
            </article>
          ))}
        </div>

        <ReviewCarousel items={reviewHighlights} />
      </section>

      <section className="section-shell section-space" id="custom-cakes">
        <div className="gallery-split">
          <div className="section-heading">
            <p className="eyebrow">Custom cakes</p>
            <h2>Cake designs for birthdays, baby showers, and special events.</h2>
            <p>
              Browse custom cakes for birthdays, baby showers, and other
              special events.
            </p>
          </div>

          <aside className="gallery-note">
            <p className="gallery-note-title">Order a cake 🎂</p>
            <p>
              Choose your size, flavor, and pickup details on a separate custom
              order page built for cakes and cupcakes.
            </p>
            <a className="text-link" href={cakeOrderHref}>
              Start your cake order
            </a>
            <p className="gallery-note-support">
              Prefer to order by phone? <a href={phoneHref}>(732) 515-9515</a>
            </p>
          </aside>
        </div>

        <PhotoGrid items={customCakePhotos} />

        <aside className="gallery-note gallery-note-wide">
          <p className="gallery-note-title">Order a cake 🎂</p>
          <p>
            See a cake style you love? Place your custom cake order now and
            let Angie create something beautiful for your celebration.
          </p>
          <a className="text-link" href={cakeOrderHref}>
            Start your cake order
          </a>
          <p className="gallery-note-support">
            Prefer to order by phone? <a href={phoneHref}>(732) 515-9515</a>
          </p>
        </aside>
      </section>

      <section className="section-shell section-space" id="pastries">
        <div className="pastry-showcase">
          <div className="section-heading compact-menu-heading">
            <p className="eyebrow">Pastries</p>
            <h2>Dessert happiness from the bakery case.</h2>
            <p>
              Stop in for a sweet treat, from tres leches and flan to
              cupcakes, puddings, and cake slices.
            </p>
          </div>

          <figure className="pastry-photo-card">
            <img
              loading="lazy"
              src="/images/restaurant/pastry-case.webp"
              alt="Pastry case at Angie's filled with bakery desserts and sweets"
            />
          </figure>
        </div>

        <div className="menu-grid compact-menu-grid">
          {pastryMenus.map((menu) => (
            <MenuCard key={menu.title} {...menu} />
          ))}
        </div>

        <div className="service-note">
          <p>
            Pastry selection can vary by day, so call ahead for current
            availability and whole-dessert specials.
          </p>
        </div>
      </section>

      <section className="section-shell section-space" id="menu">
        <SavorySlideshow items={savoryFoodPhotos} />

        <div className="section-heading kitchen-heading">
          <p className="eyebrow">Lunch and dinner</p>
          <h2>Dominican favorites, sandwiches, wraps, and sides.</h2>
          <p>
            Beyond the bakery counter, Angie's also serves hearty plates and
            all-day comfort food, with regular service Wednesday through
            Monday from 11 AM to 7 PM, Sunday from 9 AM to 3 PM, and Tuesday
            closed.
          </p>
        </div>

        <div className="menu-grid kitchen-grid">
          {kitchenMenus.map((menu) => (
            <MenuCard key={menu.title} {...menu} />
          ))}
        </div>

        <div className="service-note">
          <p>
            Please call ahead for daily availability and bakery specials.
          </p>
        </div>
      </section>

      <section className="section-shell section-space" id="empanadas">
        <div className="empanada-showcase">
          <article className="empanada-panel">
            <p className="eyebrow">Fresh to order</p>
            <h2>Empanadas are made fresh for every order.</h2>
            <p>
              Pick your favorite filling and enjoy a hot, crispy empanada made
              fresh to order, perfect for a quick bite or a full box to share.
            </p>
            <p className="price-note">Add cheese for $0.50 more.</p>
          </article>

          <figure className="empanada-photo-card">
            <img
              loading="lazy"
              src={empanadaPhoto.src}
              alt={empanadaPhoto.alt}
            />
          </figure>
        </div>

        <div className="empanada-options-card">
          <p className="eyebrow">Choose a filling</p>
          <div className="empanada-options-grid">
            {empanadas.map((item) => (
              <article className="empanada-option" key={item.name}>
                <span className="empanada-option-name">{item.name}</span>
                <span className="empanada-option-price">{item.price}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell section-space" id="drinks">
        <div className="section-heading compact-menu-heading">
          <p className="eyebrow">Drinks</p>
          <h2>From hot coffee to tropical fruit juice.</h2>
          <p>
            The drink counter covers everyday coffee staples, sweeter iced
            options, hot chocolate, tea, and fruit-forward house juices.
          </p>
        </div>

        <div className="menu-grid compact-menu-grid">
          {drinkMenus.map((menu) => (
            <MenuCard key={menu.title} {...menu} />
          ))}
        </div>
      </section>
    </main>
  );
}

function CakeOrderPage() {
  const paymentStatus =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("payment")
      : null;
  const orderTypeFromQuery =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("type")
      : null;
  const [checkoutReceipt, setCheckoutReceipt] = useState(null);

  useEffect(() => {
    if (paymentStatus !== "success") {
      return;
    }

    setCheckoutReceipt(readCheckoutReceipt());
  }, [paymentStatus]);

  const completedOrderType =
    checkoutReceipt?.orderType ||
    (orderTypeFromQuery === "cupcake" ? "cupcake" : "cake");
  const receiptRows = checkoutReceipt
    ? completedOrderType === "cupcake"
      ? buildCupcakeReceiptRows(checkoutReceipt.order, checkoutReceipt.submittedAt)
      : buildCakeReceiptRows(checkoutReceipt.order, checkoutReceipt.submittedAt)
    : [
        ["Order type", completedOrderType === "cupcake" ? "Custom cupcakes" : "Custom cake"],
        ["Status", "Paid"],
        [
          "Order details",
          "Saved details were not found on this device, but payment and notification emails were sent.",
        ],
      ];

  return (
    <main className="order-page-main" id="top">
      <section className="section-shell section-space top-section">
        <div className="order-page-banner">
          <p className="eyebrow">Custom orders</p>
          <h1>Order a custom cake or cupcakes made for your celebration.</h1>
          <p className="order-page-copy">
            Celebrate with a custom cake or cupcakes made to match your event,
            your colors, and your favorite flavors, with simple pickup details
            and secure checkout in one place.
          </p>

          <div className="hero-actions order-page-actions">
            <a
              className="hero-button hero-button-primary"
              href={`${cakeOrderHref}?type=cake#cake-order`}
            >
              Custom Cake
            </a>
            <a
              className="hero-button hero-button-secondary"
              href={`${cakeOrderHref}?type=cupcake#cake-order`}
            >
              Custom Cupcakes
            </a>
            <a className="hero-button hero-button-secondary" href={homeHref}>
              Back to homepage
            </a>
          </div>
        </div>
      </section>

      {paymentStatus === "success" ? (
        <section className="section-shell section-space order-status-section" id="payment-status">
          <div className="service-note order-status-note post-checkout-note">
            <p className="eyebrow">Order confirmed</p>
            <h2>
              {completedOrderType === "cupcake"
                ? "Thanks for your cupcake order."
                : "Thanks for your cake order."}
            </h2>
            <p>
              Payment was received successfully. A confirmation email was sent to the
              customer, and a full order copy was sent to the bakery owner.
            </p>

            <dl className="post-checkout-details" aria-label="Order details">
              {receiptRows.map(([label, value]) => (
                <div className="post-checkout-row" key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>

            <div className="hero-actions post-checkout-actions">
              <a className="hero-button hero-button-primary" href={homeHref}>
                Go back to home
              </a>
            </div>
          </div>
        </section>
      ) : null}

      <section className="section-shell section-space">
        <CustomOrderSection />
      </section>
    </main>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer section-shell" id="visit">
      <div className="section-heading footer-heading">
        <p className="eyebrow">Visit Angie&apos;s</p>
        <h2>Stop by for coffee, lunch, or a quick box of empanadas.</h2>
      </div>

      <div className="footer-grid">
        <article className="footer-card footer-card-compact">
          <h3>Location</h3>
          <p>275 Amboy Ave, Metuchen, NJ 08840</p>
          <div className="mini-map-frame">
            <iframe
              title="Map showing Angie's Cafe and Bakery in Metuchen, New Jersey"
              src="https://www.google.com/maps?q=275+Amboy+Ave,+Metuchen,+NJ+08840&z=15&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <p className="map-link">
            <a href={mapsHref} target="_blank" rel="noreferrer">
              Open in maps
            </a>
          </p>
        </article>

        <article className="footer-card footer-card-hours">
          <h3>Hours</h3>
          <ul className="hours-list">
            {businessHours.map(([day, hours]) => (
              <li key={day}>
                <span>{day}</span>
                <strong>{hours}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="footer-card footer-card-compact">
          <h3>Contact</h3>
          <p>
            <a href="tel:+17325159515">(732) 515-9515</a>
          </p>
          <p>
            <a
              href="https://www.instagram.com/angiesmetuchen/"
              target="_blank"
              rel="noreferrer"
            >
              @angiesmetuchen
            </a>
          </p>
        </article>
      </div>
    </footer>
  );
}

function MenuCard({ title, items, accent = false, noteLabel, note }) {
  return (
    <article className={`menu-card${accent ? " accent-card" : ""}`}>
      <h3>{title}</h3>
      <ul>
        {items.map(([name, price]) => (
          <li key={`${title}-${name}`}>
            <span>{name}</span>
            <strong>{price}</strong>
          </li>
        ))}
      </ul>
      {note ? (
        <p className="menu-card-note">
          <strong>{noteLabel}</strong> {note}
        </p>
      ) : null}
    </article>
  );
}

function CustomOrderSection() {
  const [orderType, setOrderType] = useState(() => {
    if (typeof window === "undefined") {
      return "cake";
    }

    const type = new URLSearchParams(window.location.search).get("type");
    return type === "cupcake" ? "cupcake" : "cake";
  });

  return (
    <section className="cake-checkout" id="cake-order" aria-labelledby="custom-order-title">
      <div className="custom-order-toggle" role="tablist" aria-label="Choose custom order type">
        <button
          className={`order-toggle-button${orderType === "cake" ? " is-active" : ""}`}
          type="button"
          role="tab"
          aria-selected={orderType === "cake"}
          onClick={() => setOrderType("cake")}
        >
          Custom Cake
        </button>
        <button
          className={`order-toggle-button${orderType === "cupcake" ? " is-active" : ""}`}
          type="button"
          role="tab"
          aria-selected={orderType === "cupcake"}
          onClick={() => setOrderType("cupcake")}
        >
          Custom Cupcakes
        </button>
      </div>

      {orderType === "cake" ? <CakeOrderSection /> : <CupcakeOrderSection />}
    </section>
  );
}

function CakeOrderSection() {
  const [order, setOrder] = useState(defaultCakeOrder);
  const orderDate = getLocalDateInputValue();
  const minPickupDate = getLocalDateInputValue(new Date(), 2);

  const updateOrder = (event) => {
    const { name, value } = event.target;
    const nextValue =
      name === "pickupDate" && value && value < minPickupDate ? minPickupDate : value;

    setOrder((current) => ({
      ...current,
      [name]: nextValue,
    }));
  };

  const event = findOption(cakeEventOptions, order.eventType);
  const size = findOption(cakeSizeOptions, order.cakeSize);
  const flavor = findOption(cakeFlavorOptions, order.flavor);
  const filling = findOption(cakeFillingOptions, order.filling);
  const extraFilling = findOption(cakeFillingOptions, order.extraFilling);
  const frosting = findOption(cakeFrostingOptions, order.frosting);
  const outsideColor = findOption(cakeColorOptions, order.outsideColor);
  const pricing = getCakeTotal(order);
  const readyForPayment = isCakeOrderReadyForPayment(order);

  return (
    <div className="cake-checkout-shell" role="tabpanel" aria-labelledby="custom-order-title">
      <article className="cake-builder-card">
        <p className="eyebrow">Custom cake</p>
        <figure className="order-form-photo-card">
          <img
            loading="lazy"
            src={customOrderCakePhoto}
            alt="White birthday cake with Happy Birthday written on top"
          />
        </figure>
        <h3 id="custom-order-title">Start your custom cake checkout.</h3>
        <p className="cake-builder-copy">
          Choose your cake details, enter your pickup information, and review
          everything in one place before you confirm the order. Cake orders
          must be placed at least two days in advance.
        </p>

        <div className="cake-step-strip" aria-label="Cake ordering steps">
          <article className="cake-step">
            <span>1</span>
            <strong>Choose your cake</strong>
            <p>Pick the size, flavor, filling, and colors.</p>
          </article>
          <article className="cake-step">
            <span>2</span>
            <strong>Add pickup details</strong>
            <p>Tell Angie when you need it and what to write on top.</p>
          </article>
          <article className="cake-step">
            <span>3</span>
            <strong>Review your order</strong>
            <p>Check the summary before you place order.</p>
          </article>
        </div>

        <form
          className="cake-order-form"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="form-grid">
            <label className="form-field">
              <span>Occasion</span>
              <select name="eventType" value={order.eventType} onChange={updateOrder}>
                {cakeEventOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

              <label className="form-field">
                <span>Cake size</span>
                <select name="cakeSize" value={order.cakeSize} onChange={updateOrder}>
                  {cakeSizeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <small>{size.serves} · Base price ${size.price}</small>
              </label>

              <label className="form-field">
                <span>Cake flavor</span>
                <select name="flavor" value={order.flavor} onChange={updateOrder}>
                  {cakeFlavorOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-field">
                <span>Frosting</span>
                <select name="frosting" value={order.frosting} onChange={updateOrder}>
                  {cakeFrostingOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-field">
                <span>Included filling</span>
                <select name="filling" value={order.filling} onChange={updateOrder}>
                  {cakeFillingOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <small>One filling is included.</small>
              </label>

              <label className="form-field">
                <span>Extra filling</span>
                <select
                  name="extraFilling"
                  value={order.extraFilling}
                  onChange={updateOrder}
                >
                  <option value="none">No extra filling</option>
                  {cakeFillingOptions
                    .filter((option) => option.value !== "none")
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </select>
                <small>Add a second filling for $10 more.</small>
              </label>

              <label className="form-field form-field-full">
                <span>Outside cake color</span>
                <select
                  name="outsideColor"
                  value={order.outsideColor}
                  onChange={updateOrder}
                >
                  {cakeColorOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <small>Choose from blue, green, yellow, pink, white, or gold.</small>
              </label>

              <label className="form-field">
                <span>Pickup date</span>
                <input
                  min={minPickupDate}
                  name="pickupDate"
                  type="date"
                  value={order.pickupDate}
                  onChange={updateOrder}
                />
                <small>Minimum 2 days notice required.</small>
              </label>

              <label className="form-field">
                <span>Pickup time</span>
                <input
                  name="pickupTime"
                  type="time"
                  value={order.pickupTime}
                  onChange={updateOrder}
                />
              </label>

              <label className="form-field form-field-full">
                <span>Message on cake</span>
                <input
                  name="inscription"
                  placeholder="Happy Birthday Maria"
                  type="text"
                  value={order.inscription}
                  onChange={updateOrder}
                />
              </label>

              <label className="form-field">
                <span>Your name</span>
                <input
                  name="customerName"
                  placeholder="Full name"
                  type="text"
                  value={order.customerName}
                  onChange={updateOrder}
                />
              </label>

              <label className="form-field">
                <span>Phone number</span>
                <input
                  name="phone"
                  placeholder="(732) 555-1234"
                  type="tel"
                  value={order.phone}
                  onChange={updateOrder}
                />
              </label>

              <label className="form-field form-field-full">
                <span>Email</span>
                <input
                  name="email"
                  placeholder="name@email.com"
                  type="email"
                  value={order.email}
                  onChange={updateOrder}
                />
              </label>

              <label className="form-field form-field-full">
                <span>Design notes</span>
                <textarea
                  name="notes"
                  placeholder="Theme, writing request, or any special instruction."
                  rows="4"
                  value={order.notes}
                  onChange={updateOrder}
                />
              </label>
          </div>
        </form>
      </article>

      <aside className="cake-summary-card">
        <p className="eyebrow">Order summary</p>
        <h3>Your cake request</h3>

          <section className="cake-summary-group" aria-label="Cake details">
            <h4>Cake</h4>
            <dl>
              <div>
                <dt>Order date</dt>
                <dd>{orderDate}</dd>
              </div>
              <div>
                <dt>Occasion</dt>
                <dd>{event.label}</dd>
              </div>
              <div>
                <dt>Size</dt>
                <dd>{size.label}</dd>
              </div>
              <div>
                <dt>Serving guide</dt>
                <dd>{size.serves}</dd>
              </div>
              <div>
                <dt>Base price</dt>
                <dd>${pricing.basePrice}</dd>
              </div>
              <div>
                <dt>Flavor</dt>
                <dd>{flavor.label}</dd>
              </div>
              <div>
                <dt>Frosting</dt>
                <dd>{frosting.label}</dd>
              </div>
              <div>
                <dt>Included filling</dt>
                <dd>{filling.label}</dd>
              </div>
              <div>
                <dt>Extra filling</dt>
                <dd>
                  {extraFilling.value === "none"
                    ? "No extra filling"
                    : `${extraFilling.label} (+$10)`}
                </dd>
              </div>
              <div>
                <dt>Outside color</dt>
                <dd>{outsideColor.label}</dd>
              </div>
              <div>
                <dt>Estimated total</dt>
                <dd>${pricing.total}</dd>
              </div>
            </dl>
          </section>

          <section className="cake-summary-group" aria-label="Pickup details">
            <h4>Pickup</h4>
            <dl>
              <div>
                <dt>Date</dt>
                <dd>{order.pickupDate || "Choose a pickup date"}</dd>
              </div>
              <div>
                <dt>Time</dt>
                <dd>{formatPickupTime(order.pickupTime)}</dd>
              </div>
              <div>
                <dt>Message</dt>
                <dd>{order.inscription || "No cake message yet"}</dd>
              </div>
            </dl>
          </section>

          <section className="cake-summary-group" aria-label="Contact information">
            <h4>Contact</h4>
            <dl>
              <div>
                <dt>Name</dt>
                <dd>{order.customerName || "Add your name"}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{order.phone || "Add a phone number"}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{order.email || "Add an email"}</dd>
              </div>
            </dl>
          </section>

        <div className="cake-summary-note">
          <p>
            Full payment is collected through Square at checkout. Cake orders
            still need at least two days notice and remain subject to
            availability review.
          </p>
          <p>
            Cake sizes are 6&quot; for $65, 8&quot; for $75, and 10&quot; for $85.
            One filling is included, and an extra filling adds $10.
            </p>
            <p>{order.notes || "Add notes if you have a theme, writing request, or other special instruction."}</p>
          </div>

        <div className="cake-summary-actions">
          <SquareCheckoutButton
            payload={buildCakePaymentPayload(order)}
            disabled={!readyForPayment}
            label={`Pay $${pricing.total.toFixed(2)} with Square`}
          />
        </div>
      </aside>
    </div>
  );
}

function CupcakeOrderSection() {
  const [order, setOrder] = useState(defaultCupcakeOrder);
  const orderDate = getLocalDateInputValue();
  const minPickupDate = getLocalDateInputValue(new Date(), 2);

  const updateOrder = (event) => {
    const { name, value } = event.target;
    let nextValue = value;

    if (name === "pickupDate" && value && value < minPickupDate) {
      nextValue = minPickupDate;
    }

    if (name === "quantity") {
      nextValue = value.replace(/[^\d]/g, "");
    }

    setOrder((current) => ({
      ...current,
      [name]: nextValue,
    }));
  };

  const flavor = findOption(cupcakeFlavorOptions, order.flavor);
  const filling = findOption(cakeFillingOptions, order.filling);
  const outsideColor = findOption(cakeColorOptions, order.outsideColor);
  const pricing = getCupcakeTotal(order);
  const readyForPayment = isCupcakeOrderReadyForPayment(order);

  return (
    <div className="cake-checkout-shell" role="tabpanel" aria-labelledby="custom-order-title">
      <article className="cake-builder-card">
        <p className="eyebrow">Custom cupcakes</p>
        <figure className="order-form-photo-card">
          <img
            loading="lazy"
            src={customOrderCupcakePhoto}
            alt="Vanilla cupcakes with swirled frosting on a marble surface"
          />
        </figure>
        <h3 id="custom-order-title">Start your custom cupcake order.</h3>
        <p className="cake-builder-copy">
          Choose the cupcake quantity, flavor, filling, and pickup details in
          one simple flow. Cupcakes are $3.50 each, and filling is $0.50 more
          per cupcake. Custom cupcake orders also need at least two days
          notice.
        </p>

        <div className="cake-step-strip" aria-label="Cupcake ordering steps">
          <article className="cake-step">
            <span>1</span>
            <strong>Choose your cupcakes</strong>
            <p>Pick the quantity, flavor, filling, and cupcake color.</p>
          </article>
          <article className="cake-step">
            <span>2</span>
            <strong>Add pickup details</strong>
            <p>Choose the pickup date and time for your order.</p>
          </article>
          <article className="cake-step">
            <span>3</span>
            <strong>Review your request</strong>
            <p>Check the summary before you place order.</p>
          </article>
        </div>

        <form
          className="cake-order-form"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="form-grid">
            <label className="form-field">
              <span>Quantity</span>
              <input
                min="1"
                name="quantity"
                placeholder="12"
                type="number"
                value={order.quantity}
                onChange={updateOrder}
              />
              <small>$3.50 per cupcake.</small>
            </label>

            <label className="form-field">
              <span>Cupcake flavor</span>
              <select name="flavor" value={order.flavor} onChange={updateOrder}>
                {cupcakeFlavorOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Filling</span>
              <select name="filling" value={order.filling} onChange={updateOrder}>
                {cakeFillingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <small>One filling choice applies to every cupcake. Add $0.50 each.</small>
            </label>

            <label className="form-field form-field-full">
              <span>Cupcake color</span>
              <select
                name="outsideColor"
                value={order.outsideColor}
                onChange={updateOrder}
              >
                {cakeColorOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <small>Choose from blue, green, yellow, pink, white, or gold.</small>
            </label>

            <label className="form-field">
              <span>Pickup date</span>
              <input
                min={minPickupDate}
                name="pickupDate"
                type="date"
                value={order.pickupDate}
                onChange={updateOrder}
              />
              <small>Minimum 2 days notice required.</small>
            </label>

            <label className="form-field">
              <span>Pickup time</span>
              <input
                name="pickupTime"
                type="time"
                value={order.pickupTime}
                onChange={updateOrder}
              />
            </label>

            <label className="form-field">
              <span>Your name</span>
              <input
                name="customerName"
                placeholder="Full name"
                type="text"
                value={order.customerName}
                onChange={updateOrder}
              />
            </label>

            <label className="form-field">
              <span>Phone number</span>
              <input
                name="phone"
                placeholder="(732) 555-1234"
                type="tel"
                value={order.phone}
                onChange={updateOrder}
              />
            </label>

            <label className="form-field form-field-full">
              <span>Email</span>
              <input
                name="email"
                placeholder="name@email.com"
                type="email"
                value={order.email}
                onChange={updateOrder}
              />
            </label>

            <label className="form-field form-field-full">
              <span>Design notes</span>
              <textarea
                name="notes"
                placeholder="Theme, topper ideas, color placement, or other special instruction."
                rows="4"
                value={order.notes}
                onChange={updateOrder}
              />
            </label>
          </div>
        </form>
      </article>

      <aside className="cake-summary-card">
        <p className="eyebrow">Order summary</p>
        <h3>Your cupcake request</h3>

        <section className="cake-summary-group" aria-label="Cupcake details">
          <h4>Cupcakes</h4>
          <dl>
            <div>
              <dt>Order date</dt>
              <dd>{orderDate}</dd>
            </div>
            <div>
              <dt>Quantity</dt>
              <dd>{pricing.quantity}</dd>
            </div>
            <div>
              <dt>Flavor</dt>
              <dd>{flavor.label}</dd>
            </div>
            <div>
              <dt>Price each</dt>
              <dd>$3.50</dd>
            </div>
            <div>
              <dt>Filling</dt>
              <dd>
                {filling.value === "none" ? "No filling" : `${filling.label} (+$0.50 each)`}
              </dd>
            </div>
            <div>
              <dt>Cupcake color</dt>
              <dd>{outsideColor.label}</dd>
            </div>
            <div>
              <dt>Estimated total</dt>
              <dd>${pricing.total.toFixed(2)}</dd>
            </div>
          </dl>
        </section>

        <section className="cake-summary-group" aria-label="Pickup details">
          <h4>Pickup</h4>
          <dl>
            <div>
              <dt>Date</dt>
              <dd>{order.pickupDate || "Choose a pickup date"}</dd>
            </div>
            <div>
              <dt>Time</dt>
              <dd>{formatPickupTime(order.pickupTime)}</dd>
            </div>
          </dl>
        </section>

        <section className="cake-summary-group" aria-label="Contact information">
          <h4>Contact</h4>
          <dl>
            <div>
              <dt>Name</dt>
              <dd>{order.customerName || "Add your name"}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{order.phone || "Add a phone number"}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{order.email || "Add an email"}</dd>
            </div>
          </dl>
        </section>

        <div className="cake-summary-note">
          <p>
            Full payment is collected through Square at checkout. Cupcake
            orders also need at least two days notice and remain subject to
            availability review.
          </p>
          <p>
            Cupcakes are $3.50 each no matter the amount. If you add filling,
            it applies to every cupcake and adds $0.50 per cupcake.
          </p>
          <p>{order.notes || "Add notes if you have a theme, topper idea, or other special instruction."}</p>
        </div>

        <div className="cake-summary-actions">
          <SquareCheckoutButton
            payload={buildCupcakePaymentPayload(order)}
            disabled={!readyForPayment}
            label={`Pay $${pricing.total.toFixed(2)} with Square`}
          />
        </div>
      </aside>
    </div>
  );
}

function SquareCheckoutButton({ payload, disabled, label }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCheckout = async () => {
    if (disabled || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const checkoutUrl = await requestCheckoutLink(payload);
      saveCheckoutReceipt(payload);
      window.location.assign(checkoutUrl);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to start Square checkout right now.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="payment-button-wrap">
      <button
        className="hero-button hero-button-primary payment-button"
        type="button"
        onClick={handleCheckout}
        disabled={disabled || isSubmitting}
      >
        {isSubmitting ? "Opening Square checkout..." : label}
      </button>
      {errorMessage ? <p className="payment-error">{errorMessage}</p> : null}
    </div>
  );
}

function PhotoGrid({ items, className = "" }) {
  return (
    <div className={`photo-grid${className ? ` ${className}` : ""}`}>
      {items.map((item) => (
        <figure
          className={`photo-card photo-card-${item.size ?? "standard"}`}
          key={item.src}
        >
          <img loading="lazy" src={item.src} alt={item.alt} />
          <figcaption>
            <span className="photo-tag">{item.tag}</span>
            <p>{item.caption}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function SavorySlideshow({ items }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % items.length);
    }, 4200);

    return () => {
      window.clearInterval(timer);
    };
  }, [items.length]);

  const activeItem = items[activeIndex];

  const showPrevious = () => {
    setActiveIndex((index) => (index - 1 + items.length) % items.length);
  };

  const showNext = () => {
    setActiveIndex((index) => (index + 1) % items.length);
  };

  return (
    <section className="savory-slideshow" aria-label="Savory food slideshow">
      <div className="savory-slideshow-frame">
        <button
          className="slideshow-control slideshow-control-prev"
          type="button"
          onClick={showPrevious}
          aria-label="Show previous savory food photo"
        >
          ‹
        </button>

        <figure className="savory-slide" key={activeItem.src}>
          <img loading="lazy" src={activeItem.src} alt={activeItem.alt} />
          <figcaption className="savory-slide-caption">
            <span className="photo-tag">{activeItem.tag}</span>
            <p>{activeItem.caption}</p>
          </figcaption>
        </figure>

        <button
          className="slideshow-control slideshow-control-next"
          type="button"
          onClick={showNext}
          aria-label="Show next savory food photo"
        >
          ›
        </button>
      </div>

      <div className="slideshow-dots" aria-label="Savory food slides">
        {items.map((item, index) => (
          <button
            key={item.src}
            className={`slideshow-dot${index === activeIndex ? " is-active" : ""}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Show savory food slide ${index + 1}`}
            aria-pressed={index === activeIndex}
          />
        ))}
      </div>
    </section>
  );
}

function ReviewCarousel({ items }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % items.length);
    }, 5200);

    return () => {
      window.clearInterval(timer);
    };
  }, [items.length]);

  const activeItem = items[activeIndex];

  const showPrevious = () => {
    setActiveIndex((index) => (index - 1 + items.length) % items.length);
  };

  const showNext = () => {
    setActiveIndex((index) => (index + 1) % items.length);
  };

  return (
    <section className="review-carousel" aria-label="Customer review highlights">
      <div className="review-carousel-frame">
        <button
          className="slideshow-control slideshow-control-prev"
          type="button"
          onClick={showPrevious}
          aria-label="Show previous review highlight"
        >
          ‹
        </button>

        <article className="review-slide" key={activeItem.title}>
          <p className="eyebrow">Google review highlights</p>
          <div className="review-stars" aria-hidden="true">
            <span>★★★★★</span>
            <small>See what guests are saying</small>
          </div>
          <h3>{activeItem.title}</h3>
          <p>{activeItem.text}</p>
          <a
            className="text-link"
            href={googleReviewsHref}
            target="_blank"
            rel="noreferrer"
          >
            Read reviews on Google
          </a>
        </article>

        <button
          className="slideshow-control slideshow-control-next"
          type="button"
          onClick={showNext}
          aria-label="Show next review highlight"
        >
          ›
        </button>
      </div>

      <div className="slideshow-dots" aria-label="Review highlight slides">
        {items.map((item, index) => (
          <button
            key={item.title}
            className={`slideshow-dot${index === activeIndex ? " is-active" : ""}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Show review highlight ${index + 1}`}
            aria-pressed={index === activeIndex}
          />
        ))}
      </div>
    </section>
  );
}

export default App;
