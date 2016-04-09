let canvas;
let ctx;

let rules = [4,3,2,1];

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
    constructor(x,y,dir) {
        this.x = x;
        this.y = y;
        this.dir = dir;

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
            this.x + dirs[this.dir][0] * 20,
            this.y + dirs[this.dir][1] * 20
        );
        ctx.stroke();

        this.x += dirs[this.dir][0] * 20;
        this.y += dirs[this.dir][1] * 20;

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
        return new Turtle(turtle.x,turtle.y,turtle.dir);
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
function step() {
    let now = new Date().getTime()
    let dt = now - (time || now);
    
    time = now;
    timer += dt;

    if (timer >= 500) {
        timer %= 500;

        move_turtles();

        branch();

        generation++;

        if (generation == 30) return;

        console.log(generation);
    }


    window.requestAnimationFrame(step);
}


function init () {
    canvas = document.getElementById("drawingboard");
    ctx = canvas.getContext("2d");

    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

    turtles[1] = new Turtle(
        Math.floor(canvas.width / 2),
        Math.floor(canvas.height / 2),
        7
    );

    window.requestAnimationFrame(step);
}




window.onload = init;