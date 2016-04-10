let canvas;
let ctx;

// Neat design
// let rules = [4,3,2,1];
// let rules = [1,2,3,4];

// Finite
// let rules = [3,2,1,4];

let rules = [4,3,2,1]
let uvars = {
    rules_string: "4,3,2,1",
    max_generations: 50,
    max_turtles: 500,
    speed:4,
    line_size:20,
    line_thickness: 2,
    reset:function () { init_graph() }
}

function parse_rules (new_rules) {
    rules = new_rules.split(",").map(x => parseInt(x));
}


let dirs = [
    [-1,-1],
    [-1,0],
    [-1,1],
    [0,1],
    [1,1],
    [1,0],
    [1,-1],
    [0,-1]
];

let turtlecount = 0;
class Turtle {
    constructor(x,y,dir,v) {
        this.x = x;
        this.y = y;
        this.dir = dir;
        this.v = v;

        this.id = turtlecount;
        turtlecount++;
    };

    move() {
        ctx.beginPath();
        ctx.moveTo(
            this.x,
            this.y
        );
        ctx.lineTo(
            this.x + dirs[this.dir][0] * this.v,
            this.y + dirs[this.dir][1] * this.v
        );
        ctx.stroke();

        this.x += dirs[this.dir][0] * this.v;
        this.y += dirs[this.dir][1] * this.v;

        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
    }

    right () {
        if (this.dir == 0) this.dir = 8;
        this.dir--;

        return this;
    };

    left () {
        if (this.dir == 7) this.dir = -1;
        this.dir++;

        return this;
    };

    static clone (turtle) {
        return new Turtle(turtle.x,turtle.y,turtle.dir,turtle.v);
    }
}

let turtles = {};

let taken_points = [];
let next_taken_points = [];

function move_turtles (dt) {
    for (let id in turtles) {
        turtles[id].move(dt);
    }
}

function branch () {
    for (let id in turtles) {
        let t = turtles[id];

        next_taken_points.push([
            t.x,
            t.y
        ]);
    }

    let kill_list = [];
    let new_turtles = [];
    
    for (let id in turtles) {
        let t = turtles[id];

        let taken = false;
        taken_points.forEach(p => {
            if (p[0] == t.x && p[1] == t.y) {
                taken = true;
                return;
            }
        });

        let duplicates = 0;
        next_taken_points.forEach(p => {
            if (p[0] == t.x && p[1] == t.y) {
                duplicates++;
            }
        });
        if (duplicates > 1) taken = true;

        if (!taken) {
            let move = rules[generation % rules.length];

            switch (move) {
                case 1:
                    new_turtles.push( Turtle.clone(t) );
                    break;
                case 2:
                    new_turtles.push( Turtle.clone(t).left()  );
                    new_turtles.push( Turtle.clone(t).right() );
                    break;
                case 3:
                    new_turtles.push( Turtle.clone(t).left()  );
                    new_turtles.push( Turtle.clone(t)         );
                    new_turtles.push( Turtle.clone(t).right() );
                    break;
                case 4:
                    new_turtles.push( Turtle.clone(t).left().left()   );
                    new_turtles.push( Turtle.clone(t).left()          );
                    new_turtles.push( Turtle.clone(t).right()         );
                    new_turtles.push( Turtle.clone(t).right().right() );
                    break;
                default:
                    alert("Sorry, you can only use 1-4.");
            }
        }

        kill_list.push(id);
    }

    kill_list.forEach(id => { delete turtles[id]; });

    new_turtles.forEach(t => {
        turtles[t.id] = t;
    });

    taken_points = Object.assign([],next_taken_points);
}

let generation = 0;

let timer = 0;
let time;

let anim_frame;
function step() {
    let now = new Date().getTime()
    let dt = now - (time || now);
    
    time = now;
    timer += dt;

    if (timer >= 125/uvars.speed) {
        timer %= 125/uvars.speed;

        move_turtles();
        branch();

        generation++;

        if (Object.keys(turtles).length > uvars.max_turtles    ) return;
        if (generation                  > uvars.max_generations) return;
    }

    anim_frame = requestAnimationFrame(step);
}

function init_graph () {
    // cancel any existing animation routines
    window.cancelAnimationFrame(anim_frame);
    timer = 0;
    time = 0;
    generation = 0;
    taken_points = [];
    next_taken_points = [];

    // Resize the canvas
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;

    // Clear Canvas
    ctx.fillStyle = "white";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // Set line rendering properties
    ctx.strokeStyle = "black";
    ctx.lineWidth = uvars.line_thickness;

    // Parse any new rules
    parse_rules(uvars.rules_string);

    // clear turtle array
    Object.keys(turtles).forEach(id => {delete turtles[id]});
    turtles = {};

    // Spawn initial turtle facing up in the center
    turtles[1] = new Turtle(
        Math.floor(canvas.width / 2),
        Math.floor(canvas.height / 2),
        7,
        uvars.line_size
    );
    
    anim_frame = requestAnimationFrame(step);
}

function init () {
    canvas = document.getElementById("drawingboard");
    ctx = canvas.getContext("2d");

    let gui = new dat.GUI({load:{
      "preset": "Lanes",
      "remembered": {
        "Lanes": {
          "0": {
            "rules_string": "4,3,2,1",
            "line_size": 20,
            "line_thickness": 2,
            "speed": 4,
            "max_generations": 50,
            "max_turtles": 500
          }
        },
        "Finite": {
          "0": {
            "rules_string": "3,2,1,4",
            "line_size": 20,
            "line_thickness": 2,
            "speed": 4,
            "max_generations": 50,
            "max_turtles": 500
          }
        }
      },
      "closed": false,
      "folders": {
        "Constraints": {
          "preset": "Default",
          "closed": false,
          "folders": {}
        }
      }
    }});
    gui.remember(uvars);

    let rule_controller = gui.add(uvars, 'rules_string');
    let size_controller = gui.add(uvars, 'line_size',1,30);
    gui.add(uvars, 'line_thickness',1,5);
    gui.add(uvars, 'speed',1,10);

    var constraint_folder = gui.addFolder('Constraints');
    constraint_folder.add(uvars, 'max_generations',0,500);
    constraint_folder.add(uvars, 'max_turtles',0,1000);

    constraint_folder.open();

    gui.add(uvars, 'reset');

    rule_controller.onFinishChange(function(new_rules) {
        // Fires when a controller loses focus.
        parse_rules(new_rules);
        console.log("The new value is " + new_rules);
        init_graph();
    });
    size_controller.onFinishChange(function(new_rules) {
        // Fires when a controller loses focus.
        uvars.line_size = Math.floor(uvars.line_size);
    });

    init_graph();
}

window.onload = init;

// An Object.assign polyfill
if (typeof Object.assign != 'function') {
  (function () {
    Object.assign = function (target) {
      'use strict';
      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var output = Object(target);
      for (var index = 1; index < arguments.length; index++) {
        var source = arguments[index];
        if (source !== undefined && source !== null) {
          for (var nextKey in source) {
            if (source.hasOwnProperty(nextKey)) {
              output[nextKey] = source[nextKey];
            }
          }
        }
      }
      return output;
    };
  })();
}