// @author  Ivan Reinaldo
// Defines a MST object; keeps implementation of graph internally and interact with GraphWidget to display Prim and Kruskal MST visualizations

// MST Example Constant
var MST_EXAMPLE_TESSELLATION = 0;
var MST_EXAMPLE_K5 = 1;
var MST_EXAMPLE_RAIL = 2;
var MST_EXAMPLE_CP4P10 = 3;
var MST_EXAMPLE_CP4P14 = 4;

// MST Type Constant
var MST_MIN = 0; // Minimum Spanning Tree
var MST_MAX = 1; // Maximum Spanning Tree

var MST = function(){
  var self = this;
  var graphWidget = new GraphWidget();

  var valueRange = [1, 100]; // Range of valid values of BST vertexes allowed

  /*
   *  Structure of internalAdjList: JS object with
   *  - key: vertex number
   *  - value: JS object with
   *           - key: the other vertex number that is connected by the edge
   *           - value: ID of the edge, NOT THE WEIGHT OF THE EDGE
   *
   *  The reason why the adjList didn't store edge weight is because it will be easier to create bugs
   *  on information consistency between the adjList and edgeList
   *
   *  Structure of internalEdgeList: JS object with
   *  - key: edge ID
   *  - value: JS object with the following keys:
   *           - vertexA
   *           - vertexB
   *           - weight
   */

  var internalAdjList = {};
  var internalEdgeList = {};
  var amountVertex = 0;
  var amountEdge = 0;

  this.getGraphWidget = function(){
    return graphWidget;
  }
  
  fixJSON = function()
  {
    amountVertex = 0;
    amountEdge = 0;
    for (var key in internalAdjList) ++amountVertex;
    for (var key in internalEdgeList) ++amountEdge;
      
    for (var key in internalEdgeList)
    {
      delete internalEdgeList[key]["type"];
      delete internalEdgeList[key]["displayWeight"];
    }
    for (var key in internalAdjList)
    {
      delete internalAdjList[key]["text"];
      delete internalAdjList[key]["state"];
    }
    for (var key in internalEdgeList)
    {
      internalAdjList[internalEdgeList[key]["vertexA"]][internalEdgeList[key]["vertexB"]] = +key;
      internalAdjList[internalEdgeList[key]["vertexB"]][internalEdgeList[key]["vertexA"]] = +key;
      internalEdgeList[key]["weight"] = +internalEdgeList[key]["weight"];
    }
  }

  takeJSON = function(graph)
  {
    graph = JSON.parse(graph);
    internalAdjList = graph["vl"];
    internalEdgeList = graph["el"];
    fixJSON();
  }

  statusChecking = function()
  {
    if (amountVertex == 0)
      $("#draw-status p").html("Graph is empty");
    else
      $("#draw-status p").html("");
  }

  warnChecking = function()
  {
    var warn = "";
    if (amountVertex >= 10)
      warn += "Too much vertex on screen, consider drawing smaller graph. ";

    if (warn == "") $("#draw-warn p").html("No Warning");
    else $("#draw-warn p").html(warn);
  }

  errorChecking = function()
  {
    var error = "";
    if (amountVertex == 0)
    {
      $("#draw-err p").html("Graph cannot be empty. ");
      return;
    }
    
    var visited = [];
    var stack = [];
    stack.push(0);
    visited[0] = true;
    while (stack.length > 0)
    {
      var now = stack.pop();
      for (var key2 in internalEdgeList)
      {
        if (internalEdgeList[key2]["vertexA"] == now && !visited[internalEdgeList[key2]["vertexB"]])
        {
          visited[internalEdgeList[key2]["vertexB"]] = true;
          stack.push(+internalEdgeList[key2]["vertexB"]);
        }
		if (internalEdgeList[key2]["vertexB"] == now && !visited[internalEdgeList[key2]["vertexA"]])
        {
          visited[internalEdgeList[key2]["vertexA"]] = true;
          stack.push(+internalEdgeList[key2]["vertexA"]);
        }
      }
    }
    for (var i = 0; i < amountVertex; ++i) if(!visited[i]) 
    {
      error = error + "Vertex 0 and vertex " + (i) + " is not connected. "
      break;
    }

    if (error == "") $("#draw-err p").html("No Error");
    else $("#draw-err p").html(error);
  }

  var intervalID;

  this.startLoop = function()
  {
    intervalID = setInterval(function()
    {
      takeJSON(JSONresult);
      warnChecking();
      errorChecking();
      statusChecking();
    },100);
  }

  this.stopLoop = function()
  {
    clearInterval(intervalID);
  }
  
  this.draw = function() 
  {
    if ($("#draw-err p").html() != "No Error") return false;
    if ($("#submit").is(':checked'))
      this.submit(JSONresult);
    if ($("#copy").is(':checked'))
    {
      window.prompt("Copy to clipboard:",JSONresult);
    }

    graph = createState(internalAdjList,internalEdgeList);
    graphWidget.updateGraph(graph, 500);
    return true;
  }

  this.submit = function(graph)
  {
    // $.ajax({
    //                 url: "http://algorithmics.comp.nus.edu.sg/~onlinequiz/erinplayground/php/Graph.php?mode=" + MODE_SUBMIT_GRAPH + "&sessionID=" + $.cookie("sessionID"),
    //                 type: "POST",
    //                 data: {canvasWidth: 1000, canvasHeight: 500, graphTopics: 'MST', graphState: graph},
    //                 error: function(xhr, errorType, exception) { //Triggered if an error communicating with server  
    //                     var errorMessage = exception || xhr.statusText; //If exception null, then default to xhr.statusText  

    //                     alert("There was an error submitting your graph " + errorMessage);
    //                 }
    //             }).done(function(data) {
    //                 console.log(data);
    //             });
  }

  this.importjson = function()
  {
    var text = $("#samplejson-input").val();
    takeJSON(text);
    statusChecking();
    graph = createState(internalAdjList,internalEdgeList);
    graphWidget.updateGraph(graph, 500);
  }
    
  this.initRandom = function(graph) {
    internalAdjList = graph.internalAdjList;
    internalEdgeList = graph.internalEdgeList;
    amountVertex = internalAdjList.length;
    amountEdge = internalEdgeList.length;
    fixJSON();
    statusChecking();
    var newState = createState(internalAdjList, internalEdgeList);

    graphWidget.updateGraph(newState, 500);
  }

  this.prim = function(startVertexText, mstTypeConstant){
    var key;
    var i;
    var notVisited = {};
    var vertexHighlighted = {}, edgeHighlighted = {}, vertexTraversed = {}, edgeTraversed = {}, edgeQueued = {};
    var stateList = [];
    var currentState;

    //add error checks
    if(amountVertex == 0) { //no graph
      $('#prims-err').html("There is no graph to run this on. Please select a sample graph first.");
      return false;
    }
    if(startVertexText >= amountVertex) { //start vertex not in range
      $('#prims-err').html("This vertex does not exist in the graph");
      return false;
    }

    for(key in internalAdjList){
      if(key == "cx" || key == "cy") continue;
      if(key != startVertexText) notVisited[key] = true;
    }

    currentState = createState(internalAdjList, internalEdgeList);
    currentState["status"] = 'The original graph';
    currentState["lineNo"] = 0;
    stateList.push(currentState);

    vertexTraversed[startVertexText] = true;
    currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, edgeQueued);
    currentState["status"] = 'add '+startVertexText+' to set T';
    currentState["lineNo"] = 1;
    stateList.push(currentState);

    delete vertexHighlighted[startVertexText];
    vertexTraversed[startVertexText] = true;

    var sortedArray = [];

    function sortedArrayToString() {
      var ansStr = "";
	  var maxLength = Math.min(sortedArray.length, 6);
      for(var i=0; i<maxLength; i++) {
        var thisTriple = sortedArray[i];
        ansStr += "("+thisTriple.getFirst()+","+thisTriple.getSecond()+")";
        if(i < (maxLength-1)) {
          ansStr += ", ";
        }
      }
	  if(sortedArray.length > 6) {ansStr += "..";}
	  if(ansStr == "") {ansStr = "empty";}
      return ansStr;
    }
     
    var enqueuedToString = "";
    
    for(key in internalAdjList[startVertexText]){
      if(key == "cx" || key == "cy" || key == "cxPercentage" || key == "cyPercentage") continue;

      var enqueuedEdgeId = internalAdjList[startVertexText][key];
      var enqueuedEdge;
      if(mstTypeConstant == MST_MAX)
        enqueuedEdge = enqueuedEdge = new ObjectTriple(-1*internalEdgeList[enqueuedEdgeId]["weight"], key, enqueuedEdgeId);
      else enqueuedEdge = new ObjectTriple(internalEdgeList[enqueuedEdgeId]["weight"], key, enqueuedEdgeId);
      edgeQueued[enqueuedEdgeId] = true;
      enqueuedToString += "("+internalEdgeList[enqueuedEdgeId]["weight"]+","+key+"), ";
      sortedArray.push(enqueuedEdge);
    }

    enqueuedToString = enqueuedToString.substring(0,enqueuedToString.length-2);

    sortedArray.sort(ObjectTriple.compare);

    currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, edgeQueued);
    currentState["status"] = 'Add '+enqueuedToString+' to the PQ.<br/>The PQ is now '+sortedArrayToString()+'.';
    currentState["lineNo"] = 2;
    stateList.push(currentState);

    while(/*Object.keys(notVisited).length > 0*/sortedArray.length>0){
      var dequeuedEdge = sortedArray.shift();
      var otherVertex = dequeuedEdge.getSecond();
      var edgeId = dequeuedEdge.getThird();

	  vertexHighlighted[otherVertex] = true;
	  edgeHighlighted[edgeId] = true;
      currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, edgeQueued);
      currentState["status"] = 'Remove pair ('+dequeuedEdge.getFirst()+','+otherVertex+') from PQ. Check if vertex '+otherVertex+' is in T.<br/>The PQ is now '+sortedArrayToString()+'.';
      currentState["lineNo"] = 4;
      stateList.push(currentState);

      if(notVisited[otherVertex] != null){
        delete edgeHighlighted[edgeId];
        edgeHighlighted[edgeId] = true;
        vertexHighlighted[otherVertex] = true;

        currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, edgeQueued);
        //currentState["el"][edgeId]["animateHighlighted"] = true;
        currentState["status"] = otherVertex+' is not in T';
        currentState["lineNo"] = 4;
        stateList.push(currentState);

        delete notVisited[otherVertex];
        delete vertexHighlighted[otherVertex];
		delete edgeHighlighted[edgeId];
		edgeTraversed[edgeId] = true;
        vertexTraversed[otherVertex] = true;

        var enqueuedToString = "";

        for(key in internalAdjList[otherVertex]){
          if(key == "cx" || key == "cy") continue;
          if(notVisited[key] == null) continue;

          var enqueuedEdgeId = internalAdjList[otherVertex][key];
          var enqueuedEdge;
          if(mstTypeConstant == MST_MAX)
            enqueuedEdge = enqueuedEdge = new ObjectTriple(-1*internalEdgeList[enqueuedEdgeId]["weight"], key, enqueuedEdgeId);
          else enqueuedEdge = new ObjectTriple(internalEdgeList[enqueuedEdgeId]["weight"], key, enqueuedEdgeId);
          if(edgeQueued[enqueuedEdgeId] == null){
            edgeQueued[enqueuedEdgeId] = true;
            enqueuedToString += "("+internalEdgeList[enqueuedEdgeId]["weight"]+","+key+"), ";
            sortedArray.push(enqueuedEdge);
          }
        }

        enqueuedToString = enqueuedToString.substring(0,enqueuedToString.length-2);
        sortedArray.sort(ObjectTriple.compare);

        currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, edgeQueued);
        currentState["status"] = 'so add '+otherVertex+' to T, and add '+enqueuedToString+' to the Priority Queue.<br/>The PQ is now '+sortedArrayToString()+'.';
        currentState["lineNo"] = 5;
        stateList.push(currentState);
      }

      else{
        delete edgeQueued[edgeId];
		delete edgeHighlighted[edgeId];

        currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, edgeQueued);
        currentState["status"] = otherVertex+' is in T, so ignore this edge';
        currentState["lineNo"] = 6;
        stateList.push(currentState);
      }
    }

    /* For MST, I'm considering of NOT using the original graph as the final state
     * This is because:
     * 1. The current GraphWidget doesn't break down if the final state is not the original graph
     * 2. It's less intuitive for the students to NOT display the MST at the final state of the animation
     */

    currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, edgeQueued);
    currentState["status"] = 'The highlighted vertices and edges form a Minimum Spanning Tree';
    currentState["lineNo"] = 7;
    stateList.push(currentState);

    populatePseudocode(0);
    graphWidget.startAnimation(stateList);
    return true;
  }

  this.kruskal = function(mstTypeConstant){
    var key;
    var i;
    var stateList = [];
    var currentState;
    var vertexHighlighted = {}, edgeHighlighted = {}, vertexTraversed = {}, edgeTraversed = {}, edgeQueued={};
    var sortedArray = [];
    var tempUfds = new UfdsHelper();
    var totalWeight = 0;

    //add error check
    if(amountVertex == 0) { //no graph
      $('#kruskals-err').html("There is no graph to run this on. Please select a sample graph first.");
      return false;
    }

    currentState = createState(internalAdjList, internalEdgeList);

    for(key in internalAdjList){
      tempUfds.insert(key);
    }

    for(key in internalEdgeList){
      var enqueuedEdge;
      if(mstTypeConstant == MST_MAX) {
		  edgeQueued[key]=true;
		  enqueuedEdge = new ObjectPair(-1*internalEdgeList[key]["weight"], parseInt(key));
	  }
      else {
		  edgeQueued[key]=true;
		  enqueuedEdge = new ObjectPair(internalEdgeList[key]["weight"], parseInt(key));
	  }
      sortedArray.push(enqueuedEdge);
    }

    sortedArray.sort(ObjectPair.compare);

    function sortedArrayToString() {
      var ansStr = "";
	  var maxLength = Math.min(sortedArray.length, 10);
      for(var i=0; i<maxLength; i++) {
        var thisEdgeId = sortedArray[i].getSecond();
        ansStr += "("+internalEdgeList[thisEdgeId]["weight"]+",("+internalEdgeList[thisEdgeId]["vertexA"]+","+internalEdgeList[thisEdgeId]["vertexB"]+"))";
        if(i < (maxLength-1)) {
          ansStr += ", ";
        }
      }
	  if(sortedArray.length > 10) {
		  ansStr += " ...";
	  }
      return ansStr;
    }
    
	currentState = createState(internalAdjList, internalEdgeList,vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, edgeQueued);
    currentState["status"] = 'Edges are sorted in increasing order of weight: '+sortedArrayToString();
    currentState["lineNo"] = [1,2];
    stateList.push(currentState);

    while(sortedArray.length > 0){
      currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, edgeQueued);
      if(sortedArray.length > 1) {
        currentState["status"] = 'The remaining edges are '+sortedArrayToString();
      } else if(sortedArray.length == 1) {
      	currentState["status"] = 'The remaining edge is '+sortedArrayToString();
      }
      currentState["lineNo"] = 3;
      stateList.push(currentState);

      var dequeuedEdge = sortedArray.shift();
      var dequeuedEdgeId = dequeuedEdge.getSecond();
      var vertexA = internalEdgeList[dequeuedEdgeId]["vertexA"];
      var vertexB = internalEdgeList[dequeuedEdgeId]["vertexB"];
      var thisWeight = internalEdgeList[dequeuedEdgeId]["weight"];

      edgeHighlighted[dequeuedEdgeId] = true;
      vertexHighlighted[vertexA] = true;
      vertexHighlighted[vertexB] = true;

      currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, edgeQueued);
      currentState["status"] = 'Checking if adding edge ('+thisWeight+',('+vertexA+','+vertexB+')) forms a cycle';
      currentState["lineNo"] = 4;
      stateList.push(currentState);

      var noCycle = false;

      if(!tempUfds.isSameSet(vertexA, vertexB)){
        noCycle = true;
        tempUfds.unionSet(vertexA, vertexB);
        edgeTraversed[dequeuedEdgeId] = true;
        vertexTraversed[vertexA] = true;
        vertexTraversed[vertexB] = true;
        totalWeight += parseInt(thisWeight);
      }

      delete edgeHighlighted[dequeuedEdgeId];
	  delete edgeQueued[dequeuedEdgeId]
      delete vertexHighlighted[vertexA];
      delete vertexHighlighted[vertexB];

      currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, edgeQueued);
      if(noCycle) {
        currentState["status"] = 'Adding edge ('+vertexA+','+vertexB+') with weight '+thisWeight+' does not form a cycle, so add it to T. The current weight of T is '+totalWeight+'.';
        currentState["lineNo"] = 5;
      } else {
      	currentState["status"] = 'Adding edge ('+vertexA+','+vertexB+') will form a cycle, so ignore it. The current weight of T remains at '+totalWeight+'.';
        currentState["lineNo"] = 6;
      }
      stateList.push(currentState);
    }

    currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, edgeQueued);
    currentState["status"] = 'The highlighted vertices and edges form a Minimum Spanning Tree with MST weight = '+totalWeight;
    currentState["lineNo"] = 7;
    stateList.push(currentState);
    
    populatePseudocode(1);
    graphWidget.startAnimation(stateList);
    return true;
  }

  function createState(internalAdjListObject, internalEdgeListObject, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, edgeQueued){
	var isDefaultGrey = true;
	if((vertexHighlighted == null)&&(edgeHighlighted == null)&&(vertexTraversed == null)&&(edgeTraversed == null)&&(edgeQueued == null)) isDefaultGrey = false;
  if(vertexHighlighted == null) vertexHighlighted = {};
  if(edgeHighlighted == null) edgeHighlighted = {};
  if(vertexTraversed == null) vertexTraversed = {};
  if(edgeTraversed == null) edgeTraversed = {};
	if(edgeQueued == null) edgeQueued = {};

  	var key;
  	var state = {
      "vl":{},
      "el":{}
    };
	
	if(isDefaultGrey){
		for(key in internalAdjListObject){
			state["vl"][key] = {};
	
			state["vl"][key]["cx"] = internalAdjListObject[key]["cx"];
			state["vl"][key]["cy"] = internalAdjListObject[key]["cy"];
			state["vl"][key]["text"] = key;
			state["vl"][key]["state"] = VERTEX_GREY_OUTLINE;
		}
		for(key in internalEdgeListObject){
			state["el"][key] = {};
	
		  state["el"][key]["vertexA"] = internalEdgeListObject[key]["vertexA"];
		  state["el"][key]["vertexB"] = internalEdgeListObject[key]["vertexB"];
		  state["el"][key]["type"] = EDGE_TYPE_UDE;
		  state["el"][key]["weight"] = internalEdgeListObject[key]["weight"];
		  state["el"][key]["state"] = EDGE_GREY;
		  state["el"][key]["displayWeight"] = true;
		  state["el"][key]["animateHighlighted"] = false;
		}
    } else {
	 	for(key in internalAdjListObject){
			state["vl"][key] = {};
	
			state["vl"][key]["cx"] = internalAdjListObject[key]["cx"];
			state["vl"][key]["cy"] = internalAdjListObject[key]["cy"];
			state["vl"][key]["text"] = key;
			state["vl"][key]["state"] = VERTEX_DEFAULT;
    	}
		for(key in internalEdgeListObject){
			state["el"][key] = {};
	
		  state["el"][key]["vertexA"] = internalEdgeListObject[key]["vertexA"];
		  state["el"][key]["vertexB"] = internalEdgeListObject[key]["vertexB"];
		  state["el"][key]["type"] = EDGE_TYPE_UDE;
		  state["el"][key]["weight"] = internalEdgeListObject[key]["weight"];
		  state["el"][key]["state"] = EDGE_DEFAULT;
		  state["el"][key]["displayWeight"] = true;
		  state["el"][key]["animateHighlighted"] = false;
		}
	}
	
	for(key in edgeQueued){
	  key1 = state["el"][key]["vertexA"];
	  key2 = state["el"][key]["vertexB"]
	  state["vl"][key1]["state"] = VERTEX_DEFAULT;
	  state["vl"][key2]["state"] = VERTEX_DEFAULT;
      state["el"][key]["state"] = EDGE_DEFAULT;
    }

    for(key in vertexHighlighted){
      state["vl"][key]["state"] = VERTEX_BLUE_FILL;
    }

    for(key in edgeHighlighted){
      state["el"][key]["state"] = EDGE_BLUE;
    }

    for(key in vertexTraversed){
      state["vl"][key]["state"] = VERTEX_GREEN_FILL;
    }

    for(key in edgeTraversed){
      state["el"][key]["state"] = EDGE_GREEN;
    }

  	return state;
  }

  function populatePseudocode(act) {
    switch (act) {
      case 0: // Prim's
        $('#code1').html('T = {s}');
        $('#code2').html('enqueue edges connected to s in PQ by weight');
        $('#code3').html('while (!PQ.isEmpty)');
        $('#code4').html('&nbsp;&nbsp;if (vertex v linked with e=PQ.remove is not in T)');
        $('#code5').html('&nbsp;&nbsp;&nbsp;&nbsp;T = T &cup; v, enqueue edges connected to v');
        $('#code6').html('&nbsp;&nbsp;else ignore e');
        $('#code7').html('T is an MST');
        break;
      case 1: // Kruskal's
        $('#code1').html('Sort E edges by increasing weight');
        $('#code2').html('T = empty set');
        $('#code3').html('for (i=0; i&lt;edgeList.length; i++)');
        $('#code4').html('&nbsp;&nbsp;if adding e=edgelist[i] does not form a cycle');
        $('#code5').html('&nbsp;&nbsp;&nbsp;&nbsp;add e to T');
        $('#code6').html('&nbsp;&nbsp;else ignore e');
        $('#code7').html('T is an MST');
        break;
    }
  }
}
