var body = document.querySelector('body');
var hamburger = document.querySelector('#hamburger');
var dragContainer = document.querySelector('.drag-container');
var itemContainers = [].slice.call(document.querySelectorAll('.board-column-content'));
var columnGrids = [];
var boardGrid;
var grid;

// Init the column grids so we can drag those items around.
itemContainers.forEach(function (container) {
  grid = new Muuri(container, {
    items: '.board-item',
    dragEnabled: true,
    sortData: {
        id: function (item, element) {
          return parseFloat(element.children[0].id);
        }
    },
    dragSort: function () {
      return columnGrids;
    },
    dragContainer: dragContainer,
    dragAutoScroll: {
      targets: (item) => {
        return [
          { element: window, priority: 0 },
          { element: item.getGrid().getElement().parentNode, priority: 1 },
        ];
      }
    },
  })
  .on('dragInit', function (item) {
    item.getElement().style.width = item.getWidth() + 'px';
    item.getElement().style.height = item.getHeight() + 'px';
    item.getElement().classList.add("dragging");
    console.log(item)
    
  })
  .on('dragReleaseEnd', function (item) {
    item.getElement().style.width = '';
    item.getElement().style.height = '';
    item.getGrid().refreshItems([item]);
    item.getElement().classList.remove("dragging");
  })
  .on('layoutStart', function () {
    boardGrid.refreshItems().layout();
  })
  .on('click', function() {
    item.getElement().classList.add("selected");
  })

  columnGrids.push(grid);
});

hamburger.addEventListener("click", toggleBuckets);



// Init board grid so we can drag those columns around.
boardGrid = new Muuri('.board');

function toggleBuckets(){
  if (body.getAttribute("data-menu-state") == "closed"){
    body.setAttribute("data-menu-state", "open");
  } else {
    body.setAttribute("data-menu-state", "closed");
  }
}


function toggleView(){
  mode = body.getAttribute("data-folder-view");
  if (mode == "list"){
    body.setAttribute("data-folder-view", "grid");
  } else {
    body.setAttribute("data-folder-view", "list");
  }
  grid.refreshItems();
  grid.layout();
}