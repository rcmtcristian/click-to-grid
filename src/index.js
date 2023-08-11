import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import Lenis from "@studio-freight/lenis";

gsap.registerPlugin(ScrollTrigger, Flip);

class Item {
  // DOM elements
  DOM = {
    // main element (.item)
    el: null,
    // caption (.item__caption)
    caption: null,
    // imageWrap (.item__image-wrap)
    imageWrap: null,
    // image (.item__image)
    image: null,
    // imageInner (.item__image > .item__image-inner)
    imageInner: null,
    // title (.item__caption-title)
    title: null,
    // titleInner (.item__caption-title > .oh__inner)
    titleInner: null,
    // number (.item__caption-number)
    number: null,
    // numberInner (.item__caption-number > .oh__inner)
    numberInner: null,
    // description (.item__caption-description)
    description: null
  };

  /**
   * Constructor.
   * @param {Element} DOM_el - main element (.item)
   */
  constructor(DOM_el) {
    this.DOM.el = DOM_el;
    this.DOM.caption = this.DOM.el.querySelector(".item__caption");
    this.DOM.imageWrap = this.DOM.el.querySelector(".item__image-wrap");
    this.DOM.image = this.DOM.el.querySelector(".item__image");
    this.DOM.imageInner = this.DOM.image.querySelector(".item__image-inner");
    this.DOM.title = this.DOM.el.querySelector(".item__caption-title");
    this.DOM.titleInner = this.DOM.title.querySelector(".oh__inner");
    this.DOM.number = this.DOM.el.querySelector(".item__caption-number");
    this.DOM.numberInner = this.DOM.number.querySelector(".oh__inner");
    this.DOM.description = this.DOM.el.querySelector(
      ".item__caption-description"
    );
  }
}

const imagesLoaded = require("imagesloaded");

/**
 * Preload images
 * @param {String} selector - Selector/scope from where images need to be preloaded. Default is 'img'
 */
const preloadImages = (selector = "img") => {
  return new Promise((resolve) => {
    imagesLoaded(
      document.querySelectorAll(selector),
      { background: true },
      resolve
    );
  });
};

/**
 * Checks if an element is in the viewport
 * @param {Element} elem - the element to be checked
 */
const isInViewport = (elem) => {
  var bounding = elem.getBoundingClientRect();
  return (
    ((bounding.bottom >= 0 &&
      bounding.bottom <=
        (window.innerHeight || document.documentElement.clientHeight)) ||
      (bounding.top >= 0 &&
        bounding.top <=
          (window.innerHeight || document.documentElement.clientHeight))) &&
    ((bounding.right >= 0 &&
      bounding.right <=
        (window.innerWidth || document.documentElement.clientWidth)) ||
      (bounding.left >= 0 &&
        bounding.left <=
          (window.innerWidth || document.documentElement.clientWidth)))
  );
};

// Item instances (Item is the .content > figure.item)
const items = [];
[...document.querySelectorAll(".item")].forEach((item) => {
  items.push(new Item(item));
});

// Toggle grid view
const switchCtrl = {
  grid: document.querySelector(".switch__button--grid"),
  list: document.querySelector(".switch__button--list")
};

// Text element that moves horizontally as we scroll
const heading = {
  el: document.querySelector(".heading"),
  main: document.querySelector(".heading .heading__main")
};

// Placeholder for the grid items (.item__image). We'll use the gsap FLIP plugin to move the "".item .item__image" inside the grid element
const grid = document.querySelector(".grid");

// Lenis smooth scrolling
let lenis;

// Initialize Lenis smooth scrolling
const initSmoothScrolling = () => {
  lenis = new Lenis({
    lerp: 0.1,
    smooth: true
  });
  const scrollFn = (time) => {
    lenis.raf(time);
    requestAnimationFrame(scrollFn);
  };
  requestAnimationFrame(scrollFn);
};

// ScrollTrigger animations for scrolling
const animateOnScroll = () => {
  for (const item of items) {
    gsap.set(item.DOM.imageInner, { transformOrigin: "50% 0%" });

    gsap
      .timeline({
        scrollTrigger: {
          trigger: item.DOM.el,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      })
      .addLabel("start", 0)
      // scale up the inner image
      .to(
        item.DOM.imageInner,
        {
          ease: "none",
          scaleY: 2.4,
          scaleX: 1.2,
          opacity: 0
        },
        "start"
      )
      // translate the title and number
      .to(
        [item.DOM.title, item.DOM.number],
        {
          ease: "none",
          yPercent: -150
        },
        "start"
      )
      // translate the inner title/number (overflow is hidden so they get hidden)
      .to(
        [item.DOM.titleInner, item.DOM.numberInner],
        {
          scrollTrigger: {
            trigger: item.DOM.el,
            start: "top bottom",
            end: "top 20%",
            scrub: true
          },
          ease: "expo.in",
          yPercent: -100
        },
        "start"
      );
  }

  // animate the heading element as we scroll (horizontally)
  let windowWidth = window.innerWidth;
  gsap.to(heading.main, {
    scrollTrigger: {
      start: 0,
      end: "max",
      scrub: true
    },
    ease: "none",
    x: () =>
      -heading.main.offsetWidth -
      ((13.25 * windowWidth) / 100 +
        (25 * windowWidth) / 100 +
        windowWidth / 100) +
      windowWidth
  });
};

const showGrid = () => {
  document.body.classList.add("grid-open");

  // stop the smooth scrolling
  lenis.stop();

  // get the DOM elements that we'll work with
  const DOM = getDOMElements();

  // Disable active ScrollTrigger instances
  let Alltrigger = ScrollTrigger.getAll();
  for (let i = 0; i < Alltrigger.length; i++) {
    Alltrigger[i].disable(false);
  }

  // Use gsap flip for the animation
  // save the current state of the images
  const flipstate = Flip.getState(DOM.allImages);
  // put them inside the .grid element
  grid.append(...DOM.allImages);

  // gsap stagger properties
  const staggerConfig = {
    grid: "auto",
    // the order goes from the first item inside the viewport
    from: DOM.inViewportItems.length
      ? items.indexOf(DOM.inViewportItems[0])
      : 0,
    amount: 0.06
  };

  // Flip it
  Flip.from(flipstate, {
    duration: 0.7,
    ease: "power3.inOut",
    scale: true,
    stagger: staggerConfig
  })
    // Also reset scales applied to the inner images (items inside the viewport)
    .to(
      DOM.inViewportImagesInner,
      {
        duration: 0.7,
        ease: "power3.inOut",
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        stagger: staggerConfig
      },
      0
    )
    // For the items outside of the viewport, simply reset the scales with no animation
    /* The `.set()` method from the GSAP library is used to set initial values for CSS properties of one or more elements. */
    .set(
      DOM.outViewportImagesInner,
      {
        scaleX: 1,
        scaleY: 1,
        opacity: 1
      },
      0
    )
    // hide the titles and numbers inner elments by translating them up
    .to(
      [DOM.inViewportTitlesInner, DOM.inViewportNumbersInner],
      {
        duration: 0.4,
        ease: "power3.inOut",
        yPercent: -100,
        opacity: 0
      },
      0
    )
    // hide description
    .to(
      DOM.inViewportDescription,
      {
        duration: 0.4,
        ease: "power3.inOut",
        opacity: 0
      },
      0
    )
    // For all the items outside the viewport, simply set opacity to 0
    .set(
      [
        DOM.outViewportTitlesInner,
        DOM.outViewportNumbersInner,
        DOM.outViewportDescription
      ],
      {
        opacity: 0
      },
      0
    )
    // hide the heading element
    .to(
      heading.el,
      {
        duration: 0.7,
        ease: "power3.inOut",
        yPercent: -100,
        x: -100
      },
      0
    );
};
/**
 * The `hideGrid` function removes a CSS class from the body element, restarts smooth scrolling, moves images to their original positions, enables ScrollTrigger instances, and animates various elements  using the Flip library.
 */

const hideGrid = () => {
  document.body.classList.remove("grid-open");

  // restart the smooth scrolling
  lenis.start();

  // get the DOM elements that we'll work with
  const DOM = getDOMElements();

  const flipstate = Flip.getState([DOM.allImages, DOM.allImagesInner], {
    props: "opacity"
  });

  DOM.allImages.forEach((image, pos) => {
    items[pos].DOM.imageWrap.appendChild(image);
  });

  // Enable ScrollTrigger instances
  let Alltrigger = ScrollTrigger.getAll();
  for (let i = 0; i < Alltrigger.length; i++) {
    Alltrigger[i].enable(false);
  }

  Flip.from(flipstate, {
    duration: 0.7,
    ease: "power3.inOut",
    scale: true
  })
    .to(
      [
        DOM.inViewportTitlesInner,
        DOM.inViewportNumbersInner,
        DOM.inViewportDescription
      ],
      {
        duration: 0.4,
        ease: "power3.inOut",
        startAt: { opacity: 0 },
        opacity: 1
      },
      0
    )
    .set(
      [
        DOM.outViewportTitlesInner,
        DOM.outViewportNumbersInner,
        DOM.outViewportDescription
      ],
      {
        opacity: 1
      },
      0
    )
    .to(
      heading.el,
      {
        duration: 0.7,
        ease: "power3.inOut",
        yPercent: 0,
        x: 0
      },
      0
    );
};

// Returns some DOM elements that are needed for showing/hiding the grid
const getDOMElements = () => {
  const inViewportItems = items.filter((item) => isInViewport(item.DOM.el));
  const outViewportItems = items.filter((n) => !inViewportItems.includes(n));

  // Get all the images in the carousel

 return {
    allImages: items.map((item) => item.DOM.image),
    allImagesInner: items.map((item) => item.DOM.imageInner),
    inViewportItems: inViewportItems,
    outViewportItems: outViewportItems,
    inViewportImagesInner: inViewportItems.map((item) => item.DOM.imageInner),
    outViewportImagesInner: outViewportItems.map((item) => item.DOM.imageInner),
    inViewportDescription: inViewportItems.map((item) => item.DOM.description),
    outViewportDescription: outViewportItems.map(
      (item) => item.DOM.description
    ),
    inViewportTitlesInner: inViewportItems.map((item) => item.DOM.titleInner),
    outViewportTitlesInner: outViewportItems.map((item) => item.DOM.titleInner),
    inViewportNumbersInner: inViewportItems.map((item) => item.DOM.numberInner),
    outViewportNumbersInner: outViewportItems.map(
      (item) => item.DOM.numberInner
    )
  };
};

// Initialize the events
const initEvents = () => {
  // show grid ctrl click
  switchCtrl.grid.addEventListener("click", () => {
    switchCtrl.grid.classList.add(
      "switch__button--hidden",
      "switch__button--current"
    );
    switchCtrl.list.classList.remove(
      "switch__button--hidden",
      "switch__button--current"
    );
    showGrid();
  });
  // hide grid ctrl click
  switchCtrl.list.addEventListener("click", () => {
    switchCtrl.list.classList.add(
      "switch__button--hidden",
      "switch__button--current"
    );
    switchCtrl.grid.classList.remove(
      "switch__button--hidden",
      "switch__button--current"
    );
    hideGrid();
  });
};

// Preload images
preloadImages(".item__image-inner").then(() => {
  document.body.classList.remove("loading");

  initSmoothScrolling();
  animateOnScroll();
  initEvents();
});
