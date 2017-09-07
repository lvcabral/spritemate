

class Preview
{

  constructor(window,config)
  {
    this.config = config;
    this.window = window;
    this.canvas_element = document.createElement('canvas');
    this.zoom = this.config.zoom_preview; // this.config.zoom;
    this.pixels_x = this.config.sprite_x;
    this.pixels_y = this.config.sprite_y;
    this.width = this.pixels_x * this.zoom;
    this.height = this.pixels_y * this.zoom;
    
    this.canvas_element.id = "preview";
    this.canvas_element.width = this.width;
    this.canvas_element.height = this.height;

    $("#window-"+this.window).append(this.canvas_element);

    this.canvas = this.canvas_element.getContext('2d');
   
  }

  get_width()
  {
    return this.width;
  }

  get_height()
  {
    return this.height;
  }

  update(sprite_data)
  {

    let x_grid_step = 1;
    if (sprite_data.multicolor) x_grid_step = 2;

    for (let i=0; i<this.pixels_x; i=i+x_grid_step)
    {
      for (let j=0; j<this.pixels_y; j++)
      {
        this.canvas.fillStyle = this.config.colors[sprite_data.pixels[j][i]];
        this.canvas.fillRect(i*this.zoom, j*this.zoom, this.pixels_x * x_grid_step, this.pixels_y);  
      }
    }

    var double_x = 1;
    var double_y = 1;

    if(sprite_data.double_x) double_x = 2;
    if(sprite_data.double_y) double_y = 2;

    $('#preview').css('width',this.width * double_x);
    $('#preview').css('height',this.height * double_y);
  }



}


