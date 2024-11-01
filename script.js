new Vue({
    el: "#app",
    data: function() {
      return {
        csv: null,
        selected: null,
        settings: {
          strokeColor: "#ff0000",
          width: 960,
          height: 2000
        }
      };
    },
    mounted: function() {
      var that = this;
  
      // load the data
  
      d3.csv(
        "https://s3-us-west-2.amazonaws.com/s.cdpn.io/229301/flare.csv",
        function(error, data) {
          if (error) throw error;
  
          // once this is set, the computed properties will automatically re-compute (root, tree, and then nodes & links…)
          that.csv = data;
        }
      );
    },
  
    computed: {
      // once we have the CSV loaded, the "root" will be calculated
      root: function() {
        var that = this;
  
        if (this.csv) {
          var stratify = d3.stratify().parentId(function(d) {
            return d.id.substring(0, d.id.lastIndexOf("."));
          });
          
          // attach the tree to the Vue data object
          return this.tree(
            stratify(that.csv).sort(function(a, b) {
              return a.height - b.height || a.id.localeCompare(b.id);
            })
          );
        }
      },
      // the "tree" is also a computed property so that it is always up to date when the width and height settings change
      tree: function() {
        return d3
          .cluster()
          .size([this.settings.height, this.settings.width - 160]);
      },
        // Instead of enter, update, exit, we mainly use computed properties and instead of "d3.data()" we can use array.map to create objects that hold class names, styles, and other attributes for each datum
      nodes: function() {
        var that = this;
        if (this.root) {
          return this.root.descendants().map(function(d) {
            return {
              id: d.id,
              r: 2.5,
              className: "node" +
                (d.children ? " node--internal" : " node--leaf"),
              text: d.id.substring(d.id.lastIndexOf(".") + 1),
              style: {
                transform: "translate(" + d.y + "px," + d.x + "px)"
              },
              textpos: {
                x: d.children ? -8 : 8,
                y: 3
              },
              textStyle: {
                textAnchor: d.children ? "end" : "start"
              }
            };
          });
        }
      },
        // Instead of enter, update, exit, we mainly use computed properties and instead of "d3.data()" we can use array.map to create objects that hold class names, styles, and other attributes for each datum
      links: function() {
        var that = this;
  
        if (this.root) {
          
          // here we’ll calculate the "d" attribute for each path that is then used in the template where we use "v-for" to loop through all of the links to create <path> elements
          
          return this.root.descendants().slice(1).map(function(d) {
            return {
              d: "M" + d.y + "," + d.x + "C" + (d.parent.y + 100) + "," + d.x + " " + (d.parent.y + 100) + "," + d.parent.x + " " + d.parent.y + "," + d.parent.x,
              // here we could of course calculate colors depending on data but for now all links share the same color from the settings object that we can manipulate using UI controls and v-model
              style: {
                stroke: that.settings.strokeColor
              }
            };
          });
        }
      }
    },
    methods: {
      select: function(id) {
        this.selected = id;
      }
    }
  });
  