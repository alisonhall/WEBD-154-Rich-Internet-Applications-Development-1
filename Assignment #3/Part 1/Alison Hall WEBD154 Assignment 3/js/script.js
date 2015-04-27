Parse.initialize("S4KPo6rwBwk16fNnreLk1Px3vST6jRmDk6k9fs5R", "bXvGBcQE0WpWl8FaNLwgI0zv6iOkT6b0D3b3DlQq");

var usernameField = document.getElementById("usernameField");
var passwordField = document.getElementById("passwordField");
var loginButton   = document.getElementById("loginButton");
var signupButton  = document.getElementById("signupButton");
var loginBlock    = document.getElementById('login');

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

var JournalData = Parse.Object.extend("Journals");
var EntriesData = Parse.Object.extend("Entries");

var currentJournal;
var currentNumEntries;

var user = new Parse.User();

// Handles the logging in
function loginHandler(){
	user.set("username", usernameField.value);
	user.set("password", passwordField.value);
	user.logIn({
		success:function (user){
			console.log("login worked");
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
			loggedIn();
			
		}, 
		error: function (user, error){
			console.log("error "+ error.code);
		}
	});
}

// Code to run once the user has logged in or signed up
function loggedIn(){
	hideLogin();
	var query = new Parse.Query(JournalData);
	query.descending("createdAt");
	var journalsRelation = user.relation("userJournals");
	journalsRelation.query().find({
		success: function (results){
			for (var i=0; i<results.length; i++){
				var journalData = results[i];
				var journal = new Journal ("hasData", journalData);
			}
			buildNewJournalButton(journalData, self);
		},
		error:function(error){
			alert("Something went wrong: error is " + error.message);
		}
	});
}

// Once logged in, hide the login in fields and display message
function hideLogin (){
	loginBlock.className = "hidden";
	welcomeMessage.className= "shown";
	welcomeText.textContent = "Welcome " + user.get("username");
}

// Create the "Add Journal" button
function buildNewJournalButton(journalData, journalSelf){
	var button = document.createElement("button");
	var buttonLabel = document.createTextNode("Add Journal");
	button.appendChild(buttonLabel);

	button.addEventListener('click', function(event){	
		var journalData = new JournalData ();
		var journalsRelation = user.relation("userJournals");
		var newJournalTitle = prompt("Enter the new journal's title.");
		
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
function buildNewEntryButton(entriesData, journalSelf, entriesCounter){
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
				currentJournal.data.save(null, {
					success: function (results){
						refreshEntriesSection(currentJournal);
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
	var query = new Parse.Query(JournalData);
	query.descending("createdAt");
	var journalsRelation2 = user.relation("userJournals");
	journalsRelation2.query().find({
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
function refreshEntriesSection(journalSelf){
	console.log("refreshEntrySection function called")
	myEntriesDiv.innerHTML = "";
	newEntryButton.innerHTML = "";
	newEntryDiv.innerHTML = "";
	entryDataButton.innerHTML = "";
	var query = new Parse.Query(EntriesData);
	query.descending("createdAt");
	var entriesRelation = journalSelf.data.relation("userEntries");
	entriesRelation.query().find({
		success: function (results){
			for (var i=0; i<results.length; i++){
				var entriesData = results[i];
				var entry = new Entry ("hasData", entriesData, journalSelf);
			}
			buildNewEntryButton(entriesData, self);
		},
		error:function(error){
			alert("Something went wrong: error is " + error.message);
		}
	});
}

// Journal Object
var Journal = function(dataCheck, data){
	var self = this;
	self.data = data;
	self.entries = [];

	// Builds the "My Journals" section
	self.makeJournals = function(dataCheck, journalSelf){
		self.journalTitle = document.createElement("button");
		var myJournals = self.data.get("journalTitle");
		var journalLabel = document.createTextNode(myJournals);
		self.journalTitle.appendChild(journalLabel);
		self.journalTitle.className = "journalTitle";
		self.journalTitle.addEventListener('click', function(event){
			currentJournal = journalSelf;
			self.findJournalEntries(self, journalSelf);
		});
		myJournalsDiv.appendChild(self.journalTitle);
	}

	// Query to find the entries in the specific journal
	self.findJournalEntries = function(thisSelf, journalSelf){
		console.log("Clicked journal: " + self.journalTitle.innerText);
		myEntriesDiv.innerHTML = "";
		newEntryButton.innerHTML = "";
		newEntryDiv.innerHTML = "";
		entryDataButton.innerHTML = "";
		var query = new Parse.Query(EntriesData);
		query.descending("createdAt");
		var entriesRelation = self.data.relation("userEntries");
		entriesRelation.query().find({
			success: function (results){
				console.log("entriesRelation query success");
				var i;
				for (i=0; i<results.length; i++){
					var entriesData = results[i];
					self.entries.push(entriesData);
					var entry = new Entry ("hasData", entriesData, self);
				}
				currentNumEntries = i;
				buildNewEntryButton(entriesData, journalSelf, currentNumEntries);
			},
			error: function(error){
				alert("Something went wrong: error is " + error.message);
			}
		});
	}

	self.makeJournals(dataCheck, self);

}


// Entry Object
var Entry = function(dataCheck, data, journalSelf){
	var self = this;
	self.data = data;
	self.entries = [];

	// Builds the "Journal Entries" section
	self.createEntries = function(dataCheck, entriesData){
		console.log("createEntries function start");
		self.entryTitle = document.createElement("button");
		var myEntries = entriesData.attributes.entryTitle;
		var entryLabel = document.createTextNode(myEntries);
		self.entryTitle.appendChild(entryLabel);
		self.entryTitle.className = "entryTitle";
		myEntriesDiv.appendChild(self.entryTitle);
		self.entryTitle.addEventListener('click', function(event){
			self.buildEditEntry(dataCheck, myEntries, entriesData);
		});
	}

	// Builds the "Entry Content" section
	self.buildEditEntry = function(dataCheck, myEntries, entriesData){
		console.log("buildNewEntry function start");
		newEntryDiv.innerHTML = "";
		entryDataButton.innerHTML = "";
		self.entryTitle = myEntries;
		self.entryText = entriesData.attributes.entryText;

		self.entryTitleLabel = document.createElement("label");
		self.entryTitleLabel.innerText = "Title:";
		self.entryTitleInput = document.createElement("input");
		self.entryTitleInput.value = self.entryTitle;
		self.entryTextLabel = document.createElement("label");
		self.entryTextLabel.innerText = "Entry Content:";
		self.entryTextInput = document.createElement("textarea");
		self.entryTextInput.value = self.entryText;
		var saveButton = document.createElement("button");
		var saveLabel = document.createTextNode("Save");
		saveButton.appendChild(saveLabel);
		saveButton.className = "saveButton";

		saveButton.addEventListener('click', function(event){
			self.saveEntry(self.entryTitle, self.entryTitleInput.value, self.entryTextInput.value, entriesData, journalSelf);
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
		entriesRelation.query().find({
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
								refreshEntriesSection(currentJournal);
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

	self.createEntries(dataCheck, self.data);
}















