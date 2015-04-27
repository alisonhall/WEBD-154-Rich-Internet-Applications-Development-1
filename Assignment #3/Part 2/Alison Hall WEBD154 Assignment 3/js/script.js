Parse.initialize("S4KPo6rwBwk16fNnreLk1Px3vST6jRmDk6k9fs5R", "bXvGBcQE0WpWl8FaNLwgI0zv6iOkT6b0D3b3DlQq");

var usernameField = document.getElementById("usernameField");
var passwordField = document.getElementById("passwordField");
var loginButton   = document.getElementById("loginButton");
var signupButton  = document.getElementById("signupButton");
var logoutButton  = document.getElementById("logoutButton");
var loginBlock    = document.getElementById('login');
var logoutBlock   = document.getElementById('logout');
var sectionTitlesBlock = document.getElementById('sectionTitles');

var welcomeBlock  = document.getElementById('welcomeMessage');
var welcomeText   = document.getElementById('message');

var bookmarkedJournals = document.getElementById('bookmarkedJournals');
var myJournalsDiv = document.getElementById('myJournalsDiv');
var newJournalButton = document.getElementById('newJournalButton');

var bookmarkedEntries = document.getElementById('bookmarkedEntries');
var myEntriesDiv = document.getElementById('myEntriesDiv');
var newEntryButton = document.getElementById('newEntryButton');

var newEntryDiv = document.getElementById('newEntryDiv');
var entryDataButton = document.getElementById('entryDataButton');


loginButton.addEventListener('click', loginHandler);
signupButton.addEventListener('click', signupHandler);
logoutButton.addEventListener('click', logoutHandler);

var JournalData = Parse.Object.extend("Journals");
var EntriesData = Parse.Object.extend("Entries");

var currentJournal;
var currentEntry;
var currentNumEntries;
var currentJournalIndex = 0;
var currentEntryIndex = 0;


// Handles the logging in
function loginHandler(){
	user.set("username", usernameField.value);
	user.set("password", passwordField.value);
	user.logIn({
		success:function (user){
			console.log("login worked");
			currentUser = Parse.User.current();
			loggedIn();
		}, 
		error: function (user, error){
			console.log("error "+ error.code);
		}
	});
}

// Handles the signing up
function signupHandler(){
	user.set("username", usernameField.value);
	user.set("password", passwordField.value);
	user.signUp(null, {
		success:function (user){
			console.log("signup worked");
			currentUser = Parse.User.current();
			loggedIn();
		}, 
		error: function (user, error){
			console.log("error "+ error.code);
		}
	});
}

// Handles the logging out
function logoutHandler(){
	Parse.User.logOut();
	currentUser = Parse.User.current();  // this will now be null
	loggedOutView();

	myJournalsDiv.innerHTML = "";
	newJournalButton.innerHTML = "";
	newEntryDiv.innerHTML = "";
	entryDataButton.innerHTML = "";
	myEntriesDiv.innerHTML = "";
	newEntryButton.innerHTML = "";
}

// Code to run once the user has logged in or signed up
function loggedIn(){
	loggedInView();

	var journalsRelation = user.relation("userJournals");
	var queryOfRelation = journalsRelation.query();
	queryOfRelation.descending("createdAt");
	queryOfRelation.find({
		success: function (results){
			for (var i=0; i<results.length; i++){
				var journalData = results[i];
				var journal = new Journal (journalData, i);
			}
			buildNewJournalButton();
		},
		error:function(error){
			alert("Something went wrong: error is " + error.message);
		}
	});
}

// Once logged in, hide the login fields and display message
function loggedInView(){
	loginBlock.classList.remove("shown");
	loginBlock.classList.add("hidden");
	welcomeMessage.classList.remove("hidden");
	welcomeMessage.classList.add("shown");
	welcomeText.textContent = "Welcome " + user.get("username");
	logoutBlock.classList.remove("hidden");
	logoutBlock.classList.add("shown");
	sectionTitlesBlock.classList.remove("hidden");
	sectionTitlesBlock.classList.add("shown");
}

// When not logged in, show the login fields
function loggedOutView(){
	loginBlock.classList.remove("hidden");
	loginBlock.classList.add("shown");
	welcomeMessage.classList.remove("shown");
	welcomeMessage.classList.add("hidden");
	logoutBlock.classList.remove("shown");
	logoutBlock.classList.add("hidden");
	sectionTitlesBlock.classList.remove("shown");
	sectionTitlesBlock.classList.add("hidden");
}

// Create the "Add Journal" button
function buildNewJournalButton(){
	var button = document.createElement("button");
	var buttonLabel = document.createTextNode("Add Journal");
	button.appendChild(buttonLabel);

	button.addEventListener('click', function(event){	
		var journalData = new JournalData ();
		var journalsRelation = user.relation("userJournals");
		var newJournalTitle = prompt("Enter the new journal's title.");
		currentJournalIndex = 0;
		currentEntryIndex = 0;

		journalData.save({
			journalTitle: newJournalTitle,
		}, 
		{
			success: function(results){
				console.log("Created new journal");
				journalsRelation.add(journalData);
				user.save(null, {
					success: function (results){
						refreshJournalsSection();
					},
					error:function(error){
						alert("Something went wrong: error is " + error.message);
					}
				});
			},
			error: function(error){
				console.log("Error creating new journal. Error: " + error);
			}
		});

	});
	newJournalButton.appendChild(button);
}

// Create the "Add Entry" button
function buildNewEntryButton(journalSelf, entrySelf){
	var button = document.createElement("button");
	var buttonLabel = document.createTextNode("Add Entry");
	button.appendChild(buttonLabel);

	button.addEventListener('click', function(event){	
		var entriesData = new EntriesData ();
		var entriesRelation = currentJournal.data.relation("userEntries");
		parseInt(currentNumEntries, 10);
		currentNumEntries++;
		var newEntryTitle = "Entry" + currentNumEntries;
		newEntryTitle.toString();
		
		entriesData.save({
			entryTitle: newEntryTitle,
			entryText: ""
		}, 
		{
			success: function(results){
				console.log("Created new entry");
				entriesRelation.add(entriesData);
				currentEntry = entrySelf;
				currentEntryIndex = 0;
				currentJournal.data.save(null, {
					success: function (results){
						refreshEntriesSection(journalSelf, entrySelf);
					},
					error:function(error){
						alert("Something went wrong: error is " + error.message);
					}
				});
			},
			error: function(error){
				console.log("Error creating new entry. Error: " + error);
			}
		});

	});
	newEntryButton.appendChild(button);
}

// After a journal has been created, delete and recreate the journal list
function refreshJournalsSection(){
	console.log("refreshJournalSection function called")

	var journalsRelation = user.relation("userJournals");
	var queryOfRelation = journalsRelation.query();
	queryOfRelation.descending("createdAt");
	queryOfRelation.find({
		success: function (results){
			myJournalsDiv.innerHTML = "";
			newJournalButton.innerHTML = "";
			newEntryDiv.innerHTML = "";
			entryDataButton.innerHTML = "";
			loggedIn();
		},
		error:function(error){
			alert("Something went wrong: error is " + error.message);
		}
	});
}

// After an entry has been created or updated, delete and recreate the entry list
function refreshEntriesSection(journalSelf, entrySelf){
	console.log("refreshEntrySection function called")
	myEntriesDiv.innerHTML = "";
	newEntryButton.innerHTML = "";
	newEntryDiv.innerHTML = "";
	entryDataButton.innerHTML = "";

	var entriesRelation = journalSelf.data.relation("userEntries");
	var queryOfRelation = entriesRelation.query();
	queryOfRelation.descending("createdAt");
	queryOfRelation.find({
		success: function (results){
			for (var i=0; i<results.length; i++){
				var entriesData = results[i];
				var entry = new Entry (entriesData, journalSelf, i);
			}
			buildNewEntryButton(journalSelf, entrySelf);
		},
		error:function(error){
			alert("Something went wrong: error is " + error.message);
		}
	});
}

// After an entry has been created or updated, open or reopen that entry
function refreshNewEntrySection(entryTitle, entriesData){
	currentEntry.buildEditEntry(entryTitle, entriesData);
}

// Journal Object
var Journal = function(data, index){
	var self = this;
	self.data = data;
	self.entries = [];
	self.index = index;

	// Builds the "My Journals" section
	self.makeJournals = function(journalSelf){
		self.journalTitle = document.createElement("button");
		var myJournals = self.data.get("journalTitle");
		var journalLabel = document.createTextNode(myJournals);
		self.journalTitle.className = "journalTitle";

		if(self.index == currentJournalIndex){
			self.journalTitle.classList.add("selected");
		} else {
			self.journalTitle.classList.remove("selected");
		}

		self.journalTitle.addEventListener('click', function(event){
			currentJournal.journalTitle.classList.remove("selected");
			self.journalTitle.classList.remove("selected");
			currentJournal = journalSelf;
			self.journalTitle.classList.add("selected");
			self.findJournalEntries(journalSelf);
			currentJournalIndex = self.index;
			currentEntryIndex = 0;
		});
		self.journalTitle.appendChild(journalLabel);
		myJournalsDiv.appendChild(self.journalTitle);

		// Build default journal entries
		if(self.index == currentJournalIndex){
			currentJournal = journalSelf;
			self.findJournalEntries(journalSelf);
		}
	}

	// Query to find the entries in the specific journal
	self.findJournalEntries = function(journalSelf){
		console.log("Clicked journal: " + self.journalTitle.innerText);
		myEntriesDiv.innerHTML = "";
		newEntryButton.innerHTML = "";
		newEntryDiv.innerHTML = "";
		entryDataButton.innerHTML = "";
		var entriesRelation = self.data.relation("userEntries");
		var queryOfRelation = entriesRelation.query();
		queryOfRelation.descending("createdAt");
		queryOfRelation.find({
			success: function (results){
				console.log("entriesRelation query success");
				var i;
				for (i=0; i<results.length; i++){
					var entriesData = results[i];
					self.entries.push(entriesData);
					var entry = new Entry (entriesData, self, i);
				}
				currentNumEntries = i;
				buildNewEntryButton(journalSelf, self);
			},
			error: function(error){
				alert("Something went wrong: error is " + error.message);
			}
		});
	}

	self.makeJournals(self);

}


// Entry Object
var Entry = function(data, journalSelf, index){
	var self = this;
	self.data = data;
	self.entries = [];
	self.index = index;

	// Builds the "Journal Entries" section
	self.createEntries = function(entriesData){
		console.log("createEntries function start");
		self.entryTitle = document.createElement("button");
		var myEntriesTitle = entriesData.attributes.entryTitle;
		var entryLabel = document.createTextNode(myEntriesTitle);
		self.entryTitle.className = "entryTitle";
		
		
		if(self.index == currentEntryIndex){
			self.entryTitle.classList.add("selected");
		} else {
			self.entryTitle.classList.remove("selected");
		}
		
		self.entryTitle.addEventListener('click', function(event){
			console.log(myEntriesTitle + " clicked");
			var prevSelected = myEntriesDiv.getElementsByClassName('selected');
			for(var i=0; i<prevSelected.length; i++){
				prevSelected[i].classList.remove("selected");
			}
			currentEntry = self;
			self.entryTitle.classList.add("selected");
			self.buildEditEntry(myEntriesTitle, entriesData);
			currentEntryIndex = self.index;
		});
		self.entryTitle.appendChild(entryLabel);
		myEntriesDiv.appendChild(self.entryTitle);

		// Build default journal entries
		if(self.index == currentEntryIndex){
			currentEntry = self; 
			self.buildEditEntry(myEntriesTitle, entriesData);
		}


	}

	// Builds the "Entry Content" section
	self.buildEditEntry = function(myEntriesTitle, entriesData){
		console.log("buildNewEntry function start");
		newEntryDiv.innerHTML = "";
		entryDataButton.innerHTML = "";
		self.entryTitleName = entriesData.attributes.entryTitle;
		self.entryText = entriesData.attributes.entryText;

		self.entryTitleLabel = document.createElement("label");
		self.entryTitleLabel.innerText = "Title:";
		self.entryTitleInput = document.createElement("input");
		self.entryTitleInput.value = self.entryTitleName;
		self.entryTextLabel = document.createElement("label");
		self.entryTextLabel.innerText = "Entry Content:";
		self.entryTextInput = document.createElement("textarea");
		self.entryTextInput.value = self.entryText;
		var saveButton = document.createElement("button");
		var saveLabel = document.createTextNode("Save");
		saveButton.appendChild(saveLabel);
		saveButton.className = "saveButton";

		saveButton.addEventListener('click', function(event){
			self.saveEntry(self.entryTitleName, self.entryTitleInput.value, self.entryTextInput.value, entriesData, journalSelf);
			currentEntryIndex = self.index;
		});

		newEntryDiv.appendChild(self.entryTitleLabel);
		newEntryDiv.appendChild(self.entryTitleInput);
		newEntryDiv.appendChild(self.entryTextLabel);
		newEntryDiv.appendChild(self.entryTextInput);
		entryDataButton.appendChild(saveButton);
	}

	// Saving any changes in the "Entry Content" section
	self.saveEntry = function(oldTitle, newTitle, newText, entriesData, journalSelf){
		console.log("saveEntry function start");

		var entriesRelation = journalSelf.data.relation("userEntries");
		var queryOfRelation = entriesRelation.query();
		queryOfRelation.descending("createdAt");
		queryOfRelation.find({
			success: function (results){
				console.log("entriesRelation query success");
				for (var i=0; i<results.length; i++){
					var entriesData = results[i];					
					if(entriesData.attributes.entryTitle == oldTitle){
						entriesData.set("entryTitle", newTitle);
						entriesData.set("entryText", newText);
						entriesData.save(null, {
							success: function (results){
								alert("Saved!");
								myEntriesDiv.innerHTML = "";
								newEntryButton.innerHTML = "";
								newEntryDiv.innerHTML = "";
								entryDataButton.innerHTML = "";
								refreshEntriesSection(journalSelf, self);
								refreshNewEntrySection(newTitle, entriesData)
							},
							error:function(error){
								alert("Something went wrong: error is " + error.message);
							}
						});
					}
				}	
			},
			error: function(error){
				alert("Something went wrong: error is " + error.message);
			}
		});
	}

	self.createEntries(self.data);
}

var user = new Parse.User();

if (Parse.User.current()) {
	user = Parse.User.current();
    loggedIn();
}













