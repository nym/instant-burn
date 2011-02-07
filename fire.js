$(document).ready(function() {

    function BurningFlickr () {  
      var tags = {};
      var results = [];
      var searchTxt = "";
      var self = this;
      
      var processAPIData, handleSearch, getImages, renderMany, renderOne, renderNone;

      processAPIData = function (json, type) {
	var i, sMachineTag, obj;
	
	// index by machine tag
	for (i = 0; i < json.length; i++) {
	  sMachineTag = "burningman:"+type+"="+json[i].id;
	  tags[sMachineTag] = json[i];
	  tags[sMachineTag].tag = sMachineTag;
	  tags[sMachineTag].earth = "http://earth.burningman.com/brc/2010/art_installation/" + json[i].id;
	  
	  $("#status").html("Loaded "+type+ " data from http://earth.burningman.com/api/docs/");
	  $("#output").html("<div class='error'>Type something like <strong>temple</strong>, <strong>bliss</strong>, or <strong>syzygryd</strong></div>");
	}
      };
      
      handleSearch = function() {
	var tag, str, name;
	
	str = "";
	searchTxt = $("#search input").val().toLowerCase();
	
	results = [];
	for (tag in tags) {
	  if (tags.hasOwnProperty(tag)) {
	    name = tags[tag].name.toLowerCase();
	    if (name.indexOf(searchTxt) != -1) {
	      results.push(tags[tag]);
	    }  
	  }
	}
	self.render();
      };
      
      getImages = function (tag) {
	var i, sApi, oUrl;
	
	sApi = "http://api.flickr.com/services/rest/?method=flickr.photos.search&format=json&jsoncallback=?&api_key=057974d1092a13b03a5dd58491c8fdc3&machine_tags=" + escape(tag);
	
	$.getJSON(sApi, function(j) { 
	    if (typeof(j.photos) != "undefined" && typeof(j.photos.photo) != "undefined") {
	      if (typeof(tags[tag].images) == "undefined") {
		tags[tag].images = [];
		
		for (i=0; i<j.photos.photo.length; i++) {
		  p = j.photos.photo[i];
		  
		  farmID = p.farm;
		  serverID = p.server;
		  id = p.id;
		  secret = p.secret;
		  owner = p.owner;
		  
		  oUrl = {base: "http://farm"+farmID+".static.flickr.com/"+serverID+"/"+id+"_"+secret,
			  web: "http://www.flickr.com/photos/"+owner+"/"+id
		  };
		  
		  tags[tag].images.push(oUrl);
		  if (i>10) {
		    break;
		  }
		}
		
		self.render();
	      }
	    }
	  });
      };
      
      self.render = function () {
	var i, sOutput;


	if (searchTxt === "") {
	  $("#status").html("<br/>");
	} else {
	  $("#status").html("<strong>" + results.length + "</strong> art installations found.");
	}

	if (searchTxt === "") {
	  renderNone();
	} else if (results.length == 1) {
	  renderOne();
	} else if (results.length > 1) {
	  renderMany();
	} else {
	  renderNone();
	}
      };
      
      renderOne = function () {
	// strategy for rending just one item, shows more information including description
	// todo: replace sOutput with micro-template
	obj = results[0];
	sOutput = "<h3>"+obj.name+"</h3>";
	if (obj.artist !== null) {
	  sOutput += "<div><label>Lead Artist:</label> " + obj.artist + "<br/><br/>";
	}
	if (obj.description !== null) {
	  sOutput += obj.description + "<br/><br/>";
	}
	sOutput += "Add to this collection by tagging your photos with the following <a href='http://blog.flickr.net/en/2009/08/28/burning-man-theme-camp-machine-tags/' target='f'>machine tag</a>: <input type='text' value='"+obj.tag+"'></input><br/><br/>";
	if (obj.images) {
	  for (i=0; i<obj.images.length; i++) {
	    sOutput += "<a href='"+obj.images[i].web+"' target='f'><img src='"+obj.images[i].base+".jpg'/></a><br/><br/>";
	  }
	} else {
	  getImages(obj.tag);
	}
	sOutput += "<a href='"+obj.earth+"'>View on earth.burningman.com</a><br/>";
	sOutput += "<a href='http://www.flickr.com/photos/tags/"+obj.tag+"'>More Photos</a>";
	$("#output").html(sOutput);    
      };
      
      renderMany = function () {
	// strategy for rending just multiple items, displays one image per item and no description
	// todo: replace sOutput with micro-template
	sOutput = "<ul>";
	
	for (i=0; ((i<results.length) && (i<10)); i++) {
	  obj = results[i];

	  sOutput += "<li>";
	  sOutput += "<strong>"+obj.name+"</strong><br/>";

	  if (typeof(obj.images) != "undefined") {
	    if (obj.images.length>0) {
	      sOutput += "<a href='"+obj.images[i].web+"' target='f'><img src='"+obj.images[i].base+".jpg'/></a><br/><br/>";
	    }
	  } else {
	    getImages(obj.tag);
	  }

	  if (obj.artist !== null) {
	    sOutput += "<div><label>Artist:</label> " + obj.artist + "</div><br/>";
	  }

	  sOutput += "<div><input type='text' value='"+obj.tag+"'></input></div>";
	  
	  if (typeof(obj.images) != "undefined") {
	    if (obj.images.length > 0) {
	      sOutput += "<div><a href='http://www.flickr.com/photos/tags/"+obj.tag+"'>More Photos</a></div>";
	    } else {
	      sOutput += "<br/>No photos tagged yet. Use the machine tag above to add to this collection.";
	    }
	  } else {
	    sOutput += "<br/>Loading images from Flickr...";
	  }
	  sOutput += "<br/><a href='"+obj.earth+"'>View on earth.burningman.com</a>";
	  sOutput += "</li>";
	}
	sOutput += "</ul>";
	$("#output").html(sOutput);
      };
      
      renderNone = function () {
	// strategy for handling situations where no input is entered.
	if (searchTxt === "") {
	  sOutput = "<div class='error'>Try something like '<strong>temple</strong>' or '<strong>bliss</strong>'.</div>";
	} else {
	  sOutput = "<div class='error'>Nothing matches '"+searchTxt+"'. Try something like 'temple' or 'bliss'.</div>";
	}
	$("#output").html(sOutput);    
      };

      self.init = function () {
	var wStatus, sArtURL, wSearch;
	
	wStatus = $("#status");
	wStatus.html("Loading...");
	
	sArtURL = "http://earth.burningman.com/api/0.1/2010/art/?callback=?";
	$.getJSON(sArtURL, function(j) { processAPIData(j, "art"); });
	
	// clear out and attach search handler for search events
	wSearch = $("#search input");
	wSearch.val("");
	wSearch.change(handleSearch);
	wSearch.keyup(handleSearch);
	wSearch.focus();
      };
      
    }
    
    BF = new BurningFlickr();
    BF.init();

  });
