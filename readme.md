##basic usage

```html
document.addEventListener('DOMContentLoaded', function() {
  var test = new HorizontalScroll({ speed: 2, moveInOut: false });
})
```

##options

```html
{
  outerContainer: '.horizontal-scroll-height-container',
  innerContainer: '.horizontal-scroll-container',
  wrapper: '.horizontal-scroll-wrapper',
  item: '.horizontal-item',
  speed: 1,
  moveInOut: true, // boolean
};
```

##required html markup

```html
<!-- example -->
<div class="horizontal-scroll-height-container">
  <div class="horizontal-scroll-container">
    <div class="horizontal-scroll-wrapper">
      <div class="horizontal-item">
        <span>Horizontal Item 1</span>
      </div>
      <div class="horizontal-item">
        <span>Horizontal Item 2</span>
      </div>
      <div class="horizontal-item">
        <span>Horizontal Item 3</span>
      </div>
    </div>
  </div>
</div>
<!-- example end -->
```
