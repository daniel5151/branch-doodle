(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var canvas = void 0;
var ctx = void 0;

// Neat design
// let rules = [4,3,2,1];
// let rules = [1,2,3,4];

// Finite
// let rules = [3,2,1,4];

var rules = [4, 3, 2, 1];
var uvars = {
    rules_string: "4,3,2,1",
    max_generations: 50,
    max_turtles: 500,
    speed: 4,
    line_size: 20,
    line_thickness: 2,
    reset: function reset() {
        init_graph();
    }
};

function parse_rules(new_rules) {
    rules = new_rules.split(",").map(function (x) {
        return parseInt(x);
    });
}

var dirs = [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]];

var turtlecount = 0;

var Turtle = function () {
    function Turtle(x, y, dir, v) {
        _classCallCheck(this, Turtle);

        this.x = x;
        this.y = y;
        this.dir = dir;
        this.v = v;

        this.id = turtlecount;
        turtlecount++;
    }

    _createClass(Turtle, [{
        key: "move",
        value: function move() {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + dirs[this.dir][0] * this.v, this.y + dirs[this.dir][1] * this.v);
            ctx.stroke();

            this.x += dirs[this.dir][0] * this.v;
            this.y += dirs[this.dir][1] * this.v;

            this.x = Math.floor(this.x);
            this.y = Math.floor(this.y);
        }
    }, {
        key: "right",
        value: function right() {
            if (this.dir == 0) this.dir = 8;
            this.dir--;

            return this;
        }
    }, {
        key: "left",
        value: function left() {
            if (this.dir == 7) this.dir = -1;
            this.dir++;

            return this;
        }
    }], [{
        key: "clone",
        value: function clone(turtle) {
            return new Turtle(turtle.x, turtle.y, turtle.dir, turtle.v);
        }
    }]);

    return Turtle;
}();

var turtles = {};

var taken_points = [];
var next_taken_points = [];

function move_turtles(dt) {
    for (var id in turtles) {
        turtles[id].move(dt);
    }
}

function branch() {
    for (var id in turtles) {
        var t = turtles[id];

        next_taken_points.push([t.x, t.y]);
    }

    var kill_list = [];
    var new_turtles = [];

    var _loop = function _loop(_id) {
        var t = turtles[_id];

        var taken = false;
        taken_points.forEach(function (p) {
            if (p[0] == t.x && p[1] == t.y) {
                taken = true;
                return;
            }
        });

        var duplicates = 0;
        next_taken_points.forEach(function (p) {
            if (p[0] == t.x && p[1] == t.y) {
                duplicates++;
            }
        });
        if (duplicates > 1) taken = true;

        if (!taken) {
            var move = rules[generation % rules.length];

            switch (move) {
                case 1:
                    new_turtles.push(Turtle.clone(t));
                    break;
                case 2:
                    new_turtles.push(Turtle.clone(t).left());
                    new_turtles.push(Turtle.clone(t).right());
                    break;
                case 3:
                    new_turtles.push(Turtle.clone(t).left());
                    new_turtles.push(Turtle.clone(t));
                    new_turtles.push(Turtle.clone(t).right());
                    break;
                case 4:
                    new_turtles.push(Turtle.clone(t).left().left());
                    new_turtles.push(Turtle.clone(t).left());
                    new_turtles.push(Turtle.clone(t).right());
                    new_turtles.push(Turtle.clone(t).right().right());
                    break;
                default:
                    alert("Sorry, you can only use 1-4.");
            }
        }

        kill_list.push(_id);
    };

    for (var _id in turtles) {
        _loop(_id);
    }

    kill_list.forEach(function (id) {
        delete turtles[id];
    });

    new_turtles.forEach(function (t) {
        turtles[t.id] = t;
    });

    taken_points = Object.assign([], next_taken_points);
}

var generation = 0;

var timer = 0;
var time = void 0;

var anim_frame = void 0;
function step() {
    var now = new Date().getTime();
    var dt = now - (time || now);

    time = now;
    timer += dt;

    if (timer >= 125 / uvars.speed) {
        timer %= 125 / uvars.speed;

        move_turtles();
        branch();

        generation++;

        if (Object.keys(turtles).length > uvars.max_turtles) return;
        if (generation > uvars.max_generations) return;
    }

    anim_frame = requestAnimationFrame(step);
}

function init_graph() {
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
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set line rendering properties
    ctx.strokeStyle = "black";
    ctx.lineWidth = uvars.line_thickness;

    // Parse any new rules
    parse_rules(uvars.rules_string);

    // clear turtle array
    Object.keys(turtles).forEach(function (id) {
        delete turtles[id];
    });
    turtles = {};

    // Spawn initial turtle facing up in the center
    turtles[1] = new Turtle(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2), 7, uvars.line_size);

    anim_frame = requestAnimationFrame(step);
}

function init() {
    canvas = document.getElementById("drawingboard");
    ctx = canvas.getContext("2d");

    var gui = new dat.GUI({ load: {
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
        } });
    gui.remember(uvars);

    var rule_controller = gui.add(uvars, 'rules_string');
    var size_controller = gui.add(uvars, 'line_size', 1, 30);
    gui.add(uvars, 'line_thickness', 1, 5);
    gui.add(uvars, 'speed', 1, 10);

    var constraint_folder = gui.addFolder('Constraints');
    constraint_folder.add(uvars, 'max_generations', 0, 500);
    constraint_folder.add(uvars, 'max_turtles', 0, 1000);

    constraint_folder.open();

    gui.add(uvars, 'reset');

    rule_controller.onFinishChange(function (new_rules) {
        // Fires when a controller loses focus.
        parse_rules(new_rules);
        console.log("The new value is " + new_rules);
        init_graph();
    });
    size_controller.onFinishChange(function (new_rules) {
        // Fires when a controller loses focus.
        uvars.line_size = Math.floor(uvars.line_size);
    });

    init_graph();
}

window.onload = init;

},{}]},{},[1]);
