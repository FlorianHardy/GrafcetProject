<script>
function init() {
    if (window.goSamples) goSamples();  // init for these samples -- you don't need to call this
    var $ = go.GraphObject.make;

    myDiagram =
      $(go.Diagram, "myDiagram",
        {
          allowDrop: true,
          allowLink: false,
          initialContentAlignment: go.Spot.Center,
          "undoManager.isEnabled": true
        });

    // when the document is modified, add a "*" to the title and enable the "Save" button
    myDiagram.addDiagramListener("Modified", function(e) {
      var button = document.getElementById("saveModel");
      if (button) button.disabled = !myDiagram.isModified;
      var idx = document.title.indexOf("*");
      if (myDiagram.isModified) {
        if (idx < 0) document.title += "*";
      } else {
        if (idx >= 0) document.title = document.title.substr(0, idx); 
      }
    });

    // This implements an Adornment that is a bar of command buttons that appear when the user selects a node.
    // Each button has a click function to execute the command, a tooltip for a textual description,
    // and a Binding of "visible" to hide the button if it cannot be executed for that particular node.

    var commandsAdornment =
      $(go.Adornment, "Vertical",
        $(go.Panel, "Auto",
          $(go.Shape, { fill: null, stroke: "deepskyblue", strokeWidth: 2 }),
          $(go.Placeholder)
        ),
        $(go.Panel, "Horizontal",
          { defaultStretch: go.GraphObject.Vertical },
          $("Button",
            $(go.Shape,
              { geometryString: "M0 0 L10 0",
                fill: null, stroke: "red", margin: 3 }),
            { click: addExclusive, toolTip: makeTooltip("Add Exclusive") },
            new go.Binding("visible", "", canAddSplit).ofObject()),
          $("Button",
            $(go.Shape,
              { geometryString: "M0 0 L10 0 M0 3 10 3",
                fill: null, stroke: "red", margin: 3 }),
            { click: addParallel, toolTip: makeTooltip("Add Parallel") },
            new go.Binding("visible", "", canAddSplit).ofObject()),
          $("Button",
            $(go.Shape,
              { geometryString: "M0 0 L10 0 10 6 0 6z",
                fill: "lightyellow", margin: 3 }),
            { click: addStep, toolTip: makeTooltip("Add Step") },
            new go.Binding("visible", "", canAddStep).ofObject()),
          $("Button",
            $(go.Shape,
              { geometryString: "M0 0 M5 0 L5 10 M3 8 5 10 7 8 M10 0",
                fill: null, margin: 3 }),
            { click: startLinkDown, toolTip: makeTooltip("Draw Link Down") },
            new go.Binding("visible", "", canStartLink).ofObject()),
          $("Button",
            $(go.Shape,
              { geometryString: "M0 0 M3 0 L3 2 7 2 7 6 3 6 3 10 M1 8 3 10 5 8 M10 0",
                fill: null, margin: 3 }),
            { click: startLinkAround, toolTip: makeTooltip("Draw Link Skip") },
            new go.Binding("visible", "", canStartLink).ofObject()),
          $("Button",
            $(go.Shape,
              { geometryString: "M0 0 M3 2 L3 0 7 0 7 10 3 10 3 8 M5 6 7 4 9 6 M10 0",
                fill: null, margin: 3 }),
            { click: startLinkUp, toolTip: makeTooltip("Draw Link Repeat") },
            new go.Binding("visible", "", canStartLink).ofObject())
        )
      );

    function makeTooltip(str) {  // a helper function for defining tooltips for buttons
      return $(go.Adornment, go.Panel.Auto,
               $(go.Shape, { fill: "#FFFFCC" }),
               $(go.TextBlock, str, { margin: 4 }));
    }

    // Commands for adding new Nodes

    function addStep(e, obj) {
      var node = obj.part.adornedPart;
      var model = myDiagram.model;
      model.startTransaction("add Step");
      var loc = node.location.copy();
      loc.y += 50;
      var nodedata = { location: go.Point.stringify(loc) };
      model.addNodeData(nodedata);
      var nodekey = model.getKeyForNodeData(nodedata);
      var linkdata = { from: model.getKeyForNodeData(node.data), to: nodekey };
      model.addLinkData(linkdata);
      var newnode = myDiagram.findNodeForData(nodedata);
      myDiagram.select(newnode);
      model.commitTransaction("add Step");
    }

    function canAddStep(adorn) {
      var node = adorn.adornedPart;
      if (node.category === "" || node.category === "Start") {
        return node.findLinksOutOf().count === 0;
      } else if (node.category === "Parallel" || node.category === "Exclusive") {
        return true;
      }
      return false;
    }

    function addParallel(e, obj) { addSplit(obj.part.adornedPart, "Parallel"); }
    function addExclusive(e, obj) { addSplit(obj.part.adornedPart, "Exclusive"); }

    function addSplit(node, type) {
      var model = myDiagram.model;
      model.startTransaction("add " + type);
      var loc = node.location.copy();
      loc.y += 50;
      var nodedata = { category: type, location: go.Point.stringify(loc) };
      model.addNodeData(nodedata);
      var nodekey = model.getKeyForNodeData(nodedata);
      var linkdata = { from: model.getKeyForNodeData(node.data), to: nodekey };
      model.addLinkData(linkdata);
      var newnode = myDiagram.findNodeForData(nodedata);
      myDiagram.select(newnode);
      model.commitTransaction("add " + type);
    }

    function canAddSplit(adorn) {
      var node = adorn.adornedPart;
      if (node.category === "" || node.category === "Start") {
        return node.findLinksOutOf().count === 0;
      } else if (node.category === "Parallel" || node.category === "Exclusive") {
        return false;
      }
      return false;
    }

    // Commands for starting drawing new Links

    function startLinkDown(e, obj) { startLink(obj.part.adornedPart, ""); }
    function startLinkAround(e, obj) { startLink(obj.part.adornedPart, "Skip"); }
    function startLinkUp(e, obj) { startLink(obj.part.adornedPart, "Repeat"); }

    function startLink(node, category) {
      var tool = myDiagram.toolManager.linkingTool;
      tool.category = category;
      tool.startObject = node.port;
      myDiagram.currentTool = tool;
      tool.doActivate();
    }

    function canStartLink(adorn) {
      var node = adorn.adornedPart;
      return true;  // this could be smarter
    }


    // The various kinds of Nodes

    myDiagram.nodeTemplateMap.add("Start",
      $(go.Node, "Horizontal",
        {
          locationSpot: go.Spot.Center, locationObjectName: "STEPPANEL",
          selectionObjectName: "STEPPANEL", selectionAdornmentTemplate: commandsAdornment
        },
        new go.Binding("location", "location", go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Panel, "Auto",
          { name: "STEPPANEL", portId: "", fromSpot: go.Spot.Bottom, fromLinkable: true },
          $(go.Shape, { fill: "lightgreen" }),
          $(go.Panel, "Auto",
            { margin: 3 },
            $(go.Shape, { fill: null, minSize: new go.Size(20, 20) }),
            $(go.TextBlock, "Start",
              { margin: 3, editable: true },
              new go.Binding("text", "step").makeTwoWay())
          )
        ),
        $(go.Shape, "LineH", { width: 10, height: 1 }),
        $(go.Panel, "Auto",
          $(go.Shape, { fill: "white" }),
          $(go.TextBlock, "Action",
            { margin: 3, editable: true },
            new go.Binding("text", "text").makeTwoWay())
        )
      ));

    myDiagram.nodeTemplateMap.add("",
      $(go.Node, "Horizontal",
        {
          locationSpot: go.Spot.Center, locationObjectName: "STEPPANEL",
          selectionObjectName: "STEPPANEL", selectionAdornmentTemplate: commandsAdornment
        },
        new go.Binding("location", "location", go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Panel, "Auto",
          {
            name: "STEPPANEL", portId: "",
            fromSpot: go.Spot.Bottom, fromLinkable: true,
            toSpot: go.Spot.Top, toLinkable: true
          },
          $(go.Shape, { fill: "lightyellow", minSize: new go.Size(20, 20) }),
          $(go.TextBlock, "Step",
            { margin: 3, editable: true },
            new go.Binding("text", "step").makeTwoWay())
        ),
        $(go.Shape, "LineH", { width: 10, height: 1 }),
        $(go.Panel, "Auto",
          $(go.Shape, { fill: "white" }),
          $(go.TextBlock, "Action",
            { margin: 3, editable: true },
            new go.Binding("text", "text").makeTwoWay())
        )
      ));

    var resizeAdornment =
      $(go.Adornment, go.Panel.Spot,
        $(go.Placeholder),
        $(go.Shape,  // left resize handle
          { alignment: go.Spot.Left, cursor: "col-resize",
          desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "dodgerblue" }),
        $(go.Shape,  // right resize handle
          { alignment: go.Spot.Right, cursor: "col-resize",
            desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "dodgerblue" })
      );

    myDiagram.nodeTemplateMap.add("Parallel",
      $(go.Node,
        {
          locationSpot: go.Spot.Center,
          selectionObjectName: "STEPPANEL", selectionAdornmentTemplate: commandsAdornment,
          // special resizing: just at the ends
          resizable: true, resizeObjectName: "SHAPE",
          resizeAdornmentTemplate: resizeAdornment,
          fromLinkable: true, toLinkable: true },
        new go.Binding("location", "location", go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Shape,
          { name: "SHAPE",
            geometryString: "M0 0 L100 0 M0 4 L100 4",
            fill: "transparent", stroke: "red", width: 200 },
          new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify))
      ));

    myDiagram.nodeTemplateMap.add("Exclusive",
      $(go.Node,
        {
          locationSpot: go.Spot.Center,
          selectionObjectName: "STEPPANEL", selectionAdornmentTemplate: commandsAdornment,
          // special resizing: just at the ends
          resizable: true, resizeObjectName: "SHAPE",
          resizeAdornmentTemplate: resizeAdornment,
          fromLinkable: true, toLinkable: true
        },
        new go.Binding("location", "location", go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Shape,
          { name: "SHAPE",
            geometryString: "M0 0 L100 0",
            fill: "transparent", stroke: "red", width: 200 },
          new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify))
      ));

    // the various kinds of Links

    myDiagram.linkTemplateMap.add("",
      $(BarLink,  // subclass defined below
        { routing: go.Link.Orthogonal },
        $(go.Shape,
          { strokeWidth: 1.5 }),
        $(go.Shape, "LineH",  // only visible when there is text
          { width: 20, height: 1, visible: false },
          new go.Binding("visible", "text", function(t) { if (t) return true; else return false; })),
        $(go.TextBlock,  // only visible when there is text
          { alignmentFocus: new go.Spot(0, 0.5, -12, 0), editable: true },
          new go.Binding("text", "text").makeTwoWay(),
          new go.Binding("visible", "text", function(t) { if (t) return true; else return false; }))
      ));

    myDiagram.linkTemplateMap.add("Skip",
      $(go.Link,
        {
          routing: go.Link.AvoidsNodes,
          fromSpot: go.Spot.Bottom, toSpot: go.Spot.Top,
          fromEndSegmentLength: 4, toEndSegmentLength: 4
        },
        $(go.Shape,
          { strokeWidth: 1.5 }),
        $(go.Shape, "LineH",  // only visible when there is text
          { width: 20, height: 1, visible: false },
          new go.Binding("visible", "text", function(t) { if (t) return true; else return false; })),
        $(go.TextBlock,  // only visible when there is text
          { alignmentFocus: new go.Spot(1, 0.5, 12, 0), editable: true },
          new go.Binding("text", "text").makeTwoWay(),
          new go.Binding("visible", "text", function(t) { if (t) return true; else return false; }))
      ));

    myDiagram.linkTemplateMap.add("Repeat",
      $(go.Link,
        {
          routing: go.Link.AvoidsNodes,
          fromSpot: go.Spot.Bottom, toSpot: go.Spot.Top,
          fromEndSegmentLength: 4, toEndSegmentLength: 4
        },
        $(go.Shape,
          { strokeWidth: 1.5 }),
        $(go.Shape,
          { toArrow: "OpenTriangle", segmentIndex: 3, segmentFraction: 0.75 }),
        $(go.Shape,
          { toArrow: "OpenTriangle", segmentIndex: 3, segmentFraction: 0.25 }),
        $(go.Shape, "LineH",  // only visible when there is text
          { width: 20, height: 1, visible: false },
          new go.Binding("visible", "text", function(t) { if (t) return true; else return false; })),
        $(go.TextBlock,  // only visible when there is text
          { alignmentFocus: new go.Spot(1, 0.5, 12, 0), editable: true },
          new go.Binding("text", "text").makeTwoWay(),
          new go.Binding("visible", "text", function(t) { if (t) return true; else return false; }))
      ));

    myDiagram.toolManager.linkingTool = new CustomLinkingTool();

    // initialize Overview
    myOverview =
      $(go.Overview, "myOverview",
        { observed: myDiagram,
          contentAlignment: go.Spot.Center });

    // start off with a simple diagram
    load();
  }


  function CustomLinkingTool() {
    go.LinkingTool.call(this);
    this.category = "";
  }
  go.Diagram.inherit(CustomLinkingTool, go.LinkingTool);

  // user-drawn linking is normally disabled,
  // but needs to be turned on when using this tool
  CustomLinkingTool.prototype.doStart = function() {
    go.LinkingTool.prototype.doStart.call(this);
    this.diagram.allowLink = true;
  };

  CustomLinkingTool.prototype.doStop = function() {
    go.LinkingTool.prototype.doStop.call(this);
    this.diagram.allowLink = false;
  };

  CustomLinkingTool.prototype.insertLink = function(fromnode, fromport, tonode, toport) {
    var newlink = go.LinkingTool.prototype.insertLink.call(this, fromnode, fromport, tonode, toport);
    newlink.category = this.category;
    this.category = "";  // back to default
    return newlink;
  };


  // This custom Link class is smart about computing the link point and direction at "Parallel"
  // and "Exclusive" nodes.
  function BarLink() {
    go.Link.call(this);
  }
  go.Diagram.inherit(BarLink, go.Link);

  BarLink.prototype.getLinkPoint = function(node, port, spot, from, ortho, othernode, otherport) {
    var r = new go.Rect(port.getDocumentPoint(go.Spot.TopLeft),
                        port.getDocumentPoint(go.Spot.BottomRight));
    var op = otherport.getDocumentPoint(go.Spot.Center);
    var below = op.y > r.centerY;
    var y = below ? r.bottom : r.top;
    if (node.category === "Parallel" || node.category === "Exclusive") {
      if (op.x < r.left) return new go.Point(r.left, y);
      if (op.x > r.right) return new go.Point(r.right, y);
      return new go.Point(op.x, y);
    } else {
      return new go.Point(r.centerX, y);
    }
  };

  BarLink.prototype.getLinkDirection = function(node, port, linkpoint, spot, from, ortho, othernode, otherport) {
    var p = port.getDocumentPoint(go.Spot.Center);
    var op = otherport.getDocumentPoint(go.Spot.Center);
    var below = op.y > p.y;
    return below ? 90 : 270;
  };


  // save a model to and load a model from Json text, displayed below the Diagram
  function save() {
    document.getElementById("mySavedModel").value = myDiagram.model.toJson();
    myDiagram.isModified = false;
  }
  function load() {
    myDiagram.model = go.Model.fromJson(document.getElementById("mySavedModel").value);
  }
</script>