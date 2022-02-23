var body = document.querySelector('body');
var folders = document.querySelector('#folders');
var dragContainer = document.querySelector('.drag-container');
var itemContainers = [].slice.call(document.querySelectorAll('.board-column-content'));

var container = document.querySelector(".board-column-content");
var columnGrids = [];
var boardGrid;
var grid;

var boardNotes = document.querySelector('.board-column-content');

var localData;

var editor = document.getElementById("editor");

// vh units nonsense:
var vh = window.innerHeight * 0.01;

// Then we set the value in the --vh custom property to the root of the document
document.documentElement.style.setProperty('--vh', `${vh}px`);


folders.addEventListener("click", toggleBuckets);
// Init board grid so we can drag those columns around.
boardGrid = new Muuri('.board');
loadData();

function initGrid(){
  // Init the column grids so we can drag those items around.
  //itemContainers.forEach(function (container) {
    grid = new Muuri(container, {
      items: '.board-item',
      dragEnabled: false,
      sortData: {
        id: function (item, element) {
          console.log(grid.getElement(element).dataset);
          return parseFloat(element.dataset.id);
        },
        created: function (item, element) {
          return parseFloat(element.dataset.createdAt);
        },
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
  //});
}

function toggleBuckets(){
  if (body.getAttribute("data-menu-state") == "closed"){
    body.setAttribute("data-menu-state", "open");
  } else {
    body.setAttribute("data-menu-state", "closed");
  }
}

function toggleSearch(){
  if (body.getAttribute("data-search-state") == "closed"){
    body.setAttribute("data-search-state", "open");
  } else {
    body.setAttribute("data-search-state", "closed");
  }
}


function toggleView(){
  mode = body.getAttribute("data-folder-view");
  if (mode == "list"){
    body.setAttribute("data-folder-view", "grid");
  } else {
    body.setAttribute("data-folder-view", "list");
  }

  setTimeout(function(){
    grid.refreshItems();
    grid.layout();
  }, 200)
}

function toggleDirection(){
  direction = body.getAttribute("data-direction");
  if (direction == "asc"){
    sortdesc();
  } else {
    sortAsc();
  }
  grid.refreshItems();
  grid.layout();
}

function addItem(folderId=0) {

}

function loadData(){
  initGrid();
  if(localStorage.getItem("data")){
    console.log("we have localstorage");
    localData = JSON.parse(localStorage.getItem("data"));

    localData.notes.forEach(function(note){
      addNoteToGrid(note);
    });

  } else {
    console.log("we don't have localstorage");
    fetch("test-data.json")
    .then(function(response){
      return response.json()
    })
    .then(function(data){
      localData = data;
      localData.notes.forEach(function(note){
        addNoteToGrid(note);
      })
    })
  }
  toggleLoader();
}

function saveAllData(){
  grid.refreshItems()
  grid.layout();

  window.localStorage.setItem("data", JSON.stringify(localData));

}

function addNoteToGrid(note, noteText=null){
  if (!note){
    now = Date.now();
    if (noteText !== null){
      note = {
        "id": now,
        "folderId": "0",
        "createdAt": now,
        "updatedAt": now,
        "text": noteText
      }
    } else {
      note = {
        "id": now,
        "folderId": "0",
        "createdAt": now,
        "updatedAt": now,
        "text": document.getElementById("canvas").value
      }
    }
    localData.notes.push(note);
    localStorage.setItem("data", JSON.stringify(localData));
  }
  
  var newNote = document.createElement('div');
  editor.classList.remove("visible");
  newNote.dataset = note;
  newNote.dataset.id = note.id;
  newNote.dataset.folderId = note.folderId;
  newNote.dataset.createdAt = note.createdAt;
  newNote.dataset.updatedAt = note.updatedAt;
  newNote.dataset.text = note.text;

  newNote.setAttribute("class", "board-item");
  newNote.setAttribute("onclick", "selectNote('"+note.id+"')");

  //<div data-id="1" class="board-item"><div class="board-item-content">text here</div></div>
  
  newNote.innerHTML = `<div class="board-item-content"><textarea disabled=disabled>${note.text}</textarea></div><div class="note-buttons">edit delete</div>`;
  

  grid.add(newNote);

  //saveAllData();
}

function selectNote(noteId){
  document.querySelector(".board-item[data-id='"+noteId+"']").classList.toggle("selected");
  grid.refreshItems()
  grid.layout();

}

function sortAsc(){
  grid.sort("id");
  body.dataset.direction = "asc";
}

function sortdesc(){
  grid.sort("id:desc");
  body.dataset.direction = "desc";
}

function countWords() {
 
  // Get the input text value
  var text = document
      .getElementById("canvas").value;

  // Initialize the word counter
  var numWords = 0;

  // Loop through the text
  // and count spaces in it
  for (var i = 0; i < text.length; i++) {
      var currentCharacter = text[i];

      // Check if the character is a space
      if (currentCharacter == " ") {
          numWords += 1;
      }
  }

  // Add 1 to make the count equal to
  // the number of words
  // (count of words = count of spaces + 1)
  numWords += 1;

  // Display it as output
  document.getElementById("word-count")
      .innerHTML = numWords + " words";
}

function newNote(){
  editor.classList.add("visible");
  document.querySelector("#canvas").value="";
  document.querySelector("#word-count").innerHTML = "0 words";

}

function addNote(){

  var notes = [];

  boardNotes.querySelectorAll('.board-item').forEach(function(item, index){
    notes.push({
        "id": item.dataset.id,
        "text": item.dataset.text,
        "createdAt": item.dataset.createdAt,
        "updatedAt": item.dataset.updatedAt,
        "synced": item.dataset.synced,
        "folderId": 0,
        "folder_custom_order": 0
    })
  })
  saveAllData();
}

function importNotes(){
  importInput = document.querySelector("#file-import");

  importInput.onchange = e => { 

    // getting a hold of the file reference
    var file = e.target.files[0]; 
 
    // setting up the reader
    var reader = new FileReader();
    reader.readAsText(file,'UTF-8');
 
    // here we tell the reader what to do when it's done reading...
    reader.onload = readerEvent => {
       var content = readerEvent.target.result+""; // this is the content!
       newNotes = content.split("\n");
       console.log(newNotes)
       newNotes.forEach(function(item, index){
          if (item !== ""){
            addNoteToGrid(null, item);
          }
       })
    }
 
  }
  importInput.click();
}

function exportNotes() {
  string = "";
  localData.notes.forEach(function(item, index){
    string = string + "\n\n" + item.text;
  })

  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(string));
  element.setAttribute('download', "Shakespiranha-export");

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function toggleLoader(){
  setTimeout(function(){
    document.querySelector('#splash').classList.toggle("hide");
  },900);
}
 