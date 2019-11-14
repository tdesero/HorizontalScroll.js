class HorizontalScroll {

  // constructor
  constructor(options = {}) {

    //input options
    this.defaults = {
      outerContainer: '.horizontal-scroll-height-container',
      innerContainer: '.horizontal-scroll-container',
      wrapper: '.horizontal-scroll-wrapper',
      item: '.horizontal-item',
      speed: 1,
      moveInOut: true, // boolean
    };

    this.options = Object.assign({}, this.defaults, options);

    //DOM elements
    this.outerContainers = this.getElements(this.options.outerContainer);
    this.innerContainers = this.getElements(this.options.innerContainer);
    this.wrappers = this.getElements(this.options.wrapper);
    this.items = []; // will be DOM elements ...

    //sizes
    this.wrapperWidths = [];
    this.outerHeights = [];
    this.offsets = [];
    this.windowHeight = window.innerHeight || document.documentElement.clientHeight;
    this.windowWidth = window.innerWidth || document.documentElement.clientWidth;

    //sticky
    this.isSticky = [];

    //bindings
    this.handleScroll = this.handleScroll.bind(this);
    this.updateSizes = this.updateSizes.bind(this);
    this.requestFrame = this.requestFrame.bind(this);

    this.start();

  }

  start() {
    //had to wrap scrollY in a function because otherwise scrollY would be 0
    //if the document is at about 11000+ pixels scrollY at window load.
    //seems that it hasn't the right value at this point.
    //but later when used in the loop it is right. super strange.
    let scrollY = () => (window.scrollY || window.pageYOffset);

    this.updateSizes();

    const throttledUpdate = this.requestFrame(this.updateSizes);
    window.addEventListener('resize', throttledUpdate);

    //attach sticky elements at top or bottom
    //TODO: check if this loop really is needed here or if this could be done somewhere else...
    for (let i = 0; i < this.wrappers.length; i++) {
      if ((this.offsets[i] + this.outerHeights[i] - this.windowHeight) < scrollY()) {
        this.dropStickyBottom(i);
      } else {
        this.dropStickyTop(i);
      }
    }
  }

  setSizes() {

    //loop through all HorizontalScroll setups
    for (let i = 0; i < this.wrappers.length; i++) {

      //get items inside wrapper
      this.items[i] = this.wrappers[i].querySelectorAll(this.options.item);

      //wrapperWidth start value will change
      this.wrapperWidths[i] = 0;
      this.isSticky[i] = false;

      //setting the wrapper width to include all items
      //atm it probably need some normalize.css to erase all margins etc...
      for (let j = 0; j < this.items[i].length; j++) {
        this.wrapperWidths[i] += this.items[i][j].offsetWidth;
      }

      this.outerHeights[i] =
          (this.wrapperWidths[i] - this.windowWidth) / this.options.speed + this.windowHeight;

      this.wrappers[i].style.width = this.wrapperWidths[i] + 'px';
      this.outerContainers[i].style.height = this.outerHeights[i] + 'px';
      this.outerContainers[i].style.position = 'relative'; //position has to be set relative

      //EventListener for each setup
      const throttledScrollHandler = this.requestFrame(this.handleScroll);
      document.addEventListener('scroll', () => throttledScrollHandler(i), { passive: true });
    }
  }

  getOffsetTop(element) {
    let top = 0;
    do {
      top += element.offsetTop || 0;
      element = element.offsetParent;
    } while (element);

    return top;
  }

  getContainerOffsets() {
    for (let i = 0; i < this.outerContainers.length; i++) {
      this.offsets[i] = this.getOffsetTop(this.outerContainers[i]);
    }
  }

  updateSizes() {
    this.setSizes();
    this.getContainerOffsets();
    this.windowHeight = window.innerHeight || document.documentElement.clientHeight;
    this.windowWidth = window.innerWidth || document.documentElement.clientWidth;
  }

  handleScroll(i) {
    let scrollY = window.scrollY || window.pageYOffset;
    let top = this.offsets[i] - scrollY;
    let shouldStick = top < 0 && (-1 * top) < this.outerHeights[i] - this.windowHeight;

    //transform value either not limited or with limits. see this.options.moveInOut
    let transform = this.options.moveInOut ?
        (top * this.options.speed) :
        Math.min(Math.max(
          parseInt(top * this.options.speed),
          (this.wrapperWidths[i] - this.windowWidth) * -1), 0);

    if (top < this.windowHeight && (-1 * top) < this.outerHeights[i]) {
      this.wrappers[i].style.transform = 'translate3D(' + transform + 'px, 0, 0)';
    }

    if (!this.isSticky[i] && shouldStick) {
      this.makeSticky(i);
      this.isSticky[i] = true;
    } else if (this.isSticky[i] && !shouldStick) {
      if (top < 0) {
        this.dropStickyBottom(i);
      } else {
        this.dropStickyTop(i);
      }

      this.isSticky[i] = false;
    }

  }

  makeSticky(i) {
    this.innerContainers[i].style.position = 'fixed';
    this.innerContainers[i].style.top = 0;
    this.innerContainers[i].style.bottom = ''; // erase value
    this.innerContainers[i].style.width = '100%';
  }

  dropStickyTop(i) {
    this.innerContainers[i].style.position = ''; // erase value
    this.innerContainers[i].style.top = ''; // erase value
    this.innerContainers[i].style.bottom = ''; // erase value
    this.innerContainers[i].style.width = ''; // erase value
  }

  dropStickyBottom(i) {
    this.innerContainers[i].style.position = 'absolute';
    this.innerContainers[i].style.top = ''; // erase value
    this.innerContainers[i].style.bottom = '0';
    this.innerContainers[i].style.width = '100%'; // erase value
  }

  //helper
  getElements(string) {
    return document.querySelectorAll(string);
  }

  //utility requestanimationframe throttle function
  requestFrame (callback) {
    let wait = false;
    let args;
    return function () {
        if (!wait) {
          wait = true;
          args = arguments;
          requestAnimationFrame(function () {
              callback.apply(null, args);
              wait = false;
            });
        }
      };
  }

}
