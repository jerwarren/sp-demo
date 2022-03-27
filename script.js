var body = document.querySelector('body');
var folders = document.querySelector('#toggle-folders');
var foldersContainer = document.querySelector('#menu');
var dragContainer = document.querySelector('.drag-container');
var itemContainers = [].slice.call(document.querySelectorAll('.board-column-content'));

var container = document.querySelector(".board-column-content");
var columnGrids = [];
var boardGrid;
var grid;

var boardNotes = document.querySelector('.board-column-content');

var localData;

var noteEditor = document.getElementById("note-editor");
var folderEditor = document.getElementById("folder-editor");

var searchField = document.querySelector("#search input");

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
  if (body.getAttribute("data-folder-state") == "closed"){
    body.setAttribute("data-folder-state", "open");
  } else {
    body.setAttribute("data-folder-state", "closed");
  }
}

function toggleSearch(){
  if (body.getAttribute("data-search-state") == "closed"){
    body.setAttribute("data-search-state", "open");
  } else {
    clearQuery();
    body.setAttribute("data-search-state", "closed");
  }
}

function toggleMenu(){
  if (body.getAttribute("data-menu-state") == "closed"){
    body.setAttribute("data-menu-state", "open");
    body.dataset.editing = "true";

  } else {
    body.setAttribute("data-menu-state", "closed");
    body.dataset.editing = "false";
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
    localData.folders.forEach(function(folder){
      console.log(folder)
      addFolder(folder.id, folder.name);
    })

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
      
      localData.folders.forEach(function(folder){
        if (folder.id != 0)
        addFolder(folder.id, folder.name);
      })
    })
  }

  toggleLoader();
}

function saveAllData(){
  console.log("saving localstorage")
  grid.refreshItems()
  grid.layout();

  window.localStorage.setItem("data", JSON.stringify(localData));

}

function addNoteToGrid(note, noteText=null){
  rightNow = Date.now();
  body.dataset.editing = "false";
  console.log("saving note");
  
  if (noteEditor.dataset.editingNote == "true") {
    existingNote = document.querySelector('.board-item[data-id="'+noteEditor.dataset.noteId+'"]');
    existingNote.dataset.text = document.getElementById("canvas").value;
    existingNote.querySelector(".board-item-content textarea").value = document.getElementById("canvas").value;
    noteEditor.classList.remove("visible");
    saveNote(noteEditor.dataset.noteId);

    
    
    saveAllData();

  } else {
    if (noteEditor.dataset.newNote == "true"){
      console.log("new note");
      
      note = {
        "id": noteEditor.dataset.noteId,
        "folderId": body.dataset.currentFolder,
        "createdAt": noteEditor.dataset.noteId,
        "updatedAt": rightNow,
        "text": document.getElementById("canvas").value
      }
      console.log(note)
      var newNote = document.createElement('div');
      noteEditor.classList.remove("visible");
      newNote.dataset = note;
      newNote.dataset.id = note.id;
      newNote.dataset.folderId = note.folderId;
      newNote.dataset.createdAt = note.createdAt;
      newNote.dataset.updatedAt = note.updatedAt;
      newNote.dataset.text = note.text;
      //newNote.setAttribute("ondragstart","drag(event)");
  
      newNote.setAttribute("class", "board-item");
      newNote.setAttribute("onclick", "selectNote('"+note.id+"')");
  
      //<div data-id="1" class="board-item"><div class="board-item-content">text here</div></div>
      
      newNote.innerHTML = `<div class="board-item-content"><textarea disabled=disabled>${note.text}</textarea></div><div class="note-buttons"><button class="edit-note" onclick="editNote(this.parentNode.parentNode.dataset.id)"><span class="material-icons">edit</span></button> <button class="delete-note" onclick="deleteNote(this.parentNode.parentNode.dataset.id)"><span class="material-icons">delete</span></button></div>`;
      
  
      grid.add(newNote);
      grid.refreshItems()
      grid.layout();

    
    } else {
      console.log("not a new note")
      if (noteText !== null){
        console.log("we have note text, so it's imported")
        note = {
          "id": rightNow,
          "folderId": body.dataset.currentFolder,
          "createdAt": rightNow,
          "updatedAt": rightNow,
          "text": noteText
        }
      } else {
        console.log("this note is loaded from data")
      }
  
      var newNote = document.createElement('div');
      noteEditor.classList.remove("visible");
      newNote.dataset = note;
      newNote.dataset.id = note.id;
      newNote.dataset.folderId = note.folderId;
      newNote.dataset.createdAt = note.createdAt;
      newNote.dataset.updatedAt = note.updatedAt;
      newNote.dataset.text = note.text;
      //newNote.setAttribute("ondragstart","drag(event)");
  
      newNote.setAttribute("class", "board-item");
      newNote.setAttribute("onclick", "selectNote('"+note.id+"')");
  
      //<div data-id="1" class="board-item"><div class="board-item-content">text here</div></div>
      
      newNote.innerHTML = `<div class="board-item-content"><textarea disabled=disabled>${note.text}</textarea></div><div class="note-buttons"><button class="edit-note" onclick="editNote(this.parentNode.parentNode.dataset.id)"><span class="material-icons">edit</span></button> <button class="delete-note" onclick="deleteNote(this.parentNode.parentNode.dataset.id)"><span class="material-icons">delete</span></button></div>`;
      
  
      grid.add(newNote);
      grid.refreshItems()
      grid.layout();
    }
    body.dataset.editing = "false"
  }
  
  
  
  
  
  
}

function selectNote(noteId){
  if (document.querySelector(".board-item[data-id='"+noteId+"']")){
    document.querySelector(".board-item[data-id='"+noteId+"']").classList.toggle("selected");
    grid.refreshItems()
    grid.layout();
  }
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

function createNewNote(){
  noteEditor.classList.add("visible");
  noteEditor.dataset.newNote = true;
  noteEditor.dataset.editingNote = false;
  body.dataset.editing = "true";
  noteEditor.dataset.noteId = Date.now();
  document.querySelector("#canvas").value="";
  document.querySelector("#word-count").innerHTML = "0 words";

}

function editNote(noteId) {
  document.querySelector("#canvas").dataset.noteId = noteId;
  noteEditor.dataset.noteId = noteId;
  noteEditor.dataset.newNote = false;
  noteEditor.dataset.editingNote = true;

  localData["notes"].forEach(function(item, i){
    if (item.id == noteId){
      document.querySelector("#canvas").value = item.text;
      countWords();
    }
  })

  noteEditor.classList.add("visible");
  body.dataset.editing = "true";
}

function saveNote(noteId){
  noteFound = false;
  noteIndex = null;
  
  localData["notes"].forEach(function(item, index){
    if (item.id == noteId){
      noteFound = true;
      noteIndex = index;
    }
  })

  if (noteFound){
    localData["notes"][noteIndex].text = document.querySelector("#canvas").value;
    localData["notes"][noteIndex].updatedAt = Date.now;
    saveAllData();
  } else {

  }
}

function deleteNote(noteId){
  console.log("delete noite")
  foundNote = null;

  localData["notes"].forEach(function(item, index){
    
    if (item.id == noteId){
      foundNote = index;
      localData["notes"].splice(index, 1);
      existingNote = document.querySelector('.board-item[data-id="'+noteId+'"]');
      itemToDelete = grid.getItem(existingNote);
      grid.remove([itemToDelete], {removeElements: true});
      grid.refreshItems();
      grid.layout();

      saveAllData();
    }
  })
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

function searchQuery() {
  grid.filter(function (item) {
    re = new RegExp(`\\b${searchField.value}\\b`, 'gi');
    return item.getElement().dataset.text.match(re);
  });
}

function filterCategory(categoryId, categoryName){
  document.querySelector(".header .label").innerHTML=categoryName;
  body.dataset.currentFolder = categoryId;
  grid.filter(function (item) {
    return item.getElement().dataset.folderId.match(categoryId);
  });
  toggleBuckets();
}
 
function clearQuery() {
  searchField.value = "";
  grid.filter(function (item) {
    return item.getElement().getAttribute("data-text");
  });
}

function addFolder(folderId=null, folderName=null){
  if(folderId == null){
    folderId = Date.now();
    folderName = "New Folder";
    editFolder(folderId);
    localData.folders.push({id: folderId, name: folderName, sort: 'age', order: 'data', direction: 'ascending'})
  } else {
    folderName = folderName;
  }

  foldersContainer.innerHTML = foldersContainer.innerHTML + `
  <div data-id="${folderId}" data-name="${folderName}" class="folder" onclick="filterCategory('${folderId}', '${folderName}')">
    <span class="material-icons">folder</span>
    <br>
    <span class="folder-name">${folderName}</span>
  </div>`;  
  
}

function closeEditor(){
  body.dataset.editing = false;
  document.querySelectorAll(".editor").forEach(function(item, idx){
    item.classList.remove("visible");
  })
}

function editFolder(folderId){
  folderName = "New Folder";
  if (typeof folderId == "undefined"){
    folderId = body.dataset.currentFolder;
    toggleMenu();
  }
  folderName = "New Folder";
  localData["folders"].forEach(function(item, i){
    console.log(item)
    if (item.id == folderId){
      folderName = item.name;
    }
  })
  document.querySelector("#folder-name").value = folderName;
  body.dataset.editing = true;
  folderEditor.dataset.folderId = folderId;
  folderEditor.classList.add("visible");

}

function renameFolder(folderId, folderName){
  console.log("renaming folder")
  console.log(folderName)
  localData["folders"].forEach(function(item, i){
    if (item.id == folderId){
      console.log(item)
      localData["folders"][i].name = folderName;
      document.querySelector(".folder[data-id='"+folderId+"'] .folder-name").innerHTML = item.name;
      saveAllData();
    }
    folderEditor.classList.add("visible");
  })
}

function enterFolder(folderId){

}

// drag and drop stuff
function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
  ev.preventDefault();
  var data = ev.dataTransfer.getData("text");
  console.log(ev.target.dataset.id);
}