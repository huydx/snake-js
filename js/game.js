//ultilities
Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
      if (this[i] === obj) {
        return true;
      }
     }
    return false;
}

function getat(row, col){
    var query = "[row='"+row+"'][col='"+col+"']";
    return $(query);   
}

window.boardsize = 13;

(function(){
  //game step 
  var Game = function(){
    this.snake_head = {row:5, col:5};
    this.snake_body = [this.snake_head];  
    this.snake_direction = 0;
    this.food = {row:-1, col:-1}
    this.timer = 0;
    this.fps = 10;
    this.keys = {
      LEFT: 37,
      UP: 38,
      RIGHT: 39,
      DOWN: 40  
    };  
    this.key_list = [37, 38, 39, 40];
  
    this.colorset = {
      SNAKE: "black",
      FOOD: "blue",
      BACKGROUND: "white"
    }
  };

  Game.prototype.set_food = function() {
    var self = this;
    //set food
    while(1) {
      var f_col=0, f_row=0;
      f_col = Math.floor((Math.random()*10)+1);
      f_row = Math.floor((Math.random()*10)+1);
      
      var elem = getat(f_row, f_col);

      if (elem.attr("type") === "snake" || elem.attr("type") === "food") 
        continue;//is snake body
      else {
        self.food = {row:f_row, col:f_col}; 
        break;
      }; 
    }
  }

  Game.prototype.key_handler = function(evt) {
    var self = this;
    var diff = self.snake_direction - evt.keyCode;
    if(self.key_list.contains(evt.keyCode)) {
      if (Math.abs(diff) != 2) {
        self.snake_direction = evt.keyCode;
      }
    }
  }
  
  Game.prototype.set_body = function() {
    var self = this;
    var direction = self.snake_direction;
     
    //set snake body
    len = this.snake_body.length;
    var head_row = self.snake_body[len-1].row, 
        head_col = self.snake_body[len-1].col;

    switch(direction) { //set head pos with direction
      case self.keys.LEFT: 
        head_col = head_col-1; 
        break;
      case self.keys.RIGHT: 
        head_col = head_col+1; 
        break;
      case self.keys.UP: 
        head_row = head_row-1; 
        break;
      case self.keys.DOWN: 
        head_row = head_row+1; 
        break;
      default: return;
    }
    
    var head_pos = getat(head_row, head_col);

    //check game over
    if(head_pos.attr("type") === "snake" ||
      head_row < 1 || head_col < 1 || head_row > boardsize || head_col > boardsize) {
      self.end_game(); 
      return;
    } 
    
    self.snake_body.push({row: head_row, col: head_col}); //push head
    len = self.snake_body.length;
    //if not get food
    if (head_pos.attr("type") !== "food")
      self.snake_body = self.snake_body.slice(1,len); //cut tail
    else {
      $("#score").html(parseInt($("#score").html()) + 1);
      self.set_food();
    }
    return true;
  }

  Game.prototype.step = function() {
    var self = this;

    //clear all cell color
    for (var i=1; i<=boardsize; i++) {
      for (var j=1; j<=boardsize; j++) {
        dom_el = getat(i, j);
        dom_el.css("background-color", this.colorset.BACKGROUND);
        dom_el.attr("type", "bkground");
      }  
    }
    //set food color
    food_dom = getat(self.food.row, self.food.col);
    food_dom.css("background-color", this.colorset.FOOD);
    food_dom.attr("type", "food");

    //set snake color
    var len = this.snake_body.length;
    for (var i=0; i<len; i++) {
      var row = self.snake_body[i].row;
      var col = self.snake_body[i].col;
      dom_el = getat(row, col);
      dom_el.css("background-color", this.colorset.SNAKE);
      dom_el.attr("type", "snake");
    } 
    //check constraint
    self.set_body(); 
  }
 
  Game.prototype.end_game = function() {
    var self = this;
    clearInterval(self.timer);
    $("#result").html("game end");
  } 

  Game.prototype.resume = function() {
    var self = this;
    setInterval(function(e){
      self.step();
    }, 200);
  }

  //export Game object
  window.Game = Game;
})();

$(document).ready(function(){
   //create table
  tbl = "";
  for(var i = 1; i <= boardsize; i++) {
    tbl += "<tr>";
    for (var j = 1; j <= boardsize; j++) {
      tbl += "<td type='' row='"+i+"' col='"+j+"'></td>";
    }
    tbl += "</tr>";
  }
  $("#gameboard").html(tbl);
  
  var snakeGame = new Game();
  snakeGame.set_food(); //set food for 1st time
  
  //binding key
  $('body').keydown(function(evt){
    snakeGame.key_handler(evt);  
  });
  
  //loop
  snakeGame.timer = 
    setInterval(function(e){
      snakeGame.step();
    }, 100);

  $("#stop").click(function(){snakeGame.end_game();});
  $("#reload").click(function(){location.reload();});
  $("#resume").click(function(){snakeGame.resume();});
});  

