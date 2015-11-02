// map.js


var map;
var markers;
var vectors;
var center;
var drawControls;

// map to keep track of markers in the map
var markerMap = {};

// map to keep track of popup in the map
var popupMap = {};

// map to keep track of polygons added in the map
var polygonMap = {};

function getParams() {
	var url = window.location.search;
	var params = {};
	var pairs = url.substring(url.indexOf('?') + 1).split('&');
	for ( var i = 0; i < pairs.length; i++) {
		var pair = pairs[i].split('=');
		params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
	}
	return params;
}


function isShowPopups() {
	var params = getParams();
	var show = params["popup"];
	
	if(show == "true")
		return true;

	return false;
}

function getPeriod() {
	var params = getParams();
	var period = params["period"];
	
	if(period != null)
		return period;

	return 3000;
}

function getDataUrl() {
	var params = getParams();
	var dataUrl = params["data"];
	
	return dataUrl;
}	

function initialize() {
	var map_options = {
		div : this.mapDiv,
		allOverlays : false,
		maxExtent : this.mapExtent,
		controls : [ new OpenLayers.Control.DragPan(),
				new OpenLayers.Control.Navigation(),
				new OpenLayers.Control.PanZoomBar(),
				new OpenLayers.Control.ScaleLine(),
				new OpenLayers.Control.MousePosition(),
				new OpenLayers.Control.LayerSwitcher() ]
	};
	map = new OpenLayers.Map('map-canvas', map_options);
	map.addLayer(new OpenLayers.Layer.OSM());

	var cityCenterLngLat = new OpenLayers.LonLat(-79.373559, 43.658250)
			.transform(new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
			map.getProjectionObject() // to Spherical Mercator Projection
			);
	map.setCenter(cityCenterLngLat, 14);

	// Add Markers Layer
	markers = new OpenLayers.Layer.Markers("Markers");
	map.addLayer(markers);				
	
	// Add Vectors Layer
	vectors = new OpenLayers.Layer.Vector("Polygon Layer");
	map.addLayer(vectors);

	loadData();
}									
					
function loadData() {		
	
	// retreive data from input port of TupleViewer					
	var url = window.location.protocol + '//' + window.location.hostname + '/api/jax-rs/getData';
	//var url = "http://insightdemojava.mybluemix.net/api/jax-rs/getData" ;

	// construct HTTP request and send 
	var markerReq = new XMLHttpRequest({mozSystem: true});
	markerReq.open("GET", url, true);
	
	markerReq.onreadystatechange = function() {
		// when we get the ressponse back, update marker and polygon locations
		if (markerReq.readyState == 4 && markerReq.status == 200) {
			 updateMap(markerReq.responseText);
		 }   				 
	}			
	markerReq.onLoad = 
	markerReq.send(null);			

	// refresh data every x second based on period parameter
	timeoutID = setTimeout('loadData()', getPeriod());
}


function addPopup(object, lngLat){
	// close the previous popup before creating a new one
	var prevPopup = popupMap[object.id]
	if (prevPopup != null) {
		map.removePopup(prevPopup);
	}

	// add popup
	if (isShowPopups() && object.note.length > 0) {
		var contentString = '<div id="content" style="width:100px">'
				+ '<div id="siteNotice">'
				+ '</div>'
				+ '<div id="bodyContent" style="width:100px;font-size:small">'
				+ '<b>'
				+ object.id
				+ '</b><br />'
				+ object.note
				+ '</div>' + '</div>';

		var popup = new OpenLayers.Popup.FramedCloud(object.id,
				lngLat, null, contentString, null, false);
		popup.panMapIfOutOfView = false;

		map.addPopup(popup);
		popupMap[object.id] = popup;
	}
}

function getIcon(markerType) {

	if (markerType=='GREEN')
		return 'marker-green.png';
	if (markerType=='YELLOW')
		return 'marker-gold.png';
	if (markerType=='RED')
		return 'marker-red.png';				
}

function updateMap(response) {

	try {
		// TupleViewer retuns tuples information as JSON, parse the JSON into a list of objects to process
		var allObjects = JSON.parse(response);
				
		if(allObjects.length == 1)
			allObjects = allObjects[0].objList;
		else
			allObjects = allObjects.objList;
				
		// for each object, update marker or poly accordingly.						
		for (var i=0; i<allObjects.length; i++) {
			var lat = allObjects[i].latitude;
			var lng = allObjects[i].longitude;
			var markerID = allObjects[i].id;
			var markerType = allObjects[i].markerType;
			var wkt = allObjects[i].wkt;
			var updateAction = allObjects[i].updateAction;		
			
			if(wkt == "") 
			{
				if(markerID in polygonMap)
				{
					var featureToRemove = polygonMap[markerID];
					vectors.removeFeatures([featureToRemove]);	
				}
				continue;
			}
			
			// construct WKT formatter to parse out geometry from tuples
			var formatter = new OpenLayers.Format.WKT();
	
			// parse wkt string from tuples
			var feature = formatter.read(wkt);
			
			// transform from WGS 1984  to Spherical Mercator Projection
			var transformedFeature = feature.geometry.transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject());
			
			var vertices = transformedFeature.getVertices();		
			
			// this is a point, number of vertices must be 1
			if (vertices.length == 1) {
			
				// if this is a point, remove any existing marker with same ID and add new marker
				var myLongLat = new OpenLayers.LonLat(transformedFeature.x, transformedFeature.y);				
	
				var marker;
				
				// check if marker exists, if so remove
				if (markerID in markerMap) {
					marker = markerMap[markerID];
					markers.removeMarker(marker);
				}

				// if updateAction > 1, that means we need to add marker back
				// otherwise simply remove marker
				if (updateAction > 0)
				{
					var icon = new OpenLayers.Icon(getIcon(markerType));

					var marker = new OpenLayers.Marker(myLongLat, icon.clone());
					markers.addMarker(marker);

					// save marker to maperMap so we can get it back in the next update
					markerMap[markerID] = marker;		
				
					// if this is the first point, center the map to the point.
// 							if (center == null)
// 							{
// 								center = myLongLat;
// 								map.setCenter(center, 15);
// 							}
				
					// add popup for marker
					addPopup(allObjects[i], myLongLat);
				}
			}
			// else assume it's a polygon
			else {
				var style = {strokeColor: "#0033CC",strokeOpacity: 1,strokeWidth: 2,fillColor: "#0033CC",fillOpacity: 0.2}; // default style
				if(markerType == "RED")
				{
					style = {strokeColor: "#FF3300",strokeOpacity: 1,strokeWidth: 2,fillColor: "#FF3300",fillOpacity: 0.3};	
				}
				 
				// remove existing polygon from map if one with same markerId exist
				if (markerID in polygonMap) {
					var featureToRemove = polygonMap[markerID];
					vectors.removeFeatures([featureToRemove]);
				}
			
				// add new polygon to the map
				if (updateAction > 0)
				{
					var poly = new OpenLayers.Geometry.LinearRing(vertices);
					var polygonFeature = new OpenLayers.Feature.Vector(poly, null,style);						
					vectors.addFeatures([polygonFeature]);
					polygonMap[markerID]=polygonFeature;
				}
			}
			
		}
	}
	catch (e) {
	}
}

initialize();