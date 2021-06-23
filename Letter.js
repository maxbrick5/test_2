class Letter{

    

    
    constructor(myletter){
         this.char = myletter
         this.x = random(width)
         this.y = random(-100, -50)
         this.speed = random(4, 10)
    
        
        

    }

    fall(vel){

        textSize(20)
        this.y += this.speed*vel

        if(this.y > height) {
            this.y = random(-200,-100)
        }
        
    }

    show(){
        strokeWeight(1);
        fill(0)
    
        
        text(this.char, this.x, this.y)
            
        
    }



}



